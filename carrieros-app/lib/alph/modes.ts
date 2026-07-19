/**
 * Alph interaction modes — one assistant, multiple interaction types.
 * ACT never executes silently.
 */

export type AlphMode =
  | "ask"
  | "search"
  | "draft"
  | "analyze"
  | "recommend"
  | "act";

export const ALPH_MODES: readonly AlphMode[] = [
  "ask",
  "search",
  "draft",
  "analyze",
  "recommend",
  "act",
] as const;

export const ALPH_MODE_LABELS: Record<AlphMode, string> = {
  ask: "Ask",
  search: "Search",
  draft: "Draft",
  analyze: "Analyze",
  recommend: "Recommend",
  act: "Act",
};

export const ALPH_MODE_DESCRIPTIONS: Record<AlphMode, string> = {
  ask: "Answer questions and explain records.",
  search: "Find business records across authorized data.",
  draft: "Prepare messages, emails, invoices, notes, and reports.",
  analyze: "Compare performance, costs, revenue, and trends.",
  recommend: "Suggest actions — clearly labeled as recommendations.",
  act: "Prepare an action for human approval. Never silent.",
};

/** Modes that may call read tools. */
export function modeAllowsReadTools(mode: AlphMode): boolean {
  return mode !== "act" || true; // ACT may read while preparing approval
}

/** Modes that may create drafts (no send/finalize). */
export function modeAllowsDrafts(mode: AlphMode): boolean {
  return mode === "draft" || mode === "recommend" || mode === "act";
}

/** Only ACT may create approval requests. */
export function modeAllowsApprovalRequests(mode: AlphMode): boolean {
  return mode === "act";
}

export function parseAlphMode(value: string | undefined | null): AlphMode {
  const v = (value ?? "").trim().toLowerCase();
  if (
    v === "ask" ||
    v === "search" ||
    v === "draft" ||
    v === "analyze" ||
    v === "recommend" ||
    v === "act"
  ) {
    return v;
  }
  return "ask";
}
