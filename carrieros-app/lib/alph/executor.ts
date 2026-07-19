import { ALPH_DEMO_TODAY } from "@/lib/alph/intents";
import { parseAlphCommand } from "@/lib/alph/parser";
import {
  alphPermissionDeniedResult,
  annotateAlphCriticalAssist,
  gateAlphIntent,
} from "@/lib/alph/security";
import type {
  AlphParsedCommand,
  AlphResult,
  AlphResultAction,
} from "@/lib/alph/types";
import { answerEldAlphQuestion, type EldAlphQuestionKind } from "@/lib/eld";
import { alphHelpAnswer, getSupportStore } from "@/lib/support";
import { listBrokersByTenant } from "@/lib/data/brokers";
import { driverStore } from "@/lib/data/driver-store";
import { truckStore } from "@/lib/data/fleet-store";
import {
  listInvoices,
  listOwnerSettlements,
  listRevenue,
} from "@/lib/data/finance-store";
import { loads as seedLoads } from "@/lib/data/loads";
import { getActiveTenantId } from "@/lib/data/tenant";
import { dispatchBoardSeedLoads } from "@/lib/dispatch/demo-loads";
import { computeDocumentHealthForLoads } from "@/lib/documents/document-health";
import { getDriverOperationalStatus } from "@/lib/drivers/driver-board";
import { formatFinanceMoney } from "@/lib/finance/finance-board";
import type { Driver, Load, Truck } from "@/lib/types";

const ALL_LOADS: Load[] = [...seedLoads, ...dispatchBoardSeedLoads];

function money(amount: number): string {
  return formatFinanceMoney(amount);
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(`${fromIso.slice(0, 10)}T12:00:00Z`).getTime();
  const to = new Date(`${toIso.slice(0, 10)}T12:00:00Z`).getTime();
  return Math.floor((to - from) / (24 * 60 * 60 * 1000));
}

function fuzzyScore(haystack: string, needle: string): number {
  const h = haystack.toLowerCase().trim();
  const n = needle.toLowerCase().trim();
  if (!n) return 0;
  if (h === n) return 1;
  if (h.includes(n)) return 0.92;

  const hTokens = h.split(/\s+/).filter(Boolean);
  const nTokens = n.split(/\s+/).filter(Boolean);
  if (hTokens.length === 0 || nTokens.length === 0) return 0;

  let matched = 0;
  for (const token of nTokens) {
    if (token.length < 2) continue;
    const hit = hTokens.some((ht) => {
      if (ht === token) return true;
      // Initials / short nicknames: only exact token equality above
      if (token.length < 4) return false;
      return ht.startsWith(token) || token.startsWith(ht);
    });
    if (hit) matched += 1;
  }

  return matched / nTokens.length;
}

function findDriversByName(
  name: string,
  tenantId: string,
): Array<{ driver: Driver; score: number }> {
  const tokenCount = name.trim().split(/\s+/).filter(Boolean).length;
  const minScore = tokenCount >= 2 ? 0.85 : 0.55;

  return driverStore
    .filter((d) => d.tenantId === tenantId)
    .map((driver) => ({ driver, score: fuzzyScore(driver.name, name) }))
    .filter((entry) => entry.score >= minScore)
    .sort((a, b) => b.score - a.score);
}

function findTruckByUnit(unit: string, tenantId: string): Truck | undefined {
  const normalized = unit.replace(/^0+/, "");
  const trucks = truckStore.filter((t) => t.tenantId === tenantId);

  return (
    trucks.find((t) => t.unitNumber === unit) ??
    trucks.find((t) => t.unitNumber === normalized) ??
    trucks.find((t) => t.unitNumber.includes(unit)) ??
    trucks.find((t) => unit.includes(t.unitNumber))
  );
}

function findActiveLoadForTruck(truckId: string, tenantId: string): Load | undefined {
  const active = new Set<Load["status"]>([
    "dispatched",
    "picked_up",
    "in_transit",
  ]);

  return (
    ALL_LOADS.find(
      (load) =>
        load.tenantId === tenantId &&
        load.truckId === truckId &&
        active.has(load.status),
    ) ??
    ALL_LOADS.find(
      (load) => load.tenantId === tenantId && load.truckId === truckId,
    )
  );
}

function findLoadByReference(ref: string, tenantId: string): Load | undefined {
  const needle = ref.replace(/^ld-?/i, "").toLowerCase();
  return ALL_LOADS.find((load) => {
    if (load.tenantId !== tenantId) return false;
    const r = load.reference.replace(/^LD-/i, "").toLowerCase();
    return r === needle || load.id.toLowerCase().includes(needle);
  });
}

function navigateResult(
  parsed: AlphParsedCommand,
  title: string,
  href: string,
  body?: string,
  actions?: AlphResultAction[],
): AlphResult {
  return {
    type: "navigate",
    title,
    body,
    href,
    confidence: parsed.confidence,
    intent: parsed.intent,
    actions: actions ?? [
      { label: "Open", href, primary: true },
    ],
  };
}

function answerResult(
  parsed: AlphParsedCommand,
  title: string,
  body: string,
  options?: {
    href?: string;
    actions?: AlphResultAction[];
    data?: Record<string, unknown>;
  },
): AlphResult {
  return {
    type: "answer",
    title,
    body,
    href: options?.href,
    confidence: parsed.confidence,
    intent: parsed.intent,
    actions: options?.actions,
    data: options?.data,
  };
}

