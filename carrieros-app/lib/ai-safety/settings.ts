import type { AutomationLevel } from "@/lib/ai-safety/automation-levels";

const STORAGE_KEY = "transpo.ai-safety.settings";

export type AiSafetyCompanySettings = {
  automationLevel: AutomationLevel;
  /** Default OFF — Alph must not contact customers unless authorized. */
  allowAlphContactCustomers: boolean;
  updatedAt: string;
};

export const DEFAULT_AI_SAFETY_SETTINGS: AiSafetyCompanySettings = {
  automationLevel: "semi",
  allowAlphContactCustomers: false,
  updatedAt: new Date(0).toISOString(),
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getAiSafetySettings(): AiSafetyCompanySettings {
  if (!canUseStorage()) {
    return { ...DEFAULT_AI_SAFETY_SETTINGS };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_AI_SAFETY_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<AiSafetyCompanySettings>;
    return {
      automationLevel:
        parsed.automationLevel === "manual" ||
        parsed.automationLevel === "semi" ||
        parsed.automationLevel === "full"
          ? parsed.automationLevel
          : DEFAULT_AI_SAFETY_SETTINGS.automationLevel,
      allowAlphContactCustomers: Boolean(parsed.allowAlphContactCustomers),
      updatedAt: parsed.updatedAt ?? DEFAULT_AI_SAFETY_SETTINGS.updatedAt,
    };
  } catch {
    return { ...DEFAULT_AI_SAFETY_SETTINGS };
  }
}

export function saveAiSafetySettings(
  patch: Partial<
    Pick<AiSafetyCompanySettings, "automationLevel" | "allowAlphContactCustomers">
  >,
): AiSafetyCompanySettings {
  const current = getAiSafetySettings();
  const next: AiSafetyCompanySettings = {
    automationLevel: patch.automationLevel ?? current.automationLevel,
    allowAlphContactCustomers:
      patch.allowAlphContactCustomers ?? current.allowAlphContactCustomers,
    updatedAt: new Date().toISOString(),
  };

  if (canUseStorage()) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  return next;
}

export function mayAlphContactCustomers(): boolean {
  return getAiSafetySettings().allowAlphContactCustomers;
}
