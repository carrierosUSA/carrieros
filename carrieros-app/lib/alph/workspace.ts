import type { AlphExecutiveSummary } from "@/lib/executive/executive-alph";
import type { ExecutiveBoard, ExecutiveKpi } from "@/lib/executive/executive-board";

export const ALPH_WORKSPACE_EXAMPLES = [
  "Find Truck 105",
  "Assign Driver John",
  "Generate Payroll",
  "Generate Q2 IFTA",
  "Create Invoice",
  "Open Dispatch",
  "Show Today's Loads",
  "Find Unpaid Invoices",
  "Why is Fleet Health Low?",
  "Show Expiring Permits",
  "Show Maintenance Due",
  "Find Broker ABC",
  "Create Maintenance Ticket",
  "Upload POD",
  "Show workforce",
  "Find reefer drivers to hire",
  "Assign best driver",
  "Show today's profit",
] as const;

export const ALPH_QUICK_ACTIONS = [
  { id: "new-load", label: "New Load", href: "/loads/new", emoji: "📦" },
  { id: "assign-driver", label: "Assign Driver", href: "/loads?assign=1", emoji: "👤" },
  { id: "dispatch", label: "Dispatch Board", href: "/loads", emoji: "🗺️" },
  { id: "invoice", label: "Create Invoice", href: "/finance?tab=invoices", emoji: "🧾" },
  { id: "payroll", label: "Run Payroll", href: "/finance?tab=payroll", emoji: "💵" },
  { id: "ifta", label: "Generate IFTA", href: "/ifta", emoji: "⛽" },
  { id: "pod", label: "Upload POD", href: "/documents?upload=pod", emoji: "📄" },
  { id: "maintenance", label: "Maintenance", href: "/fleet/maintenance", emoji: "🔧" },
  { id: "documents", label: "Documents", href: "/documents", emoji: "🗂" },
  { id: "compliance", label: "Compliance", href: "/compliance", emoji: "🛡" },
  { id: "notifications", label: "Notifications", href: "/notifications", emoji: "🔔" },
  { id: "drivers", label: "Driver Directory", href: "/drivers", emoji: "🚛" },
  { id: "trucks", label: "Truck Directory", href: "/fleet/trucks", emoji: "🚚" },
  { id: "brokers", label: "Broker Directory", href: "/brokers", emoji: "🏢" },
] as const;

/** Human labels for Alph workspace context (from shell / `?workspace=`). */
export const WORKSPACE_CONTEXT_LABELS: Record<string, string> = {
  home: "Home",
  dispatch: "Dispatch",
  drivers: "Drivers",
  fleet: "Fleet",
  documents: "Documents",
  finance: "Money",
  customers: "Customers",
  reports: "Reports",
  alph: "Alph",
  advanced: "Advanced",
  settings: "Settings",
};

export const ALPH_DEFAULT_FAVORITES = [
  { id: "payroll", label: "Payroll", href: "/finance?tab=payroll" },
  { id: "dispatch", label: "Dispatch", href: "/loads" },
  { id: "drivers", label: "Drivers", href: "/drivers" },
  { id: "invoices", label: "Invoices", href: "/finance?tab=invoices" },
  { id: "maintenance", label: "Maintenance", href: "/fleet/maintenance" },
  { id: "ifta", label: "IFTA", href: "/ifta" },
  { id: "reports", label: "Reports", href: "/analytics" },
] as const;

export type AlphActivityItem = {
  id: string;
  title: string;
  detail: string;
  at: string;
  href: string;
};

export type AlphRecommendation = {
  id: string;
  text: string;
  priority: "critical" | "high" | "medium" | "low";
  reason: string;
  href: string;
  resolveHref?: string;
};

export type AlphBriefingSection = {
  id: string;
  title: string;
  items: Array<{
    id: string;
    text: string;
    priority: "critical" | "high" | "medium" | "low" | "info";
    reason: string;
    actionLabel: string;
    href: string;
  }>;
};

export function greetingForNow(name: string, now = new Date()): string {
  const hour = now.getHours();
  const first = name.trim().split(/\s+/)[0] || "there";
  const display = first === "Alpha" ? "Love" : first;
  if (hour < 12) return `Good Morning, ${display}.`;
  if (hour < 17) return `Good Afternoon, ${display}.`;
  return `Good Evening, ${display}.`;
}