function clarifyResult(
  parsed: AlphParsedCommand,
  title: string,
  body: string,
  actions?: AlphResultAction[],
): AlphResult {
  return {
    type: "clarify",
    title,
    body,
    confidence: Math.min(parsed.confidence, 0.45),
    intent: parsed.intent,
    actions,
  };
}

function executeShowLoads(parsed: AlphParsedCommand, tenantId: string): AlphResult {
  const today = ALPH_DEMO_TODAY;
  const dateHint = parsed.entities.dateHint;
  const state = parsed.entities.state?.toUpperCase();

  if (state) {
    const inState = ALL_LOADS.filter((load) => {
      if (load.tenantId !== tenantId) return false;
      return (
        load.origin.state.toUpperCase() === state ||
        load.destination.state.toUpperCase() === state
      );
    });
    const href = `/loads?q=${encodeURIComponent(state)}`;
    return answerResult(
      parsed,
      inState.length > 0
        ? `${inState.length} load${inState.length === 1 ? "" : "s"} in ${state}`
        : `No loads found in ${state}`,
      inState.length > 0
        ? inState
            .slice(0, 4)
            .map(
              (load) =>
                `${load.reference} · ${load.origin.city}, ${load.origin.state} → ${load.destination.city}, ${load.destination.state}`,
            )
            .join("\n") +
            (inState.length > 4 ? `\n+${inState.length - 4} more` : "")
        : `Opening Dispatch filtered for ${state}.`,
      {
        href,
        actions: [
          { label: `Open ${state} loads`, href, primary: true },
          { label: "All loads", href: "/loads" },
        ],
        data: { count: inState.length, state },
      },
    );
  }

  if (dateHint === "today") {
    const todays = ALL_LOADS.filter(
      (load) =>
        load.tenantId === tenantId &&
        (load.pickupDate === today || load.deliveryDate === today),
    );
    const href = `/loads?from=${today}&to=${today}`;
    return answerResult(
      parsed,
      todays.length > 0
        ? `${todays.length} load${todays.length === 1 ? "" : "s"} for today`
        : "No loads scheduled for today",
      todays.length > 0
        ? todays
            .slice(0, 4)
            .map(
              (load) =>
                `${load.reference} · ${load.origin.city} → ${load.destination.city}`,
            )
            .join("\n") +
            (todays.length > 4 ? `\n+${todays.length - 4} more` : "")
        : "Opening Dispatch filtered to today's pickup and delivery window.",
      {
        href,
        actions: [
          { label: "Open today's loads", href, primary: true },
          { label: "All loads", href: "/loads" },
        ],
        data: { count: todays.length, date: today },
      },
    );
  }

  return navigateResult(
    parsed,
    "Opening Dispatch",
    "/loads",
    "Showing the full load board.",
  );
}

function executeOpenBroker(parsed: AlphParsedCommand, tenantId: string): AlphResult {
  const name = parsed.entities.brokerName;
  if (!name) {
    return navigateResult(parsed, "Opening brokers", "/brokers");
  }

  const brokers = listBrokersByTenant(tenantId)
    .map((broker) => ({ broker, score: fuzzyScore(broker.name, name) }))
    .filter((entry) => entry.score >= 0.55)
    .sort((a, b) => b.score - a.score);

  if (brokers.length === 0) {
    return clarifyResult(
      parsed,
      `No broker matched "${name}"`,
      "Check the spelling, or open the broker roster.",
      [{ label: "Open brokers", href: "/brokers", primary: true }],
    );
  }

  const best = brokers[0];
  if (best.score < 0.85 || (brokers.length > 1 && best.score < 0.95)) {
    return clarifyResult(
      parsed,
      "Did you mean one of these brokers?",
      brokers
        .slice(0, 4)
        .map((entry) => entry.broker.name)
        .join("\n"),
      brokers.slice(0, 3).map((entry, index) => ({
        label: entry.broker.name,
        href: `/brokers/${entry.broker.id}`,
        primary: index === 0,
      })),
    );
  }

  const broker = best.broker;
  return navigateResult(
    parsed,
    broker.name,
    `/brokers/${broker.id}`,
    broker.mcNumber
      ? `MC ${broker.mcNumber} · ${broker.homeBase}`
      : broker.homeBase,
  );
}

function executeFindDrivers(parsed: AlphParsedCommand, tenantId: string): AlphResult {
  const city = parsed.entities.city;
  const drivers = driverStore.filter((d) => d.tenantId === tenantId);
  const available = drivers.filter(
    (driver) => getDriverOperationalStatus(driver, ALL_LOADS) === "available",
  );

  const nearCity = city
    ? available.filter((driver) =>
        driver.location.toLowerCase().includes(city.toLowerCase()),
      )
    : available;

  if (city && nearCity.length === 0) {
    const elsewhere = available.slice(0, 4);
    const href = `/drivers`;
    return answerResult(
      parsed,
      `No available drivers near ${city}`,
      elsewhere.length > 0
        ? `Closest available now:\n${elsewhere
            .map((d) => `${d.name} · ${d.location}`)
            .join("\n")}`
        : "No drivers are marked available right now.",
      {
        href,
        actions: [
          { label: "Open drivers", href, primary: true },
          { label: "Dispatch board", href: "/loads" },
        ],
        data: { city, availableCount: available.length },
      },
    );
  }

  const list = (city ? nearCity : available).slice(0, 5);
  const href = city ? `/drivers` : "/drivers";
  return answerResult(
    parsed,
    city
      ? `${list.length} available near ${city}`
      : `${available.length} available drivers`,
    list.length > 0
      ? list.map((d) => `${d.name} · ${d.location}`).join("\n")
      : "No available drivers right now.",
    {
      href,
      actions: [{ label: "Open drivers", href, primary: true }],
      data: { city, count: list.length },
    },
  );
}

