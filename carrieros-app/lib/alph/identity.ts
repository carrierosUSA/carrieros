/**
 * One Alph only — identity constants.
 * Workspace routes are context focuses of the same assistant, not separate AIs.
 */

export const ALPH_ASSISTANT_ID = "alph" as const;
export const ALPH_ASSISTANT_NAME = "Alph" as const;

export const ALPH_IDENTITY = {
  id: ALPH_ASSISTANT_ID,
  name: ALPH_ASSISTANT_NAME,
  tagline: "Alph assists. You decide.",
  /** There is never more than one assistant product. */
  oneAlphOnly: true as const,
} as const;

/** Workspace focuses (UI routes) — same Alph, different retrieval bias. */
export type AlphWorkspaceFocus =
  | "home"
  | "dispatch"
  | "drivers"
  | "fleet"
  | "documents"
  | "finance"
  | "customers"
  | "reports"
  | "compliance"
  | "alph"
  | "advanced"
  | "settings"
  | "unknown";

export function isAlphWorkspaceFocus(value: string): value is AlphWorkspaceFocus {
  return (
    value === "home" ||
    value === "dispatch" ||
    value === "drivers" ||
    value === "fleet" ||
    value === "documents" ||
    value === "finance" ||
    value === "customers" ||
    value === "reports" ||
    value === "compliance" ||
    value === "alph" ||
    value === "advanced" ||
    value === "settings" ||
    value === "unknown"
  );
}
