/**
 * Company Autopilot settings + admin-configurable approval rules.
 * Stored client-side for demo; swap to company settings store when IAM lands.
 */

import type { AiActionKind } from "@/lib/ai-safety/confirmation";
import {
  getAiSafetySettings,
  saveAiSafetySettings,
} from "@/lib/ai-safety/settings";
import {
  ALWAYS_REQUIRE_APPROVAL_KINDS,
  automationLevelToAutopilotMode,
  autopilotModeToAutomationLevel,
  parseAutopilotMode,
  type AutopilotMode,
} from "@/lib/alph/autopilot/modes";

const STORAGE_KEY = "transpo.alph.autopilot.settings";

export type AutopilotApprovalRule = {
  id: string;
  actionKind: AiActionKind;
  label: string;
  /** When true, Alph must create an approval request before execution. */
  requireApproval: boolean;
  /** Locked rules cannot be turned off by admins (Constitution). */
  locked: boolean;
  description: string;
};

export type AlphAutopilotSettings = {
  mode: AutopilotMode;
  /** Confidence below this → always require review (0–1). */
  minConfidenceToAct: number;
  allowDemoExtraction: boolean;
  approvalRules: AutopilotApprovalRule[];
  updatedAt: string;
};

const DEFAULT_RULES: AutopilotApprovalRule[] = [
  {
    id: "rule-create-load",
    actionKind: "change_critical_record",
    label: "Create / change load from AI extraction",
    requireApproval: true,
    locked: true,
    description: "RC → load and similar writes always need review.",
  },
  {
    id: "rule-invoice",
    actionKind: "invoice_approve",
    label: "Prepare or send invoice",
    requireApproval: true,
    locked: true,
    description: "Money actions never auto-send.",
  },
  {
    id: "rule-payroll",
    actionKind: "payroll_approve",
    label: "Payroll / settlements",
    requireApproval: true,
    locked: true,
    description: "Never send payment without approval.",
  },
  {
    id: "rule-tax",
    actionKind: "government_filing",
    label: "Tax / government filing",
    requireApproval: true,
    locked: true,
    description: "Tax packages and filings always need a human.",
  },
  {
    id: "rule-delete",
    actionKind: "change_critical_record",
    label: "Deletes & irreversible changes",
    requireApproval: true,
    locked: true,
    description: "Deletes never run on Autopilot alone.",
  },
  {
    id: "rule-dispatch-reassign",
    actionKind: "accept_reject_freight",
    label: "High-impact dispatch reassignment",
    requireApproval: true,
    locked: true,
    description: "Reassigning live freight needs approval.",
  },
  {
    id: "rule-marketing",
    actionKind: "contact_customer",
    label: "External marketing / customer outreach",
    requireApproval: true,
    locked: true,
    description: "Alph never markets or emails customers without approval.",
  },
  {
    id: "rule-low-confidence",
    actionKind: "other",
    label: "Low-confidence AI actions",
    requireApproval: true,
    locked: false,
    description: "Below company confidence threshold → review queue.",
  },
  {
    id: "rule-ocr-link",
    actionKind: "prepare_draft",
    label: "OCR classify & autofill drafts",
    requireApproval: false,
    locked: false,
    description: "Draft extraction may run in Approve/Autopilot; writes still gated.",
  },
];

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function defaultSettings(): AlphAutopilotSettings {
  const safety = getAiSafetySettings();
  return {
    mode: automationLevelToAutopilotMode(safety.automationLevel),
    minConfidenceToAct: 0.85,
    allowDemoExtraction: true,
    approvalRules: DEFAULT_RULES.map((r) => ({ ...r })),
    updatedAt: new Date(0).toISOString(),
  };
}

export function getAlphAutopilotSettings(): AlphAutopilotSettings {
  const base = defaultSettings();
  if (!canUseStorage()) return base;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<AlphAutopilotSettings>;
    const mode = parseAutopilotMode(parsed.mode ?? base.mode);
    const rules = mergeRules(parsed.approvalRules);
    return {
      mode,
      minConfidenceToAct:
        typeof parsed.minConfidenceToAct === "number"
          ? Math.min(1, Math.max(0.5, parsed.minConfidenceToAct))
          : base.minConfidenceToAct,
      allowDemoExtraction:
        parsed.allowDemoExtraction === undefined
          ? true
          : Boolean(parsed.allowDemoExtraction),
      approvalRules: rules,
      updatedAt: parsed.updatedAt ?? base.updatedAt,
    };
  } catch {
    return base;
  }
}

function mergeRules(
  incoming: AutopilotApprovalRule[] | undefined,
): AutopilotApprovalRule[] {
  if (!incoming?.length) return DEFAULT_RULES.map((r) => ({ ...r }));
  return DEFAULT_RULES.map((def) => {
    const found = incoming.find((r) => r.id === def.id);
    if (!found) return { ...def };
    if (def.locked) {
      return { ...def, requireApproval: true };
    }
    return {
      ...def,
      requireApproval: Boolean(found.requireApproval),
    };
  });
}

export function saveAlphAutopilotSettings(
  patch: Partial<
    Pick<
      AlphAutopilotSettings,
      "mode" | "minConfidenceToAct" | "allowDemoExtraction" | "approvalRules"
    >
  >,
): AlphAutopilotSettings {
  const current = getAlphAutopilotSettings();
  const next: AlphAutopilotSettings = {
    mode: patch.mode ? parseAutopilotMode(patch.mode) : current.mode,
    minConfidenceToAct:
      typeof patch.minConfidenceToAct === "number"
        ? Math.min(1, Math.max(0.5, patch.minConfidenceToAct))
        : current.minConfidenceToAct,
    allowDemoExtraction:
      patch.allowDemoExtraction ?? current.allowDemoExtraction,
    approvalRules: patch.approvalRules
      ? mergeRules(patch.approvalRules)
      : current.approvalRules,
    updatedAt: new Date().toISOString(),
  };

  // Keep ai-safety automation level in sync (single policy surface).
  saveAiSafetySettings({
    automationLevel: autopilotModeToAutomationLevel(next.mode),
  });

  if (canUseStorage()) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore quota
    }
  }

  return next;
}

export function ruleRequiresApproval(
  actionKind: AiActionKind,
  settings?: AlphAutopilotSettings,
): boolean {
  const s = settings ?? getAlphAutopilotSettings();
  if (ALWAYS_REQUIRE_APPROVAL_KINDS.includes(actionKind)) return true;
  const rule = s.approvalRules.find((r) => r.actionKind === actionKind);
  if (rule) return rule.requireApproval || rule.locked;
  return true;
}

export function confidenceRequiresReview(
  confidence: number,
  settings?: AlphAutopilotSettings,
): boolean {
  const s = settings ?? getAlphAutopilotSettings();
  return confidence < s.minConfidenceToAct;
}