function executeReplayTruck(parsed: AlphParsedCommand, tenantId: string): AlphResult {
  const unit = parsed.entities.truckUnit;
  if (!unit) {
    return clarifyResult(
      parsed,
      "Which truck should I replay?",
      'Try "Replay Truck 102" with a unit number.',
      [
        { label: "Fleet trucks", href: "/fleet/trucks", primary: true },
      ],
    );
  }

  const truck = findTruckByUnit(unit, tenantId);
  if (!truck) {
    const samples = truckStore
      .filter((t) => t.tenantId === tenantId)
      .slice(0, 5)
      .map((t) => t.unitNumber);
    return clarifyResult(
      parsed,
      `I couldn't find Truck ${unit}`,
      samples.length > 0
        ? `Try one of these units: ${samples.join(", ")}`
        : "Open Fleet to pick a truck.",
      [
        { label: "Open fleet", href: "/fleet/trucks", primary: true },
      ],
    );
  }

  const load = findActiveLoadForTruck(truck.id, tenantId);
  if (load) {
    const href = `/loads/${load.id}/tracking/replay`;
    return navigateResult(
      parsed,
      `Replay Truck ${truck.unitNumber}`,
      href,
      `${load.reference} · ${load.origin.city} → ${load.destination.city}`,
      [
        { label: "Open replay", href, primary: true },
        { label: "Truck page", href: `/fleet/trucks/${truck.id}` },
      ],
    );
  }

  const href = `/fleet/trucks/${truck.id}`;
  return navigateResult(
    parsed,
    `Truck ${truck.unitNumber}`,
    href,
    "No active load with tracking replay — opening the truck page instead.",
    [
      { label: "Open truck", href, primary: true },
      { label: "Maintenance", href: "/fleet/maintenance" },
    ],
  );
}

function executeOpenDriver(parsed: AlphParsedCommand, tenantId: string): AlphResult {
  const name = parsed.entities.driverName;
  if (!name) {
    return clarifyResult(
      parsed,
      "Which driver?",
      'Try "Open Driver Onkar Singh".',
      [{ label: "Drivers", href: "/drivers", primary: true }],
    );
  }

  const matches = findDriversByName(name, tenantId);
  if (matches.length === 0) {
    return clarifyResult(
      parsed,
      `No driver matched "${name}"`,
      "Check the spelling, or open the roster to browse.",
      [{ label: "Open drivers", href: "/drivers", primary: true }],
    );
  }

  const best = matches[0];
  if (best.score < 0.85 || (matches.length > 1 && best.score < 0.95)) {
    return clarifyResult(
      parsed,
      "Did you mean one of these drivers?",
      matches
        .slice(0, 4)
        .map((entry) => entry.driver.name)
        .join("\n"),
      matches.slice(0, 3).map((entry, index) => ({
        label: entry.driver.name,
        href: `/drivers/${entry.driver.id}`,
        primary: index === 0,
      })),
    );
  }

  const driver = best.driver;
  return navigateResult(
    parsed,
    driver.name,
    `/drivers/${driver.id}`,
    `${driver.location} · ${driver.phone}`,
  );
}

function executeOpenLoad(parsed: AlphParsedCommand, tenantId: string): AlphResult {
  const ref = parsed.entities.loadReference;
  if (!ref) {
    return navigateResult(parsed, "Opening Dispatch", "/loads");
  }

  const load = findLoadByReference(ref, tenantId);
  if (!load) {
    return clarifyResult(
      parsed,
      `Load ${ref} not found`,
      "Try another reference, or open Dispatch to search.",
      [{ label: "Dispatch", href: "/loads", primary: true }],
    );
  }

  return navigateResult(
    parsed,
    `Load ${load.reference.replace(/^LD-/i, "")}`,
    `/loads/${load.id}`,
    `${load.origin.city} → ${load.destination.city}`,
  );
}

function executeOpenTruck(parsed: AlphParsedCommand, tenantId: string): AlphResult {
  const unit = parsed.entities.truckUnit;
  if (!unit) {
    return navigateResult(parsed, "Opening fleet trucks", "/fleet/trucks");
  }

  const truck = findTruckByUnit(unit, tenantId);
  if (!truck) {
    return clarifyResult(
      parsed,
      `Truck ${unit} not found`,
      "Open Fleet to browse units.",
      [{ label: "Fleet trucks", href: "/fleet/trucks", primary: true }],
    );
  }

  return navigateResult(
    parsed,
    `Truck ${truck.unitNumber}`,
    `/fleet/trucks/${truck.id}`,
    `${truck.year} ${truck.make} ${truck.model} · ${truck.location}`,
  );
}

