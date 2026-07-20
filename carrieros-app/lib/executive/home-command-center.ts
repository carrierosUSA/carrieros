import { getBrokerById } from "@/lib/data/brokers";
import { listDriverCompliance } from "@/lib/data/compliance-store";
import { listInvoices, listRevenue } from "@/lib/data/finance-store";
import { getMaintenanceSnapshot } from "@/lib/data/maintenance-store";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getTruckById } from "@/lib/data/trucks";
import { isAttentionStatus } from "@/lib/compliance/compliance-board";
import { DRIVER_COMPLIANCE_TYPE_LABELS } from "@/lib/types/compliance";
import { buildTelUrl, buildSmsUrl } from "@/lib/dispatch/communication";
import { getDriverOperationalStatus } from "@/lib/drivers/driver-board";
import type { AlphExecutiveSummary } from "@/lib/executive/executive-alph";
import type { ExecutiveBoard } from "@/lib/executive/executive-board";
import {
  FMCSA_NEWS_DEMO_LABEL,
  listFmcsaNewsItems,
  type FmcsaNewsItem,
} from "@/lib/executive/fmcsa-news";
import { detectFinanceAlphAlerts } from "@/lib/finance/finance-alph-alerts";
import {
  FINANCE_TODAY,
  formatFinanceMoney,
  buildFinanceDashboardStats,
} from "@/lib/finance/finance-board";
import { detectMaintenanceAlphAlerts } from "@/lib/fleet/maintenance-alph";
import { getTruckOperationalStatus } from "@/lib/fleet/truck-board";
import { getDriverService } from "@/lib/services/drivers";
import { getFleetService } from "@/lib/services/fleet";
import { getLoadService } from "@/lib/services/loads";
import type { Load } from "@/lib/types";

function brokerNameForLoad(load: Load): string {
  if (!load.brokerId) return "Customer";
  return getBrokerById(load.brokerId)?.name ?? "Broker";
}

export type HomeStatTone = "neutral" | "info" | "success" | "warning" | "critical";

export type HomeStatChip = {
  id: string;
  label: string;
  count: number;
  href: string;
  tone: HomeStatTone;
  /** Units needing attention sort first when true */
  attention?: boolean;
};

export type HomeRevenueBlock = {
  today: { label: string; value: string; href: string };
  week: { label: string; value: string; href: string };
  collected: { label: string; value: string; href: string };
  outstanding: { label: string; value: string; href: string };
  trendLabel: string;
  trendTone: HomeStatTone;
};

export type HomeInvoiceActionStatus =
  | "Missing POD"
  | "Ready to invoice"
  | "Sent"
  | "Payment expected"
  | "Due today"
  | "Overdue"
  | "Paid";

export type HomeInvoiceRow = {
  id: string;
  invoiceNumber: string;
  loadNumber: string;
  loadId?: string;
  brokerName: string;
  amountLabel: string;
  status: HomeInvoiceActionStatus;
  paymentExpectedLabel: string;
  daysLabel: string;
  tone: HomeStatTone;
  actionLabel: string;
  actionHref: string;
  sortRank: number;
};

export type HomeDriverRow = {
  id: string;
  name: string;
  truckLabel: string;
  loadLabel: string;
  loadId?: string;
  location: string;
  statusLabel: string;
  statusTone: HomeStatTone;
  callHref?: string;
  messageHref?: string;
  assignHref: string;
  viewHref: string;
};

export type HomeAttentionItem = {
  id: string;
  category:
    | "Missing POD"
    | "Late load"
    | "Maintenance overdue"
    | "Expiring driver document"
    | "Invoice overdue"
    | "Payment overdue";
  whatHappened: string;
  whyItMatters: string;
  actionLabel: string;
  actionHref: string;
  tone: "warning" | "critical";
};

export type HomeTodaysReport = {
  summary: string;
  viewDetailsHref: string;
  askAlphHref: string;
};

export type HomeCommandCenter = {
  companyName: string;
  dateLabel: string;
  todaysReport: HomeTodaysReport;
  truckStatus: HomeStatChip[];
  loadStatus: HomeStatChip[];
  revenue: HomeRevenueBlock;
  invoices: HomeInvoiceRow[];
  drivers: HomeDriverRow[];
  needsAttention: HomeAttentionItem[];
  fmcsaNews: FmcsaNewsItem[];
  fmcsaDemoLabel: string;
};

