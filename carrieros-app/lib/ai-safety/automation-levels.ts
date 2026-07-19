import {
  isCriticalAiAction,
  type AiActionKind,
} from "@/lib/ai-safety/confirmation";

export type AutomationLevel = "manual" | "semi" | "full";

export const AUTOMATION_LEVELS: AutomationLevel[] = [
  "manual",
  "semi",
  "full",
];

export const AUTOMATION_LEVEL_LABELS: Record<AutomationLevel, string> = {
  manual: "Manual",
  semi: "Semi-Automatic",
  full: "Fully Automated",
};

export const AUTOMATION_LEVEL_DESCRIPTIONS: Record<AutomationLevel, string> = {
  manual:
    "Alph suggests only. Every action waits for you — nothing runs on its own.",
  semi: "Alph can prepare drafts and low-risk admin steps. Critical actions always need your approval.",
  full: "Low-risk admin tasks may run automatically. Money, payroll, safety, compliance, legal, and employment never bypass approvals.",
};

export type AutomationEligibility = {
  allowed: boolean;
  reason: string;
};

/**
 * Fully Automated is limited to low-risk admin.
 * Critical action kinds are never eligible regardless of company preference.
 */
export function canFullyAutomate(actionKind: AiActionKind): AutomationEligibility {
  if (isCriticalAiAction(actionKind)) {
    return {
      allowed: false,
      reason:
        "Critical actions never run Fully Automated. Human approval is always required.",
    };
  }

  const lowRiskAdmin: AiActionKind[] = [
    "read_summarize",
    "suggest_dispatch",
    "suggest_route",
    "suggest_fuel",
    "detect_anomaly",
    "explain_data",
    "generate_report",
    "translate",
    "prepare_draft",
    "recommend_action",
    "payroll_suggest",
    "invoice_suggest",
    "maintenance_suggest",
    "navigate",
  ];

  if (!lowRiskAdmin.includes(actionKind)) {
    return {
      allowed: false,
      reason: "This action is not eligible for Fully Automated mode.",
    };
  }

  return {
    allowed: true,
    reason: "Low-risk admin — eligible for Fully Automated when enabled.",
  };
}

export function actionAllowedAtLevel(
  actionKind: AiActionKind,
  level: AutomationLevel,
): AutomationEligibility {
  if (level === "manual") {
    return {
      allowed: false,
      reason: "Company preference is Manual — Alph will only suggest.",
    };
  }

  if (isCriticalAiAction(actionKind)) {
    return {
      allowed: false,
      reason:
        "Critical actions always require human confirmation, at every automation level.",
    };
  }

  if (level === "semi") {
    return {
      allowed: true,
      reason: "Semi-Automatic may prepare this; confirm before anything critical.",
    };
  }

  return canFullyAutomate(actionKind);
}