function executeBestBroker(parsed: AlphParsedCommand, tenantId: string): AlphResult {
  const brokers = listBrokersByTenant(tenantId);
  if (brokers.length === 0) {
    return navigateResult(parsed, "Opening brokers", "/brokers");
  }

  const ranked = [...brokers].sort((a, b) => {
    const scoreA =
      (a.performanceScore ?? 0) * 2 +
      a.totalRevenue / 10000 -
      a.avgPaymentDays;
    const scoreB =
      (b.performanceScore ?? 0) * 2 +
      b.totalRevenue / 10000 -
      b.avgPaymentDays;
    return scoreB - scoreA;
  });
  const best = ranked[0];
  const href = `/brokers/${best.id}`;

  return answerResult(
    parsed,
    best.name,
    `Performance ${best.performanceScore} · ${money(best.totalRevenue)} lifetime · avg pay ${best.avgPaymentDays} days`,
    {
      href,
      actions: [
        { label: "Open broker", href, primary: true },
        { label: "All brokers", href: "/brokers" },
      ],
      data: {
        brokerId: best.id,
        performanceScore: best.performanceScore,
        totalRevenue: best.totalRevenue,
      },
    },
  );
}

function executeTopProfitTruck(parsed: AlphParsedCommand, tenantId: string): AlphResult {
  const settlements = listOwnerSettlements(tenantId);
  const byTruck = new Map<string, { truckId: string; profit: number }>();

  for (const row of settlements) {
    if (!row.truckId) continue;
    const current = byTruck.get(row.truckId) ?? { truckId: row.truckId, profit: 0 };
    current.profit += row.profit;
    byTruck.set(row.truckId, current);
  }

  // Fallback: sum revenue by truck when settlements are thin
  if (byTruck.size === 0) {
    for (const rev of listRevenue(tenantId)) {
      if (!rev.truckId) continue;
      const current = byTruck.get(rev.truckId) ?? {
        truckId: rev.truckId,
        profit: 0,
      };
      current.profit += rev.amount;
      byTruck.set(rev.truckId, current);
    }
  }

  const ranked = [...byTruck.values()].sort((a, b) => b.profit - a.profit);
  const top = ranked[0];
  if (!top) {
    return navigateResult(
      parsed,
      "Opening finance",
      "/finance",
      "Not enough profit data yet — open Finance for the full picture.",
    );
  }

  const truck = truckStore.find((t) => t.id === top.truckId);
  const unit = truck?.unitNumber ?? top.truckId.replace("truck-", "");
  const href = truck ? `/fleet/trucks/${truck.id}` : "/fleet/trucks";

  return answerResult(
    parsed,
    `Truck ${unit} leads on profit`,
    `${money(top.profit)} net from owner settlements and haul revenue.`,
    {
      href,
      actions: [
        { label: "Open truck", href, primary: true },
        { label: "Finance", href: "/finance" },
      ],
      data: { truckId: top.truckId, profit: top.profit },
    },
  );
}

function executeUnpaidInvoices(parsed: AlphParsedCommand, tenantId: string): AlphResult {
  const days = parsed.entities.days ?? 30;
  const today = ALPH_DEMO_TODAY;
  const invoices = listInvoices(tenantId).filter((invoice) => {
    if (invoice.status === "paid") return false;
    const age = daysBetween(invoice.dueDate, today);
    const unpaid = invoice.amount - invoice.amountPaid;
    return unpaid > 0 && (invoice.status === "overdue" || age >= days);
  });

  const total = invoices.reduce(
    (sum, invoice) => sum + (invoice.amount - invoice.amountPaid),
    0,
  );
  const href = "/finance?tab=invoices";

  return answerResult(
    parsed,
    invoices.length > 0
      ? `${invoices.length} unpaid invoice${invoices.length === 1 ? "" : "s"} over ${days} days`
      : `No unpaid invoices over ${days} days`,
    invoices.length > 0
      ? `${money(total)} outstanding\n` +
          invoices
            .slice(0, 4)
            .map(
              (invoice) =>
                `${invoice.invoiceNumber} · ${invoice.brokerName} · ${money(
                  invoice.amount - invoice.amountPaid,
                )}`,
            )
            .join("\n")
      : "Cash looks clean on this window. Opening Invoices to double-check.",
    {
      href,
      actions: [
        { label: "Open invoices", href, primary: true },
        { label: "Finance home", href: "/finance" },
      ],
      data: { count: invoices.length, total, days },
    },
  );
}

function executeMissingPod(parsed: AlphParsedCommand, tenantId: string): AlphResult {
  const loads = ALL_LOADS.filter((load) => load.tenantId === tenantId);
  const snapshots = computeDocumentHealthForLoads(loads);
  const missing = snapshots.filter((snap) => {
    const podIssue = snap.issues.some(
      (issue) =>
        issue.documentKind === "pod" &&
        (issue.kind === "missing" || issue.severity === "critical"),
    );
    const podChecklist = snap.checklist.find((item) => item.kind === "pod");
    return (
      podIssue ||
      podChecklist?.status === "missing" ||
      (snap.score.level === "critical" && snap.missingRequiredCount > 0)
    );
  });

  const critical = snapshots
    .filter((snap) => snap.score.level === "critical")
    .sort((a, b) => b.criticalCount - a.criticalCount);

  const href = "/documents/health";
  const highlight = (missing.length > 0 ? missing : critical).slice(0, 4);

  return answerResult(
    parsed,
    missing.length > 0
      ? `${missing.length} load${missing.length === 1 ? "" : "s"} missing POD`
      : "No critical POD gaps right now",
    highlight.length > 0
      ? highlight
          .map(
            (snap) =>
              `${snap.loadReference} · ${snap.score.level}${
                snap.missingRequiredCount > 0
                  ? ` · ${snap.missingRequiredCount} missing`
                  : ""
              }`,
          )
          .join("\n")
      : "Document Health looks clear. Opening the board sorted by urgency.",
    {
      href,
      actions: [
        { label: "Document Health", href, primary: true },
        { label: "Document Center", href: "/documents" },
      ],
      data: { missingCount: missing.length, criticalCount: critical.length },
    },
  );
}