export function buildWorkspaceSnapshot(board: ExecutiveBoard): ExecutiveKpi[] {
  const flat = board.sections.flatMap((s) => s.kpis);
  const byId = (id: string) => flat.find((k) => k.id === id);

  const picks: ExecutiveKpi[] = [];
  const revenue = byId("revenue-today");
  const outstanding = byId("outstanding");
  const cash = byId("cash-flow");
  const loads = byId("loads-today");
  const drivers = byId("drivers-available");
  const fleet =
    byId("fleet-health") ??
    ({
      id: "fleet-health",
      label: "Fleet Health",
      value: `${board.scores.fleetHealth}/100`,
      detail: "Shop and unit readiness",
      href: "/fleet/maintenance",
      tone:
        board.scores.fleetHealth >= 80
          ? "success"
          : board.scores.fleetHealth >= 60
            ? "warning"
            : "critical",
      statusLabel:
        board.scores.fleetHealth >= 80
          ? "Healthy"
          : board.scores.fleetHealth >= 60
            ? "Needs attention"
            : "Critical",
    } satisfies ExecutiveKpi);

  if (revenue) picks.push(revenue);
  if (outstanding) picks.push(outstanding);
  if (loads) picks.push(loads);
  if (drivers) picks.push(drivers);
  if (fleet) picks.push(fleet);

  picks.push({
    id: "maintenance-due",
    label: "Maintenance Due",
    value: String(
      Math.max(0, 100 - board.scores.fleetHealth > 10 ? 3 : 1),
    ),
    detail: "PM and repairs needing attention",
    href: "/fleet/maintenance",
    tone: "warning",
    statusLabel: "Review",
    insight: "Schedule overdue work before weekend capacity fills.",
    trend: "up",
    deltaPercent: 8,
    deltaLabel: "vs last week",
  });

  picks.push({
    id: "compliance-alerts",
    label: "Compliance Alerts",
    value: String(Math.max(1, Math.round((100 - board.scores.safetyScore) / 12))),
    detail: "Expiring documents and open risks",
    href: "/compliance",
    tone: board.scores.safetyScore < 80 ? "critical" : "warning",
    statusLabel: "Action needed",
    insight: "Clear expiring medicals and permits first.",
  });

  if (cash) picks.push(cash);

  return picks.slice(0, 8);
}

export function buildWorkspaceBriefing(
  summary: AlphExecutiveSummary,
): AlphBriefingSection[] {
  const mapItems = (
    items: AlphExecutiveSummary["topPriorities"],
    fallbackPriority: AlphBriefingSection["items"][number]["priority"],
  ) =>
    items.slice(0, 4).map((item, index) => ({
      id: item.id,
      text: item.text,
      priority:
        item.severity === "critical"
          ? ("critical" as const)
          : item.severity === "warning"
            ? ("high" as const)
            : item.severity === "success"
              ? ("low" as const)
              : fallbackPriority,
      reason:
        index === 0
          ? "Highest impact on today’s operations."
          : "Detected from live Transpo.ai signals.",
      actionLabel: "Open",
      href: item.href ?? "/",
    }));

  return [
    {
      id: "priorities",
      title: "Needs Your Attention",
      items: mapItems(summary.topPriorities, "high"),
    },
    {
      id: "risks",
      title: "At Risk",
      items: mapItems(summary.risks, "critical"),
    },
    {
      id: "opportunities",
      title: "Recommended Actions",
      items: mapItems(summary.opportunities, "medium"),
    },
    {
      id: "financial",
      title: "Cash & Invoices",
      items: mapItems(summary.financialHealth, "info"),
    },
    {
      id: "fleet",
      title: "Fleet Readiness",
      items: mapItems(summary.fleetHealth, "medium"),
    },
    {
      id: "compliance",
      title: "Compliance",
      items: [
        {
          id: "comp-1",
          text: "Review expiring driver medicals and permits this week.",
          priority: "high",
          reason: "Compliance score depends on current documents.",
          actionLabel: "Open Compliance",
          href: "/compliance",
        },
      ],
    },
    {
      id: "weather",
      title: "Weather Alerts",
      items: [
        {
          id: "wx-1",
          text: "Thunderstorms along I-44 corridor this afternoon.",
          priority: "medium",
          reason: "May delay Dallas–St. Louis lanes by 45–90 minutes.",
          actionLabel: "View Loads",
          href: "/loads",
        },
      ],
    },
    {
      id: "traffic",
      title: "Traffic Alerts",
      items: [
        {
          id: "tr-1",
          text: "Construction slowdown on I-70 east of Indianapolis.",
          priority: "low",
          reason: "Affects two active loads with evening ETAs.",
          actionLabel: "Open Tracking",
          href: "/loads",
        },
      ],
    },
    {
      id: "fuel",
      title: "Fuel Trends",
      items: [
        {
          id: "fuel-1",
          text: "Fleet fuel cost is up about 9% vs last week.",
          priority: "medium",
          reason: "IFTA and expense reviews should flag outliers.",
          actionLabel: "Open IFTA",
          href: "/ifta",
        },
      ],
    },
  ];
}

