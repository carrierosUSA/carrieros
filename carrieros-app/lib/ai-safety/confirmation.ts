import type { AiConfirmationCategory } from "@/lib/ai-safety/policy";

/**
 * Taxonomy of AI-suggested actions that may be gated.
 * Critical kinds never auto-execute without human confirmation.
 */
export type AiActionKind =
  | "read_summarize"
  | "suggest_dispatch"
  | "suggest_route"
  | "suggest_fuel"
  | "detect_anomaly"
  | "explain_data"
  | "generate_report"
  | "translate"
  | "prepare_draft"
  | "recommend_action"
  | "payroll_suggest"
  | "payroll_approve"
  | "invoice_suggest"
  | "invoice_approve"
  | "settlement_approve"
  | "financial_decision"
  | "maintenance_suggest"
  | "maintenance_approve"
  | "safety_violation_decide"
  | "employment_decision"
  | "discipline"
  | "accept_reject_freight"
  | "sign_contract"
  | "government_filing"
  | "contact_customer"
  | "contact_government"
  | "change_critical_record"
  | "mark_delivered"
  | "legal_decision"
  | "compliance_report"
  | "enable_full_automation"
  | "navigate"
  | "other";

export type AiActionTaxonomyEntry = {
  kind: AiActionKind;
  label: string;
  /** Always requires explicit human confirmation before execution. */
  requiresConfirmation: boolean;
  /** Never eligible for Fully Automated company preference. */
  critical: boolean;
  categories: AiConfirmationCategory[];
};

export const AI_ACTION_TAXONOMY: Record<AiActionKind, AiActionTaxonomyEntry> = {
  read_summarize: {
    kind: "read_summarize",
    label: "Read / summarize",
    requiresConfirmation: false,
    critical: false,
    categories: [],
  },
  suggest_dispatch: {
    kind: "suggest_dispatch",
    label: "Suggest dispatch",
    requiresConfirmation: false,
    critical: false,
    categories: [],
  },
  suggest_route: {
    kind: "suggest_route",
    label: "Suggest route",
    requiresConfirmation: false,
    critical: false,
    categories: [],
  },
  suggest_fuel: {
    kind: "suggest_fuel",
    label: "Suggest fuel",
    requiresConfirmation: false,
    critical: false,
    categories: [],
  },
  detect_anomaly: {
    kind: "detect_anomaly",
    label: "Detect unusual activity",
    requiresConfirmation: false,
    critical: false,
    categories: [],
  },
  explain_data: {
    kind: "explain_data",
    label: "Explain data",
    requiresConfirmation: false,
    critical: false,
    categories: [],
  },
  generate_report: {
    kind: "generate_report",
    label: "Generate report",
    requiresConfirmation: false,
    critical: false,
    categories: [],
  },
  translate: {
    kind: "translate",
    label: "Translate",
    requiresConfirmation: false,
    critical: false,
    categories: [],
  },
  prepare_draft: {
    kind: "prepare_draft",
    label: "Prepare draft",
    requiresConfirmation: false,
    critical: false,
    categories: [],
  },
  recommend_action: {
    kind: "recommend_action",
    label: "Recommend action",
    requiresConfirmation: false,
    critical: false,
    categories: [],
  },
  payroll_suggest: {
    kind: "payroll_suggest",
    label: "Suggest payroll",
    requiresConfirmation: false,
    critical: false,
    categories: ["payroll"],
  },
  payroll_approve: {
    kind: "payroll_approve",
    label: "Approve payroll",
    requiresConfirmation: true,
    critical: true,
    categories: ["payroll", "money", "employment"],
  },
  invoice_suggest: {
    kind: "invoice_suggest",
    label: "Suggest invoice",
    requiresConfirmation: false,
    critical: false,
    categories: ["money"],
  },
  invoice_approve: {
    kind: "invoice_approve",
    label: "Approve invoice",
    requiresConfirmation: true,
    critical: true,
    categories: ["money", "business_records"],
  },
  settlement_approve: {
    kind: "settlement_approve",
    label: "Approve settlement",
    requiresConfirmation: true,
    critical: true,
    categories: ["money", "payroll"],
  },
  financial_decision: {
    kind: "financial_decision",
    label: "Financial decision",
    requiresConfirmation: true,
    critical: true,
    categories: ["money"],
  },
  maintenance_suggest: {
    kind: "maintenance_suggest",
    label: "Suggest maintenance",
    requiresConfirmation: false,
    critical: false,
    categories: [],
  },
  maintenance_approve: {
    kind: "maintenance_approve",
    label: "Approve maintenance",
    requiresConfirmation: true,
    critical: true,
    categories: ["safety", "business_records"],
  },
  safety_violation_decide: {
    kind: "safety_violation_decide",
    label: "Decide safety violation",
    requiresConfirmation: true,
    critical: true,
    categories: ["safety", "compliance", "legal"],
  },
  employment_decision: {
    kind: "employment_decision",
    label: "Employment decision",
    requiresConfirmation: true,
    critical: true,
    categories: ["employment"],
  },
  discipline: {
    kind: "discipline",
    label: "Discipline / terminate",
    requiresConfirmation: true,
    critical: true,
    categories: ["employment", "legal"],
  },
  accept_reject_freight: {
    kind: "accept_reject_freight",
    label: "Accept or reject freight",
    requiresConfirmation: true,
    critical: true,
    categories: ["contracts", "money"],
  },
  sign_contract: {
    kind: "sign_contract",
    label: "Sign contract",
    requiresConfirmation: true,
    critical: true,
    categories: ["contracts", "legal"],
  },
  government_filing: {
    kind: "government_filing",
    label: "Government filing",
    requiresConfirmation: true,
    critical: true,
    categories: ["government_reporting", "compliance", "legal"],
  },
  contact_customer: {
    kind: "contact_customer",
    label: "Contact customer",
    requiresConfirmation: true,
    critical: true,
    categories: ["customer_relationships"],
  },
  contact_government: {
    kind: "contact_government",
    label: "Contact government",
    requiresConfirmation: true,
    critical: true,
    categories: ["government_reporting", "legal"],
  },
  change_critical_record: {
    kind: "change_critical_record",
    label: "Change critical record",
    requiresConfirmation: true,
    critical: true,
    categories: ["business_records"],
  },
  mark_delivered: {
    kind: "mark_delivered",
    label: "Mark delivered",
    requiresConfirmation: true,
    critical: true,
    categories: ["business_records", "money"],
  },
  legal_decision: {
    kind: "legal_decision",
    label: "Legal decision",
    requiresConfirmation: true,
    critical: true,
    categories: ["legal"],
  },
  compliance_report: {
    kind: "compliance_report",
    label: "Compliance report",
    requiresConfirmation: true,
    critical: true,
    categories: ["compliance", "government_reporting"],
  },
  enable_full_automation: {
    kind: "enable_full_automation",
    label: "Enable full automation",
    requiresConfirmation: true,
    critical: true,
    categories: ["business_records"],
  },
  navigate: {
    kind: "navigate",
    label: "Navigate",
    requiresConfirmation: false,
    critical: false,
    categories: [],
  },
  other: {
    kind: "other",
    label: "Other",
    requiresConfirmation: false,
    critical: false,
    categories: [],
  },
};

