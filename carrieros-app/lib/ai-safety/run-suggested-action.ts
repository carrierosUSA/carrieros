import { appendAiAudit } from "@/lib/ai-safety/audit";
import type { ConfidenceLevel } from "@/lib/ai-safety/confidence";
import {
  getAiActionLabel,
  isCriticalAiAction,
  requiresHumanConfirmation,
  type AiActionKind,
} from "@/lib/ai-safety/confirmation";
import { mayAlphContactCustomers } from "@/lib/ai-safety/settings";

export type RunAiSuggestedActionInput = {
  kind: AiActionKind;
  suggestion: string;
  confidence: ConfidenceLevel;
  /** Why Alph suggested this. */
  reason?: string;
  /** Data sources Alph used. */
  dataUsed?: string[];
  previousValue?: string;
  newValue?: string;
  source?: string;
  user?: string;
  /**
   * Called only after human approval (or immediately when confirmation
   * is not required). Must not be invoked for blocked critical silent paths.
   */
  onConfirm: () => void | Promise<void>;
  /**
   * When confirmation is required, open the modal. Resolves true if approved.
   * Injected by AiSafetyProvider — without it, critical actions are blocked.
   */
  requestConfirmation?: (payload: {
    kind: AiActionKind;
    suggestion: string;
    confidence: ConfidenceLevel;
    reason?: string;
    dataUsed?: string[];
  }) => Promise<boolean>;
};

export type RunAiSuggestedActionResult = {
  executed: boolean;
  approval:
    | "not_required"
    | "approved"
    | "cancelled"
    | "blocked"
    | "pending";
  reason: string;
};

/**
 * Gate AI-suggested side effects.
 * - Always writes an audit entry
 * - Never silently executes critical kinds
 * - If confirmation required → modal via requestConfirmation
 */
export async function runAiSuggestedAction(
  input: RunAiSuggestedActionInput,
): Promise<RunAiSuggestedActionResult> {
  const label = getAiActionLabel(input.kind);
  const needsConfirm = requiresHumanConfirmation(input.kind);
  const critical = isCriticalAiAction(input.kind);

  if (input.kind === "contact_customer" && !mayAlphContactCustomers()) {
    appendAiAudit({
      user: input.user,
      actionKind: input.kind,
      aiAction: label,
      suggestion: input.suggestion,
      approval: "blocked",
      reason:
        "Company setting: Alph is not authorized to contact customers. Enable in AI Safety Policy settings.",
      confidence: input.confidence,
      dataUsed: input.dataUsed,
      previousValue: input.previousValue,
      newValue: input.newValue,
      source: input.source,
    });
    return {
      executed: false,
      approval: "blocked",
      reason:
        "Alph is not authorized to contact customers. Turn this on in Settings → AI Safety Policy.",
    };
  }

  if (!needsConfirm) {
    appendAiAudit({
      user: input.user,
      actionKind: input.kind,
      aiAction: label,
      suggestion: input.suggestion,
      approval: "not_required",
      reason: input.reason,
      confidence: input.confidence,
      dataUsed: input.dataUsed,
      previousValue: input.previousValue,
      newValue: input.newValue,
      source: input.source,
    });
    await input.onConfirm();
    return {
      executed: true,
      approval: "not_required",
      reason: "Suggestion applied — confirmation not required for this action.",
    };
  }

  if (!input.requestConfirmation) {
    appendAiAudit({
      user: input.user,
      actionKind: input.kind,
      aiAction: label,
      suggestion: input.suggestion,
      approval: "blocked",
      reason:
        "Confirmation required but no confirmation UI was available. Critical actions never run silently.",
      confidence: input.confidence,
      dataUsed: input.dataUsed,
      source: input.source,
    });
    return {
      executed: false,
      approval: "blocked",
      reason: critical
        ? "This critical action needs your approval. Open Alph again and confirm in the dialog."
        : "Human confirmation is required before this action can run.",
    };
  }

  appendAiAudit({
    user: input.user,
    actionKind: input.kind,
    aiAction: label,
    suggestion: input.suggestion,
    approval: "pending",
    reason: input.reason,
    confidence: input.confidence,
    dataUsed: input.dataUsed,
    source: input.source,
  });

  const approved = await input.requestConfirmation({
    kind: input.kind,
    suggestion: input.suggestion,
    confidence: input.confidence,
    reason: input.reason,
    dataUsed: input.dataUsed,
  });

  if (!approved) {
    appendAiAudit({
      user: input.user,
      actionKind: input.kind,
      aiAction: label,
      suggestion: input.suggestion,
      approval: "cancelled",
      reason: input.reason ?? "User cancelled confirmation",
      confidence: input.confidence,
      dataUsed: input.dataUsed,
      previousValue: input.previousValue,
      newValue: input.newValue,
      source: input.source,
    });
    return {
      executed: false,
      approval: "cancelled",
      reason: "You cancelled — nothing was changed.",
    };
  }

  appendAiAudit({
    user: input.user,
    actionKind: input.kind,
    aiAction: label,
    suggestion: input.suggestion,
    approval: "approved",
    reason: input.reason,
    confidence: input.confidence,
    dataUsed: input.dataUsed,
    previousValue: input.previousValue,
    newValue: input.newValue,
    source: input.source,
  });

  await input.onConfirm();

  return {
    executed: true,
    approval: "approved",
    reason: "Approved by you — Alph assisted; you decided.",
  };
}