export function buildWorkspaceRecommendations(
  summary: AlphExecutiveSummary,
): AlphRecommendation[] {
  const fromBriefing = [
    ...summary.risks,
    ...summary.topPriorities,
    ...summary.fleetHealth,
    ...summary.financialHealth,
  ]
    .slice(0, 5)
    .map((item, index) => ({
      id: `rec-${item.id}`,
      text: item.text,
      priority:
        item.severity === "critical"
          ? ("critical" as const)
          : item.severity === "warning"
            ? ("high" as const)
            : ("medium" as const),
      reason:
        index % 2 === 0
          ? "Alph ranked this above other open signals."
          : "Acting now prevents downstream delays.",
      href: item.href ?? "/support",
      resolveHref: item.href ?? "/support",
    }));

  if (fromBriefing.length >= 3) return fromBriefing;

  return [
    {
      id: "rec-maint",
      text: "Truck 104 maintenance is overdue.",
      priority: "high",
      reason: "PM window passed; breakdown risk is elevated.",
      href: "/fleet/maintenance",
      resolveHref: "/fleet/maintenance?tab=work_orders&create=1",
    },
    {
      id: "rec-inv",
      text: "Three invoices are overdue.",
      priority: "high",
      reason: "Cash flow depends on follow-up today.",
      href: "/finance?tab=invoices",
    },
    {
      id: "rec-med",
      text: "Driver medical expires in 8 days.",
      priority: "medium",
      reason: "Compliance alert before dispatching long hauls.",
      href: "/compliance?tab=drivers",
    },
    {
      id: "rec-fuel",
      text: "Fuel costs increased this week.",
      priority: "medium",
      reason: "Review MPG outliers and vendor prices.",
      href: "/ifta",
    },
    {
      id: "rec-broker",
      text: "Broker payment is overdue.",
      priority: "high",
      reason: "Outstanding balance needs a reminder.",
      href: "/brokers",
    },
  ];
}

export function buildWorkspaceActivity(): AlphActivityItem[] {
  return [
    {
      id: "a1",
      title: "Invoice Sent",
      detail: "INV-8841 emailed to Capital Freight",
      at: "2026-07-17T15:40:00Z",
      href: "/finance?tab=invoices",
    },
    {
      id: "a2",
      title: "Driver Assigned",
      detail: "Onkar Singh → LD-24002",
      at: "2026-07-17T14:12:00Z",
      href: "/loads/load-24002",
    },
    {
      id: "a3",
      title: "POD Uploaded",
      detail: "LD-24008 delivery photos linked",
      at: "2026-07-17T13:05:00Z",
      href: "/documents",
    },
    {
      id: "a4",
      title: "Maintenance Completed",
      detail: "Unit 102 oil service closed",
      at: "2026-07-17T11:20:00Z",
      href: "/fleet/maintenance",
    },
    {
      id: "a5",
      title: "ELD Synced",
      detail: "Samsara mileage pull succeeded",
      at: "2026-07-17T10:48:00Z",
      href: "/integrations/eld",
    },
    {
      id: "a6",
      title: "Payment Received",
      detail: "Broker quick-pay posted",
      at: "2026-07-17T09:15:00Z",
      href: "/finance?tab=broker_payments",
    },
  ];
}

const FAVORITES_KEY = "carrieros.alph.favorites.v1";

export type AlphFavorite = { id: string; label: string; href: string };

export function listAlphFavorites(): AlphFavorite[] {
  if (typeof window === "undefined") {
    return [...ALPH_DEFAULT_FAVORITES];
  }
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [...ALPH_DEFAULT_FAVORITES];
    return JSON.parse(raw) as AlphFavorite[];
  } catch {
    return [...ALPH_DEFAULT_FAVORITES];
  }
}

export function toggleAlphFavorite(item: AlphFavorite): AlphFavorite[] {
  const current = listAlphFavorites();
  const exists = current.some((f) => f.id === item.id);
  const next = exists
    ? current.filter((f) => f.id !== item.id)
    : [...current, item];
  if (typeof window !== "undefined") {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  }
  return next;
}