function executeMorningBriefing(parsed: AlphParsedCommand, tenantId: string): AlphResult {
  const overdue = listInvoices(tenantId).filter((i) => i.status === "overdue");
  const available = driverStore.filter(
    (d) =>
      d.tenantId === tenantId &&
      getDriverOperationalStatus(d, ALL_LOADS) === "available",
  ).length;
  const activeLoads = ALL_LOADS.filter(
    (l) =>
      l.tenantId === tenantId &&
      (l.status === "in_transit" || l.status === "dispatched"),
  ).length;

  return answerResult(
    parsed,
    "Morning briefing",
    `${activeLoads} loads moving · ${available} drivers available · ${overdue.length} overdue invoice${overdue.length === 1 ? "" : "s"}`,
    {
      href: "/",
      actions: [
        { label: "Alph workspace", href: "/", primary: true },
        { label: "Dispatch", href: "/loads" },
        { label: "Finance", href: "/finance" },
      ],
    },
  );
}

export function executeAlphCommand(
  parsed: AlphParsedCommand,
  tenantId: string = getActiveTenantId(),
): AlphResult {
  if (parsed.confidence < 0.4 && parsed.intent === "unknown") {
    return clarifyResult(
      parsed,
      "I need a clearer ask",
      'Try "Show today\'s loads", "Generate payroll", or "Who is my best broker?"',
      [
          { label: "Open Alph", href: "/", primary: true },
        { label: "Dispatch", href: "/loads" },
      ],
    );
  }

  switch (parsed.intent) {
    case "show_loads":
      return executeShowLoads(parsed, tenantId);
    case "find_drivers":
      return executeFindDrivers(parsed, tenantId);
    case "generate_payroll":
      return navigateResult(
        parsed,
        "Generate payroll",
        "/finance?tab=payroll",
        "Opening Finance → Payroll to run settlements.",
        [
          { label: "Open payroll", href: "/finance?tab=payroll", primary: true },
          { label: "Payroll page", href: "/payroll" },
        ],
      );
    case "generate_ifta":
      return navigateResult(
        parsed,
        "Generate IFTA",
        "/ifta",
        "Opening IFTA to prepare your fuel tax filing.",
        [
          { label: "Open IFTA", href: "/ifta", primary: true },
          { label: "Accountant view", href: "/ifta/accountant" },
        ],
      );
    case "create_invoice":
      return navigateResult(
        parsed,
        "Create invoice",
        "/finance?tab=invoices",
        "Opening Invoices — use AI generator or create from a delivered load.",
        [
          {
            label: "Open invoices",
            href: "/finance?tab=invoices",
            primary: true,
          },
        ],
      );
    case "replay_truck":
      return executeReplayTruck(parsed, tenantId);
    case "show_maintenance":
      return navigateResult(
        parsed,
        "Trucks needing maintenance",
        "/fleet/maintenance",
        "Opening Maintenance for PM due, work orders, and shop status.",
      );
    case "find_unpaid_invoices":
      return executeUnpaidInvoices(parsed, tenantId);
    case "best_broker":
      return executeBestBroker(parsed, tenantId);
    case "top_profit_truck":
      return executeTopProfitTruck(parsed, tenantId);
    case "loads_missing_pod":
      return executeMissingPod(parsed, tenantId);
    case "open_driver":
      return executeOpenDriver(parsed, tenantId);
    case "open_load":
      return executeOpenLoad(parsed, tenantId);
    case "open_truck":
      return executeOpenTruck(parsed, tenantId);
    case "open_broker":
      return executeOpenBroker(parsed, tenantId);
    case "show_compliance":
      return navigateResult(
        parsed,
        "Compliance",
        "/compliance",
        "Opening safety and DOT compliance.",
      );
    case "open_settings":
      return navigateResult(
        parsed,
        "Settings",
        "/settings",
        "Opening company settings.",
      );
    case "show_fleet":
      return navigateResult(
        parsed,
        "Fleet",
        "/fleet",
        "Opening the fleet overview.",
      );
    case "show_workforce":
      return navigateResult(
        parsed,
        "Workforce",
        "/workforce",
        "Opening the hiring command center.",
        [
          { label: "Open Workforce", href: "/workforce", primary: true },
          { label: "AI Recruiting", href: "/workforce/ai" },
          { label: "Jobs", href: "/workforce/jobs" },
        ],
      );
    case "find_candidates":
      return navigateResult(
        parsed,
        "Find candidates",
        "/workforce/ai",
        "Opening Alph Recruiting to rank reefer, flatbed, dispatch, and other talent.",
        [
          { label: "AI Recruiting", href: "/workforce/ai", primary: true },
          { label: "Candidates", href: "/workforce/candidates" },
        ],
      );
    case "open_workforce_ai":
      return navigateResult(
        parsed,
        "AI Recruiting",
        "/workforce/ai",
        "Opening Alph recruiter with prompt chips and ranked matches.",
      );
    case "show_workforce_jobs":
      return navigateResult(
        parsed,
        "Workforce jobs",
        "/workforce/jobs",
        "Opening open job postings.",
      );
    case "show_wallet":
      return navigateResult(
        parsed,
        "Digital Professional Wallet",
        "/wallet",
        "Opening your Career Passport wallet.",
        [
          { label: "Open Wallet", href: "/wallet", primary: true },
          { label: "Passport", href: "/wallet/passport" },
          { label: "Sharing", href: "/wallet/sharing" },
        ],
      );
    case "open_wallet_passport":
      return navigateResult(
        parsed,
        "Career Passport",
        "/wallet/passport",
        "Opening your lifelong professional timeline.",
      );
    case "open_wallet_ai":
      return navigateResult(
        parsed,
        "Wallet AI Assistant",
        "/wallet/ai",
        "Opening document assistant and career coach.",
        [
          { label: "AI Assistant", href: "/wallet/ai", primary: true },
          { label: "Documents", href: "/wallet/documents" },
        ],
      );
    case "wallet_share":
      return navigateResult(
        parsed,
        "Wallet sharing",
        "/wallet/sharing",
        "Create scoped, expiring share links — revoke anytime.",
        [
          { label: "Create share link", href: "/wallet/sharing", primary: true },
          { label: "Security", href: "/wallet/security" },
        ],
      );
    case "show_network":
      return navigateResult(
        parsed,
        "Transpo Verified Network",
        "/network",
        "Opening the Verified Network overview.",
        [
          { label: "Open Network", href: "/network", primary: true },
          { label: "Directory", href: "/network/directory" },
          { label: "AI Networking", href: "/network/ai" },
        ],
      );
    case "open_network_directory":
      return navigateResult(
        parsed,
        "Network directory",
        "/network/directory",
        "Opening the searchable verified directory.",
      );
    case "open_network_ai":
      return navigateResult(
        parsed,
        "AI Networking",
        "/network/ai",
        "Opening Alph networking with directory ranking heuristics.",
        [
          { label: "AI Networking", href: "/network/ai", primary: true },
          { label: "Directory", href: "/network/directory" },
        ],
      );
    case "open_network_identity":
      return navigateResult(
        parsed,
        "My Identity",
        "/network/identity",
        "Opening your Universal Verified ID and Transpo ID card.",
        [
          { label: "My Identity", href: "/network/identity", primary: true },
          { label: "Wallet", href: "/wallet" },
        ],
      );
    case "open_platform":
      return navigateResult(
        parsed,
        "Transpo Platform™",
        "/platform",
        "Opening the Platform hub — run your entire operation here.",
        [
          { label: "Platform", href: "/platform", primary: true },
          { label: "Command Center", href: "/platform/command" },
          { label: "App Store", href: "/platform/apps" },
        ],
      );
    case "open_migration":
      return navigateResult(
        parsed,
        "AI Migration Center",
        "/platform/migration",
        "Opening AI Migration Center — Alph assists; you approve every import.",
        [
          { label: "Migration Center", href: "/platform/migration", primary: true },
          { label: "Start import", href: "/platform/migration/new" },
          { label: "History", href: "/platform/migration/history" },
        ],
      );
    case "start_import":
      return navigateResult(
        parsed,
        "Start migration",
        "/platform/migration/new",
        "Opening the import wizard. Nothing is written until you confirm backup and import.",
        [
          { label: "Start wizard", href: "/platform/migration/new", primary: true },
          { label: "Migration Center", href: "/platform/migration" },
        ],
      );
    case "open_app_store":
      return navigateResult(
        parsed,
        "Transpo App Store™",
        "/platform/apps",
        "Opening the App Store to install partner apps with scoped permissions.",
      );
    case "open_command_center":
      return navigateResult(
        parsed,
        "Command Center",
        "/platform/command",
        "Opening the executive Command Center.",
        [
          { label: "Command Center", href: "/platform/command", primary: true },
          { label: "Dashboard", href: "/dashboard" },
        ],
      );
    case "create_load":
      return navigateResult(
        parsed,
        "Create a load",
        "/loads/new",
        "Opening new load — one screen to get it on the board.",
      );
    case "pay_invoice":
      return navigateResult(
        parsed,
        "Pay invoice",
        "/finance",
        "Opening Finance to review invoices and record payments. Payment rails stay with your connected accounting app.",
        [
          { label: "Finance", href: "/finance", primary: true },
        ],
      );
    case "schedule_maintenance":
      return navigateResult(
        parsed,
        "Schedule maintenance",
        "/fleet/maintenance",
        "Opening Maintenance to schedule service.",
      );
    case "open_translation":
      return navigateResult(
        parsed,
        "Global Translation",
        "/platform/translation",
        "Opening language preference and Alph translate demo.",
      );
    case "open_security":
      return navigateResult(
        parsed,
        "Enterprise Security",
        "/platform/security",
        "Opening security — SSO/MFA link to Settings; local audit viewer.",
        [
          { label: "Security", href: "/platform/security", primary: true },
          { label: "Settings", href: "/settings" },
          { label: "Permissions", href: "/settings/permissions" },
        ],
      );
    case "open_automation":
      return navigateResult(
        parsed,
        "AI Automation Center",
        "/platform/automation",
        "Opening automation recipes. Advanced graphs live under Workflows.",
        [
          { label: "Automation", href: "/platform/automation", primary: true },
          { label: "Workflows", href: "/workflows" },
        ],
      );
    case "open_exchange":
      return navigateResult(
        parsed,
        "Transpo Exchange™",
        "/exchange",
        "Opening Transpo Exchange™ — buy, sell, rent, and hire across trucking commerce.",
        [
          { label: "Exchange", href: "/exchange", primary: true },
          { label: "AI Shopping", href: "/exchange/ai" },
          { label: "Equipment", href: "/exchange/equipment" },
          { label: "Orders", href: "/exchange/orders" },
        ],
      );
    case "open_exchange_ai":
      return navigateResult(
        parsed,
        "AI Shopping",
        "/exchange/ai",
        "Opening Alph purchasing assistant on Transpo Exchange™.",
        [
          { label: "AI Shopping", href: "/exchange/ai", primary: true },
          { label: "Compare", href: "/exchange/compare" },
          { label: "Insights", href: "/exchange/insights" },
        ],
      );
    case "exchange_shop":
      return navigateResult(
        parsed,
        "Exchange shop results",
        "/exchange/ai",
        `Alph is searching Transpo Exchange™ for: ${parsed.raw}`,
        [
          { label: "View AI results", href: "/exchange/ai", primary: true },
          { label: "Equipment", href: "/exchange/equipment" },
          { label: "Parts", href: "/exchange/parts" },
          { label: "Business services", href: "/exchange/business-services" },
        ],
      );
    case "show_brokers":
      return navigateResult(
        parsed,
        "Brokers",
        "/brokers",
        "Opening your broker roster.",
      );
    case "show_documents":
      return navigateResult(
        parsed,
        "Documents",
        "/documents",
        "Opening Document Center.",
      );
    case "show_finance":
      return navigateResult(
        parsed,
        "Finance",
        "/finance",
        "Opening revenue, invoices, and cash flow.",
      );
    case "show_analytics":
      return navigateResult(
        parsed,
        "Reports",
        "/analytics",
        "Opening analytics and reports.",
      );
    case "morning_briefing":
      return executeMorningBriefing(parsed, tenantId);
    case "eld_is_supported":
      return executeEldAlph(parsed, "is_eld_supported");
    case "eld_why_not_connected":
      return executeEldAlph(parsed, "why_not_connected");
    case "eld_what_to_ask":
      return executeEldAlph(parsed, "what_to_ask_provider");
    case "eld_request_reviewed":
      return executeEldAlph(parsed, "request_reviewed");
    case "eld_which_support_data":
      return executeEldAlph(parsed, "which_support_data");
    case "eld_when_available":
      return executeEldAlph(parsed, "when_available");
    case "support_help":
      return executeSupportHelp(parsed, "help");
    case "support_setup":
      return executeSupportHelp(parsed, "setup");
    case "support_issue_status":
      return executeSupportHelp(parsed, "status");
    case "open_dispatch":
      return navigateResult(
        parsed,
        "Dispatch",
        "/loads",
        "Opening the dispatch board.",
      );
    case "assign_driver":
      return navigateResult(
        parsed,
        "Assign a driver",
        parsed.entities.driverName
          ? `/drivers?q=${encodeURIComponent(parsed.entities.driverName)}`
          : "/loads",
        parsed.entities.driverName
          ? `Find ${parsed.entities.driverName}, then assign from the load.`
          : "Open dispatch to assign a driver to a load.",
      );
    case "show_cash_flow":
      return navigateResult(
        parsed,
        "Cash flow",
        "/finance",
        "Opening finance for cash flow and outstanding balances.",
      );
    case "who_owes_money":
      return navigateResult(
        parsed,
        "Who owes you",
        "/finance?tab=invoices",
        "Opening overdue and unpaid invoices.",
      );
    case "show_expiring":
      return navigateResult(
        parsed,
        "Expiring documents",
        "/compliance",
        "Opening compliance for expiring permits, insurance, and medicals.",
      );
    case "why_profit_down":
      return answerResult(
        parsed,
        "Profit pressure",
        "Profit usually dips when fuel, maintenance, or overdue invoices rise. Open Finance reports and the Executive Dashboard for the breakdown.",
        {
          href: "/dashboard",
          actions: [
            { label: "Dashboard", href: "/dashboard", primary: true },
            { label: "Finance", href: "/finance" },
          ],
        },
      );
    case "why_fleet_health":
      return answerResult(
        parsed,
        "Fleet health",
        "Fleet health drops when PM is overdue, units sit in shop, or critical alerts pile up. Open Maintenance for the work queue.",
        {
          href: "/fleet/maintenance",
          actions: [
            { label: "Maintenance", href: "/fleet/maintenance", primary: true },
            { label: "Trucks", href: "/fleet/trucks" },
          ],
        },
      );
    case "driver_performance":
      return navigateResult(
        parsed,
        "Driver performance",
        "/dashboard",
        "Opening the dashboard driver performance view.",
      );
    case "show_maintenance_due":
      return navigateResult(
        parsed,
        "Maintenance due",
        "/fleet/maintenance",
        "Opening the maintenance center.",
      );
    case "upload_pod":
      return navigateResult(
        parsed,
        "Upload POD",
        "/documents?upload=pod",
        "Opening Document Center to upload proof of delivery.",
      );
    case "open_alph_copilot":
      return navigateResult(
        parsed,
        "Alph Copilot™",
        "/alph/copilot",
        "Opening Alph Copilot™ — your role-specific AI employee.",
      );
    case "open_driver_alph":
      return navigateResult(
        parsed,
        "Driver Alph",
        "/alph/copilot/driver",
        "Opening Driver Alph for trip reminders and one-command help.",
      );
    case "open_dispatcher_alph":
      return navigateResult(
        parsed,
        "Dispatcher Alph",
        "/alph/copilot/dispatcher",
        "Opening Dispatcher Alph for assign, ETA, and reload help.",
      );
    case "open_safety_alph":
      return navigateResult(
        parsed,
        "Safety Alph",
        "/alph/copilot/safety",
        "Opening Safety Alph for compliance and risk watch.",
      );
    case "open_maintenance_alph":
      return navigateResult(
        parsed,
        "Maintenance Alph",
        "/alph/copilot/maintenance",
        "Opening Maintenance Alph for PM and shop status.",
      );
    case "open_accounting_alph":
      return navigateResult(
        parsed,
        "Accounting Alph",
        "/alph/copilot/accounting",
        "Opening Accounting Alph for invoices, payroll, and IFTA.",
      );
    case "open_owner_alph":
      return navigateResult(
        parsed,
        "Owner Alph",
        "/alph/copilot/owner",
        "Opening Owner Alph for the morning executive brief.",
      );
    case "assign_best_driver":
      return answerResult(
        parsed,
        "Assign best driver",
        "Suggested Maria Lopez + Unit 105 for the next open load (score 94). Confirm in Dispatcher Alph or Dispatch.",
        {
          href: "/alph/copilot/dispatcher",
          actions: [
            {
              label: "Open Dispatcher Alph",
              href: "/alph/copilot/dispatcher",
              primary: true,
            },
            { label: "Open loads", href: "/loads" },
          ],
        },
      );
    case "find_reload":
      return answerResult(
        parsed,
        "Find reload",
        "Found 3 reloads within 80 miles — best pays $2.90/mi to Atlanta.",
        {
          href: "/alph/copilot/dispatcher",
          actions: [
            {
              label: "Open Dispatcher Alph",
              href: "/alph/copilot/dispatcher",
              primary: true,
            },
            { label: "Open loads", href: "/loads" },
          ],
        },
      );
    case "handle_payroll":
      return navigateResult(
        parsed,
        "Handle payroll",
        "/alph/copilot/accounting",
        "Accounting Alph can prepare settlements — confirm before releasing pay.",
        [
          {
            label: "Open Accounting Alph",
            href: "/alph/copilot/accounting",
            primary: true,
          },
          { label: "Open payroll", href: "/payroll" },
        ],
      );
    case "show_todays_profit":
      return answerResult(
        parsed,
        "Today's profit",
        "Today's profit: $4,820 (18.4% margin). Fuel up $310 vs yesterday.",
        {
          href: "/alph/copilot/owner",
          actions: [
            {
              label: "Open Owner Alph",
              href: "/alph/copilot/owner",
              primary: true,
            },
            { label: "Dashboard", href: "/dashboard" },
          ],
        },
      );
    case "find_truck_wash":
      return answerResult(
        parsed,
        "Nearest truck wash",
        "Closest wash: Blue Beacon Dallas — 6.4 mi, open until 10pm, ~$65 tractor.",
        {
          href: "/alph/copilot/driver",
          actions: [
            {
              label: "Open Driver Alph",
              href: "/alph/copilot/driver",
              primary: true,
            },
            { label: "Driver services", href: "/driver/services" },
          ],
        },
      );
    default:
      return clarifyResult(
        parsed,
        "I'm not sure what to do",
        'Ask Alph in plain language — for example "Show trucks needing maintenance".',
        [
          { label: "Alph workspace", href: "/", primary: true },
        ],
      );
  }
}