function parseDateTs(iso: string): number {
  return new Date(`${iso.slice(0, 10)}T12:00:00Z`).getTime();
}

function shiftIsoDate(iso: string, days: number): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDateLabel(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function hasPodDocument(load: Load): boolean {
  return load.documentIds.some((id) => id.toLowerCase().includes("pod"));
}

function isActiveLoad(load: Load): boolean {
  return (
    load.status === "dispatched" ||
    load.status === "picked_up" ||
    load.status === "in_transit"
  );
}

function daysBetween(fromIso: string, toIso: string): number {
  const ms = parseDateTs(toIso) - parseDateTs(fromIso);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function percentChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

function mapInvoiceStatus(
  status: HomeInvoiceActionStatus,
): { tone: HomeStatTone; rank: number; actionLabel: string; actionHref: (id: string, loadId?: string) => string } {
  switch (status) {
    case "Overdue":
      return {
        tone: "critical",
        rank: 0,
        actionLabel: "Send reminder",
        actionHref: (id) => `/finance?tab=invoices&focus=${id}`,
      };
    case "Due today":
      return {
        tone: "critical",
        rank: 1,
        actionLabel: "Send reminder",
        actionHref: (id) => `/finance?tab=invoices&focus=${id}`,
      };
    case "Missing POD":
      return {
        tone: "critical",
        rank: 2,
        actionLabel: "Upload POD",
        actionHref: (_id, loadId) =>
          loadId
            ? `/documents?upload=pod&loadId=${loadId}`
            : "/documents?upload=pod",
      };
    case "Ready to invoice":
      return {
        tone: "warning",
        rank: 3,
        actionLabel: "Create invoice",
        actionHref: (_id, loadId) =>
          loadId ? `/loads/${loadId}` : "/finance?tab=invoices",
      };
    case "Payment expected":
      return {
        tone: "info",
        rank: 4,
        actionLabel: "View invoice",
        actionHref: (id) => `/finance?tab=invoices&focus=${id}`,
      };
    case "Sent":
      return {
        tone: "info",
        rank: 5,
        actionLabel: "View invoice",
        actionHref: (id) => `/finance?tab=invoices&focus=${id}`,
      };
    case "Paid":
      return {
        tone: "success",
        rank: 6,
        actionLabel: "Record payment",
        actionHref: (id) => `/finance?tab=broker_payments&focus=${id}`,
      };
  }
}

function resolveDisplayInvoiceStatus(
  invoice: {
    status: string;
    dueDate: string;
    amountPaid: number;
    amount: number;
  },
  today: string,
): HomeInvoiceActionStatus {
  if (invoice.status === "paid" || invoice.amountPaid >= invoice.amount) {
    return "Paid";
  }
  if (invoice.status === "overdue" || invoice.dueDate < today) {
    return "Overdue";
  }
  if (invoice.dueDate === today) {
    return "Due today";
  }
  if (invoice.status === "draft") {
    return "Ready to invoice";
  }
  if (invoice.status === "sent" || invoice.status === "partial") {
    const days = daysBetween(today, invoice.dueDate);
    if (days > 0 && days <= 7) return "Payment expected";
    return "Sent";
  }
  return "Sent";
}

/**
 * Build the premium Home command center from existing domain stores.
 */
export async function buildHomeCommandCenter(
  board: ExecutiveBoard,
  summary: AlphExecutiveSummary,
  tenantId: string = getActiveTenantId(),
  today: string = FINANCE_TODAY,
): Promise<HomeCommandCenter> {
  const loadService = getLoadService();
  const driverService = getDriverService();
  const fleetService = getFleetService();

  const [loads, drivers, trucks, trailers] = await Promise.all([
    loadService.listLoads(tenantId),
    driverService.listDrivers(tenantId),
    fleetService.listTrucks(tenantId),
    fleetService.listTrailers(tenantId),
  ]);

  const finance = buildFinanceDashboardStats(tenantId, today);
  const invoices = listInvoices(tenantId);
  const revenue = listRevenue(tenantId);
  const snapshot = getMaintenanceSnapshot();
  const driverCompliance = listDriverCompliance(tenantId);

  // —— Truck status (trucks only) ——
  const truckOps = trucks.map((truck) => ({
    truck,
    status: getTruckOperationalStatus(truck, loads),
  }));
  const truckCounts = {
    total: trucks.length,
    driving: truckOps.filter((t) => t.status === "on_load").length,
    available: truckOps.filter(
      (t) => t.status === "available" || t.status === "idle",
    ).length,
    maintenance: truckOps.filter((t) => t.status === "in_shop").length,
    outOfService: truckOps.filter((t) => t.status === "out_of_service").length,
  };

  const truckStatusBase: HomeStatChip[] = [
    {
      id: "oos",
      label: "Out of service",
      count: truckCounts.outOfService,
      href: "/fleet?status=out_of_service&equipment=trucks",
      tone: (truckCounts.outOfService > 0 ? "critical" : "neutral") as HomeStatTone,
      attention: truckCounts.outOfService > 0,
    },
    {
      id: "maint",
      label: "Maintenance",
      count: truckCounts.maintenance,
      href: "/fleet?status=in_shop&equipment=trucks",
      tone: (truckCounts.maintenance > 0 ? "warning" : "neutral") as HomeStatTone,
      attention: truckCounts.maintenance > 0,
    },
    {
      id: "available",
      label: "Available",
      count: truckCounts.available,
      href: "/fleet?status=available&equipment=trucks",
      tone: "success",
    },
    {
      id: "driving",
      label: "Driving",
      count: truckCounts.driving,
      href: "/fleet?status=on_load&equipment=trucks",
      tone: "info",
    },
    {
      id: "total",
      label: "Total",
      count: truckCounts.total,
      href: "/fleet?equipment=trucks",
      tone: "neutral",
    },
  ];
  const truckStatus = [...truckStatusBase].sort(
    (a, b) => Number(Boolean(b.attention)) - Number(Boolean(a.attention)),
  );

  // —— Load status ——
  const pickupToday = loads.filter((l) => l.pickupDate === today).length;
  const inTransit = loads.filter(
    (l) => l.status === "in_transit" || l.status === "picked_up",
  ).length;
  const deliveringToday = loads.filter((l) => l.deliveryDate === today).length;
  const delivered = loads.filter((l) => l.status === "delivered").length;
  const needsNewLoad = truckCounts.available;
  const missingPod = loads.filter(
    (l) =>
      (l.status === "delivered" || l.status === "in_transit") &&
      !hasPodDocument(l),
  ).length;

  const loadStatusBase: HomeStatChip[] = [
    {
      id: "missing-pod",
      label: "Missing POD",
      count: missingPod,
      href: "/loads?focus=missing_pod",
      tone: (missingPod > 0 ? "critical" : "neutral") as HomeStatTone,
      attention: missingPod > 0,
    },
    {
      id: "needs-load",
      label: "Needs new load",
      count: needsNewLoad,
      href: "/loads?focus=needs_load",
      tone: (needsNewLoad > 0 ? "warning" : "neutral") as HomeStatTone,
      attention: needsNewLoad > 0,
    },
    {
      id: "delivering",
      label: "Delivering today",
      count: deliveringToday,
      href: "/loads?focus=delivery_today",
      tone: "info",
    },
    {
      id: "pickup",
      label: "Pickup today",
      count: pickupToday,
      href: "/loads?focus=pickup_today",
      tone: "info",
    },
    {
      id: "in-transit",
      label: "In transit",
      count: inTransit,
      href: "/loads?tab=in_transit",
      tone: "info",
    },
    {
      id: "delivered",
      label: "Delivered",
      count: delivered,
      href: "/loads?tab=delivered",
      tone: "success",
    },
  ];
  const loadStatus = [...loadStatusBase].sort(
    (a, b) => Number(Boolean(b.attention)) - Number(Boolean(a.attention)),
  );

  // —— Revenue ——
  const yesterday = shiftIsoDate(today, -1);
  const priorWeekStart = shiftIsoDate(today, -13);
  const priorWeekEnd = shiftIsoDate(today, -7);
  const weekStart = shiftIsoDate(today, -6);

  const sumRev = (from: string, to: string) =>
    revenue
      .filter((r) => {
        const t = r.deliveredAt.slice(0, 10);
        return t >= from && t <= to;
      })
      .reduce((s, r) => s + r.amount, 0);

  const todayRev = sumRev(today, today);
  const yestRev = sumRev(yesterday, yesterday);
  const weekRev = sumRev(weekStart, today);
  const priorWeekRev = sumRev(priorWeekStart, priorWeekEnd);
  const collected = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.amountPaid, 0);
  const outstanding = finance.outstandingInvoices;

  const weekDelta = percentChange(weekRev, priorWeekRev);
  const dayDelta = percentChange(todayRev, yestRev);
  const trendParts: string[] = [];
  if (dayDelta !== 0) {
    trendParts.push(
      `${dayDelta > 0 ? "+" : ""}${dayDelta}% vs yesterday`,
    );
  }
  trendParts.push(
    `${weekDelta > 0 ? "+" : ""}${weekDelta}% vs prior week`,
  );
  const trendTone: HomeStatTone =
    weekDelta < -5 ? "critical" : weekDelta > 5 ? "success" : "neutral";

  const revenueBlock: HomeRevenueBlock = {
    today: {
      label: "Today",
      value: formatFinanceMoney(todayRev || finance.todayRevenue),
      href: "/finance",
    },
    week: {
      label: "This week",
      value: formatFinanceMoney(weekRev || finance.weekRevenue),
      href: "/finance",
    },
    collected: {
      label: "Collected",
      value: formatFinanceMoney(collected),
      href: "/finance?tab=broker_payments",
    },
    outstanding: {
      label: "Outstanding",
      value: formatFinanceMoney(outstanding),
      href: "/finance?tab=invoices",
    },
    trendLabel: trendParts.join(" · "),
    trendTone,
  };

  // —— Invoices & payments ——
  const invoiceRows: HomeInvoiceRow[] = [];

  for (const load of loads) {
    if (
      (load.status === "delivered" || load.status === "in_transit") &&
      !hasPodDocument(load) &&
      !load.invoiceId
    ) {
      const meta = mapInvoiceStatus("Missing POD");
      invoiceRows.push({
        id: `pod-${load.id}`,
        invoiceNumber: "—",
        loadNumber: load.reference,
        loadId: load.id,
        brokerName: brokerNameForLoad(load),
        amountLabel: formatFinanceMoney(load.rate ?? 0),
        status: "Missing POD",
        paymentExpectedLabel: "—",
        daysLabel: "POD blocking invoice",
        tone: meta.tone,
        actionLabel: meta.actionLabel,
        actionHref: meta.actionHref("", load.id),
        sortRank: meta.rank,
      });
    }
  }

  for (const load of loads) {
    if (load.status === "delivered" && !load.invoiceId && hasPodDocument(load)) {
      const meta = mapInvoiceStatus("Ready to invoice");
      invoiceRows.push({
        id: `ready-${load.id}`,
        invoiceNumber: "—",
        loadNumber: load.reference,
        loadId: load.id,
        brokerName: brokerNameForLoad(load),
        amountLabel: formatFinanceMoney(load.rate ?? 0),
        status: "Ready to invoice",
        paymentExpectedLabel: "—",
        daysLabel: "Ready now",
        tone: meta.tone,
        actionLabel: meta.actionLabel,
        actionHref: meta.actionHref("", load.id),
        sortRank: meta.rank,
      });
    }
  }

  for (const inv of invoices) {
    const display = resolveDisplayInvoiceStatus(inv, today);
    const meta = mapInvoiceStatus(display);
    const days = daysBetween(today, inv.dueDate);
    let daysLabel = "";
    if (display === "Paid") {
      daysLabel = inv.paidAt ? `Paid ${inv.paidAt.slice(0, 10)}` : "Paid";
    } else if (days < 0) {
      daysLabel = `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
    } else if (days === 0) {
      daysLabel = "Due today";
    } else {
      daysLabel = `${days} day${days === 1 ? "" : "s"} remaining`;
    }

    invoiceRows.push({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      loadNumber: inv.loadReference ?? "—",
      loadId: inv.loadId,
      brokerName: inv.brokerName,
      amountLabel: formatFinanceMoney(inv.amount - inv.amountPaid),
      status: display,
      paymentExpectedLabel: inv.dueDate,
      daysLabel,
      tone: meta.tone,
      actionLabel:
        display === "Paid"
          ? "View invoice"
          : display === "Overdue" || display === "Due today"
            ? "Send reminder"
            : meta.actionLabel,
      actionHref:
        display === "Paid"
          ? `/finance?tab=invoices&focus=${inv.id}`
          : display === "Overdue" || display === "Due today"
            ? `/finance?tab=invoices&focus=${inv.id}`
            : display === "Ready to invoice"
              ? meta.actionHref(inv.id, inv.loadId)
              : meta.actionHref(inv.id, inv.loadId),
      sortRank: meta.rank,
    });
  }

  invoiceRows.sort((a, b) => a.sortRank - b.sortRank || a.brokerName.localeCompare(b.brokerName));

  // —— Drivers relevant today ——
  const driverRows: HomeDriverRow[] = [];
  for (const driver of drivers) {
    if (driver.status !== "active" && driver.status !== "onboarding") continue;
    const ops = getDriverOperationalStatus(driver, loads);
    const activeLoad = loads.find(
      (l) =>
        l.driverId === driver.id &&
        (isActiveLoad(l) || l.status === "pending" || l.status === "dispatched"),
    );
    const truck = driver.truckId ? getTruckById(driver.truckId) : undefined;
    const relevant =
      ops === "on_load" ||
      ops === "available" ||
      Boolean(activeLoad) ||
      (driver.medicalExpiresAt &&
        daysBetween(today, driver.medicalExpiresAt) <= 30);

    if (!relevant && ops === "off_duty") continue;

    const statusLabel =
      ops === "on_load"
        ? "On load"
        : ops === "available"
          ? "Needs load"
          : ops === "onboarding"
            ? "Onboarding"
            : "Off duty";
    const statusTone: HomeStatTone =
      ops === "available" ? "warning" : ops === "on_load" ? "info" : "neutral";

    driverRows.push({
      id: driver.id,
      name: driver.name,
      truckLabel: truck ? `Unit ${truck.unitNumber}` : "No truck",
      loadLabel: activeLoad?.reference ?? "No load",
      loadId: activeLoad?.id,
      location: driver.location || "—",
      statusLabel,
      statusTone,
      callHref: buildTelUrl(driver.phone),
      messageHref: buildSmsUrl(driver.phone),
      assignHref: `/loads?assign=1&driver=${driver.id}`,
      viewHref: `/drivers/${driver.id}`,
    });
  }
  driverRows.sort((a, b) => {
    const rank = (s: string) =>
      s === "Needs load" ? 0 : s === "On load" ? 1 : 2;
    return rank(a.statusLabel) - rank(b.statusLabel) || a.name.localeCompare(b.name);
  });
  const driversForHome = driverRows.slice(0, 8);

  // —— Needs attention ——
  const needsAttention: HomeAttentionItem[] = [];

  for (const load of loads) {
    if (
      (load.status === "delivered" || load.status === "in_transit") &&
      !hasPodDocument(load)
    ) {
      needsAttention.push({
        id: `att-pod-${load.id}`,
        category: "Missing POD",
        whatHappened: `${load.reference} is missing proof of delivery.`,
        whyItMatters: "Without POD you cannot invoice and cash sits longer.",
        actionLabel: "Upload POD",
        actionHref: `/documents?upload=pod&loadId=${load.id}`,
        tone: "critical",
      });
    }
  }

  for (const load of loads) {
    if (
      isActiveLoad(load) &&
      load.complianceStatus === "attention" &&
      load.deliveryDate < today
    ) {
      needsAttention.push({
        id: `att-late-${load.id}`,
        category: "Late load",
        whatHappened: `${load.reference} is past its delivery window.`,
        whyItMatters: "Late freight hurts broker trust and can trigger claims.",
        actionLabel: "Open load",
        actionHref: `/loads/${load.id}`,
        tone: "critical",
      });
    }
  }

  const maintAlerts = detectMaintenanceAlphAlerts({
    trucks,
    trailers,
    pmSchedules: snapshot.pmSchedules,
    workOrders: snapshot.workOrders,
    repairs: snapshot.repairs,
    parts: snapshot.parts,
    tires: snapshot.tires,
  });
  for (const alert of maintAlerts.slice(0, 3)) {
    if (alert.severity !== "critical" && alert.severity !== "warning") continue;
    needsAttention.push({
      id: `att-maint-${alert.id}`,
      category: "Maintenance overdue",
      whatHappened: alert.message,
      whyItMatters: "Deferred shop work can put a unit out of service mid-lane.",
      actionLabel: "Open maintenance",
      actionHref: "/fleet/maintenance",
      tone: alert.severity === "critical" ? "critical" : "warning",
    });
  }

  for (const item of driverCompliance) {
    if (!isAttentionStatus(item.status)) continue;
    if (item.type !== "medical" && item.type !== "cdl") continue;
    const docLabel = DRIVER_COMPLIANCE_TYPE_LABELS[item.type];
    needsAttention.push({
      id: `att-doc-${item.id}`,
      category: "Expiring driver document",
      whatHappened: `${item.driverName} — ${docLabel} needs attention.`,
      whyItMatters: "Expired credentials can stop a driver at the scale.",
      actionLabel: "Review document",
      actionHref: item.driverId
        ? `/drivers/${item.driverId}/documents`
        : "/compliance",
      tone: item.status === "expired" ? "critical" : "warning",
    });
  }

  for (const inv of invoices.filter((i) => i.status === "overdue" || i.dueDate < today)) {
    if (inv.status === "paid") continue;
    needsAttention.push({
      id: `att-inv-${inv.id}`,
      category: "Invoice overdue",
      whatHappened: `${inv.invoiceNumber} for ${inv.brokerName} is past due.`,
      whyItMatters: "Overdue invoices slow payroll and fuel cash.",
      actionLabel: "Send reminder",
      actionHref: `/finance?tab=invoices&focus=${inv.id}`,
      tone: "critical",
    });
  }

  const financeAlerts = detectFinanceAlphAlerts(tenantId, today);
  for (const alert of financeAlerts.slice(0, 2)) {
    if (/payment|collect|outstanding/i.test(alert.message)) {
      needsAttention.push({
        id: `att-pay-${alert.id}`,
        category: "Payment overdue",
        whatHappened: alert.message,
        whyItMatters: "Uncollected payments tighten cash for the week ahead.",
        actionLabel: "Open payments",
        actionHref: "/finance?tab=broker_payments",
        tone: alert.severity === "critical" ? "critical" : "warning",
      });
    }
  }

  // Dedupe by id, urgent first, cap
  const seenAtt = new Set<string>();
  const uniqueAttention = needsAttention
    .filter((item) => {
      if (seenAtt.has(item.id)) return false;
      seenAtt.add(item.id);
      return true;
    })
    .sort((a, b) => {
      if (a.tone !== b.tone) return a.tone === "critical" ? -1 : 1;
      return 0;
    })
    .slice(0, 8);

  // —— Today's report (plain language) ——
  const driversNeedingLoads = driversForHome.filter(
    (d) => d.statusLabel === "Needs load",
  ).length;
  const reportBits: string[] = [];
  reportBits.push(
    `${truckCounts.driving} truck${truckCounts.driving === 1 ? "" : "s"} driving`,
  );
  if (deliveringToday > 0) {
    reportBits.push(
      `${deliveringToday} load${deliveringToday === 1 ? "" : "s"} delivering today`,
    );
  }
  if (driversNeedingLoads > 0) {
    reportBits.push(
      `${driversNeedingLoads} driver${driversNeedingLoads === 1 ? "" : "s"} needing a load`,
    );
  }
  reportBits.push(
    `${formatFinanceMoney(todayRev || finance.todayRevenue)} revenue today`,
  );
  if (missingPod > 0) {
    reportBits.push(
      `${missingPod} POD${missingPod === 1 ? "" : "s"} delaying invoice`,
    );
  } else if (uniqueAttention[0]) {
    reportBits.push(uniqueAttention[0].whatHappened.replace(/\.$/, ""));
  } else if (summary.topPriorities[0]) {
    reportBits.push(summary.topPriorities[0].text);
  }

  const todaysReport: HomeTodaysReport = {
    summary: `Alph: ${reportBits.join(". ")}.`,
    viewDetailsHref: "/analytics",
    askAlphHref: `/?q=${encodeURIComponent("Summarize what needs my attention today")}`,
  };

  return {
    companyName: board.companyName,
    dateLabel: formatDateLabel(today),
    todaysReport,
    truckStatus,
    loadStatus,
    revenue: revenueBlock,
    invoices: invoiceRows.slice(0, 12),
    drivers: driversForHome,
    needsAttention: uniqueAttention,
    fmcsaNews: listFmcsaNewsItems(3),
    fmcsaDemoLabel: FMCSA_NEWS_DEMO_LABEL,
  };
}