export function requiresHumanConfirmation(actionKind: AiActionKind): boolean {
  return AI_ACTION_TAXONOMY[actionKind].requiresConfirmation;
}

export function isCriticalAiAction(actionKind: AiActionKind): boolean {
  return AI_ACTION_TAXONOMY[actionKind].critical;
}

export function getAiActionLabel(actionKind: AiActionKind): string {
  return AI_ACTION_TAXONOMY[actionKind].label;
}

/** Map Alph Copilot / command intents to gated action kinds. */
export function alphIntentToActionKind(intent: string): AiActionKind {
  switch (intent) {
    case "generate_payroll":
      return "payroll_approve";
    case "create_invoice":
      return "invoice_approve";
    case "pay_invoice":
      return "financial_decision";
    case "assign_driver":
      return "employment_decision";
    case "schedule_maintenance":
      return "maintenance_approve";
    case "generate_ifta":
      return "government_filing";
    case "upload_pod":
      return "mark_delivered";
    case "create_load":
      return "accept_reject_freight";
    case "open_network_ai":
    case "open_exchange_ai":
    case "wallet_share":
      return "recommend_action";
    case "morning_briefing":
    case "show_loads":
    case "find_drivers":
    case "best_broker":
    case "top_profit_truck":
    case "loads_missing_pod":
    case "show_cash_flow":
    case "who_owes_money":
    case "why_profit_down":
    case "why_fleet_health":
    case "driver_performance":
      return "explain_data";
    default:
      if (intent.startsWith("open_") || intent.startsWith("show_")) {
        return "navigate";
      }
      return "other";
  }
}

/** Platform Automation Center action ids → AI action kinds. */
export function automationActionToKind(actionId: string): AiActionKind {
  switch (actionId) {
    case "create_invoice":
      return "invoice_approve";
    case "schedule_maintenance":
      return "maintenance_approve";
    case "sync_accounting":
      return "financial_decision";
    case "match_freight":
      return "accept_reject_freight";
    case "notify_team":
      return "recommend_action";
    case "suggest_loads":
      return "suggest_dispatch";
    case "request_document":
      return "prepare_draft";
    case "open_workflow":
      return "navigate";
    default:
      return "other";
  }
}