function executeSupportHelp(
  parsed: AlphParsedCommand,
  mode: "help" | "setup" | "status",
): AlphResult {
  const store = getSupportStore();
  const question =
    mode === "setup"
      ? "help me finish company setup"
      : mode === "status"
        ? parsed.raw || "has my issue been resolved"
        : parsed.raw || "why is this not working";
  const answer = alphHelpAnswer(question, store);
  return answerResult(parsed, answer.title, answer.body, {
    href: answer.href,
    actions: [
      {
        label: mode === "setup" ? "Open Setup" : "Open Support",
        href: answer.href ?? (mode === "setup" ? "/setup" : "/support"),
        primary: true,
      },
      { label: "Alph Help", href: "/support" },
    ],
  });
}

function executeEldAlph(
  parsed: AlphParsedCommand,
  kind: EldAlphQuestionKind,
): AlphResult {
  const answer = answerEldAlphQuestion(kind, parsed.raw);
  return answerResult(parsed, answer.title, answer.body, {
    href: answer.href,
    actions: answer.href
      ? [
          { label: "Open ELD Directory", href: answer.href, primary: true },
          { label: "My requests", href: "/integrations/eld/requests" },
        ]
      : [
          {
            label: "Open ELD Directory",
            href: "/integrations/eld",
            primary: true,
          },
        ],
  });
}

export function runAlphCommand(
  raw: string,
  tenantId: string = getActiveTenantId(),
): { parsed: AlphParsedCommand; result: AlphResult } {
  const parsed = parseAlphCommand(raw);
  const gate = gateAlphIntent(parsed.intent);
  if (!gate.allowed) {
    return {
      parsed,
      result: alphPermissionDeniedResult(parsed, gate.reason),
    };
  }
  const result = annotateAlphCriticalAssist(
    executeAlphCommand(parsed, tenantId),
  );
  return { parsed, result };
}
