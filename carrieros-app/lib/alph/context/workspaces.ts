import type { AlphWorkspaceFocus } from "@/lib/alph/identity";
import type { AlphWorkspaceKnowledge } from "@/lib/alph/context/types";

const KNOWLEDGE: Record<AlphWorkspaceFocus, AlphWorkspaceKnowledge> = {
  home: {
    focus: "home",
    domains: ["operations", "alerts", "briefing"],
    hints: ["What needs attention today?", "Show morning briefing"],
  },
  dispatch: {
    focus: "dispatch",
    domains: [
      "loads",
      "drivers",
      "trucks",
      "trailers",
      "stops",
      "appointments",
      "delays",
      "detention",
      "messages",
      "documents",
      "routes",
    ],
    hints: [
      "Which loads are delayed?",
      "Find available drivers for Dallas",
      "Show detention today",
    ],
  },
  drivers: {
    focus: "drivers",
    domains: [
      "driver_documents",
      "payroll",
      "performance",
      "violations",
      "training",
      "expirations",
      "messages",
      "history",
    ],
    hints: [
      "Who has expiring medical cards?",
      "Show driver performance this week",
      "Find drivers missing documents",
    ],
  },
  fleet: {
    focus: "fleet",
    domains: [
      "trucks",
      "trailers",
      "maintenance",
      "fuel",
      "repairs",
      "tires",
      "registration",
      "insurance",
      "inspections",
      "fleet_health",
    ],
    hints: [
      "Which trucks need maintenance?",
      "Show fuel spend this month",
      "Find Truck 105",
    ],
  },
  finance: {
    focus: "finance",
    domains: [
      "invoices",
      "payments",
      "payroll",
      "settlements",
      "expenses",
      "fuel_costs",
      "maintenance_costs",
      "ifta",
      "profitability",
    ],
    hints: [
      "Find unpaid invoices",
      "Why is profit down?",
      "Draft payroll preview",
    ],
  },
  documents: {
    focus: "documents",
    domains: [
      "rate_confirmations",
      "pod",
      "invoices",
      "fuel_receipts",
      "lumper_receipts",
      "permits",
      "insurance",
      "ocr_status",
      "document_search",
    ],
    hints: [
      "Loads missing POD",
      "Search rate confirmations",
      "Show OCR pending",
    ],
  },
  customers: {
    focus: "customers",
    domains: ["customers", "brokers", "relationships"],
    hints: ["Find broker ABC", "Who owes money?"],
  },
  reports: {
    focus: "reports",
    domains: ["analytics", "kpi", "trends"],
    hints: ["Summarize this week", "Compare revenue vs last month"],
  },
  compliance: {
    focus: "compliance",
    domains: ["expirations", "dot", "safety", "ifta"],
    hints: ["Show expiring permits", "What compliance is at risk?"],
  },
  alph: {
    focus: "alph",
    domains: ["operations", "cross_workspace"],
    hints: ["What should I do next?", "Search across my company"],
  },
  advanced: {
    focus: "advanced",
    domains: ["platform", "integrations", "automation"],
    hints: ["Open migration", "Show integrations"],
  },
  settings: {
    focus: "settings",
    domains: ["company_settings", "permissions", "ai_policy"],
    hints: ["Open permissions", "Explain AI safety policy"],
  },
  unknown: {
    focus: "unknown",
    domains: ["operations"],
    hints: ["Help me find a load", "What can Alph do?"],
  },
};

export function getWorkspaceKnowledge(
  focus: AlphWorkspaceFocus,
): AlphWorkspaceKnowledge {
  return KNOWLEDGE[focus] ?? KNOWLEDGE.unknown;
}

export function resolveWorkspaceFocus(
  workspaceId?: string,
  pathname?: string,
): AlphWorkspaceFocus {
  const id = (workspaceId ?? "").trim().toLowerCase();
  if (id && id in KNOWLEDGE) {
    return id as AlphWorkspaceFocus;
  }

  const path = (pathname ?? "").toLowerCase();
  if (path.startsWith("/loads") || path.includes("/detention") || path.includes("/planner")) {
    return "dispatch";
  }
  if (path.startsWith("/drivers")) return "drivers";
  if (path.startsWith("/fleet")) return "fleet";
  if (path.startsWith("/finance") || path.startsWith("/payroll") || path.startsWith("/ifta") || path.startsWith("/wallet")) {
    return "finance";
  }
  if (path.startsWith("/documents")) return "documents";
  if (path.startsWith("/customers") || path.startsWith("/brokers") || path.startsWith("/companies")) {
    return "customers";
  }
  if (path.startsWith("/analytics") || path.startsWith("/reports")) return "reports";
  if (path.startsWith("/compliance")) return "compliance";
  if (path.startsWith("/alph")) return "alph";
  if (path.startsWith("/settings") || path.startsWith("/setup")) return "settings";
  if (path.startsWith("/advanced") || path.startsWith("/platform") || path.startsWith("/integrations")) {
    return "advanced";
  }
  if (path === "/" || path.startsWith("/dashboard")) return "home";
  return "unknown";
}
