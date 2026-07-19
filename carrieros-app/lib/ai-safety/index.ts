export {
  AI_AUDIT_FIELDS,
  AI_CONFIRMATION_CATEGORIES,
  AI_CONFIRMATION_CATEGORY_LABELS,
  AI_MAY,
  AI_NEVER,
  AI_POLICY_ASSISTANT,
  AI_POLICY_BRAND,
  AI_POLICY_CHARTER_HREF,
  AI_POLICY_CHARTER_TITLE,
  AI_POLICY_CONSTITUTION_HREF,
  AI_POLICY_CONSTITUTION_TITLE,
  AI_POLICY_GOVERNED_BY,
  AI_POLICY_HREF,
  AI_POLICY_PHILOSOPHY,
  AI_POLICY_SETTINGS_HREF,
  AI_POLICY_TAGLINE,
  AI_SAFETY_FIRST,
  AI_TRANSPARENCY_POINTS,
  type AiConfirmationCategory,
} from "@/lib/ai-safety/policy";

export {
  CONFIDENCE_DESCRIPTIONS,
  CONFIDENCE_LABELS,
  CONFIDENCE_LEVELS,
  confidenceBadgeClasses,
  scoreToConfidenceLevel,
  type ConfidenceLevel,
} from "@/lib/ai-safety/confidence";

export {
  AI_ACTION_TAXONOMY,
  alphIntentToActionKind,
  automationActionToKind,
  getAiActionLabel,
  isCriticalAiAction,
  requiresHumanConfirmation,
  type AiActionKind,
  type AiActionTaxonomyEntry,
} from "@/lib/ai-safety/confirmation";

export {
  AUTOMATION_LEVEL_DESCRIPTIONS,
  AUTOMATION_LEVEL_LABELS,
  AUTOMATION_LEVELS,
  actionAllowedAtLevel,
  canFullyAutomate,
  type AutomationEligibility,
  type AutomationLevel,
} from "@/lib/ai-safety/automation-levels";

export {
  appendAiAudit,
  clearAiAudit,
  listAiAudit,
  type AiAuditApproval,
  type AiAuditEntry,
  type AppendAiAuditInput,
} from "@/lib/ai-safety/audit";

export {
  DEFAULT_AI_SAFETY_SETTINGS,
  getAiSafetySettings,
  mayAlphContactCustomers,
  saveAiSafetySettings,
  type AiSafetyCompanySettings,
} from "@/lib/ai-safety/settings";

export {
  runAiSuggestedAction,
  type RunAiSuggestedActionInput,
  type RunAiSuggestedActionResult,
} from "@/lib/ai-safety/run-suggested-action";
