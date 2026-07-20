/**
 * Product-facing Autopilot modes.
 * Maps onto existing AutomationLevel (manual / semi / full) without a parallel policy.
 *
 * Assist  → Alph suggests only
 * Approve → Alph prepares drafts; humans approve before writes
 * Autopilot → Low-risk admin may run; money/payroll/legal/compliance never bypass approvals
 */

import type { AutomationLevel } from "@/lib/ai-safety/automation-levels";
import {
  actionAllowedAtLevel,
  canFullyAutomate,
  type AutomationEligibility,
} from "@/lib/ai-safety/automation-levels";
import {
  isCriticalAiAction,
  type AiActionKind,
} from "@/lib/ai-safety/confirmation";

export type AutopilotMode = "assist" | "approve" | "autopilot";

export const AUTOPILOT_MODES: readonly AutopilotMode[] = [
  "assist",
  "approve",
  "autopilot",
] as const;

export const AUTOPILOT_MODE_LABELS: Record<AutopilotMode, string> = {
  assist: "Assist",
  approve: "Approve",
  autopilot: "Autopilot",
};

export const AUTOPILOT_MODE_DESCRIPTIONS: Record<AutopilotMode, string> = {
  assist:
    "Alph suggests only. Every action waits for you — nothing runs on its own.",
  approve:
    "Alph prepares drafts and previews. You approve before any write, send, or money action.",
  autopilot:
    "Low-risk admin may run automatically. Money, payroll, tax, deletes, legal, and high-impact dispatch never bypass approvals.",
};

/** Always require human approval — Constitution + Master Command. */
export const ALWAYS_REQUIRE_APPROVAL_KINDS: readonly AiActionKind[] = [
  "payroll_approve",
  "invoice_approve",
  "settlement_approve",
  "financial_decision",
  "government_filing",
  "legal_decision",
  "compliance_report",
  "sign_contract",
  "employment_decision",
  "discipline",
  "safety_violation_decide",
  "change_critical_record",
  "mark_delivered",
  "contact_customer",
  "contact_government",
  "accept_reject_freight",
  "enable_full_automation",
] as const;

export function autopilotModeToAutomationLevel(
  mode: AutopilotMode,
): AutomationLevel {
  switch (mode) {
    case "assist":
      return "manual";
    case "approve":
      return "semi";
    case "autopilot":
      return "full";
  }
}

export function automationLevelToAutopilotMode(
  level: AutomationLevel,
): AutopilotMode {
  switch (level) {
    case "manual":
      return "assist";
    case "semi":
      return "approve";
    case "full":
      return "autopilot";
  }
}

export function parseAutopilotMode(
  value: string | undefined | null,
): AutopilotMode {
  const v = (value ?? "").trim().toLowerCase();
  if (v === "assist" || v === "approve" || v === "autopilot") return v;
  if (v === "manual") return "assist";
  if (v === "semi") return "approve";
  if (v === "full") return "autopilot";
  return "approve";
}

export function actionAllowedAtAutopilotMode(
  actionKind: AiActionKind,
  mode: AutopilotMode,
): AutomationEligibility {
  if (ALWAYS_REQUIRE_APPROVAL_KINDS.includes(actionKind)) {
    return {
      allowed: false,
      reason:
        "This action always requires human approval (money, payroll, tax, legal, compliance, or high-impact ops).",
    };
  }
  if (isCriticalAiAction(actionKind) && mode === "autopilot") {
    return canFullyAutomate(actionKind);
  }
  return actionAllowedAtLevel(
    actionKind,
    autopilotModeToAutomationLevel(mode),
  );
}
