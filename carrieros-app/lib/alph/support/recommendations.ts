/**
 * Enrich support issues into what / why / action / Let Alph handle / confidence.
 * Reuses existing SupportIssue — does not rewrite Home layout.
 */

import type { SupportIssue } from "@/lib/support/types";

export type AlphSupportRecommendation = {
  issueId: string;
  ticketNumber: string;
  /** What is happening */
  what: string;
  /** Why it matters */
  why: string;
  /** Suggested next human action */
  action: string;
  /** Whether Alph can prepare a safe repair (never silent critical) */
  letAlphHandle: {
    available: boolean;
    label: string;
    reason: string;
  };
  confidence: number;
  severity: SupportIssue["severity"];
  href?: string;
};

function confidenceFor(issue: SupportIssue): number {
  if (issue.rootCause && issue.alphDiagnosis) return 0.88;
  if (issue.alphDiagnosis) return 0.72;
  if (issue.severity === "informational") return 0.6;
  return 0.55;
}

export function toAlphSupportRecommendation(
  issue: SupportIssue,
): AlphSupportRecommendation {
  const autoOk = issue.autoResolvable && !issue.risky;
  return {
    issueId: issue.id,
    ticketNumber: issue.ticketNumber,
    what: issue.humanMessage || issue.title,
    why:
      issue.rootCause ||
      issue.summary ||
      "This may block operations, billing, or compliance until resolved.",
    action:
      issue.workaround ||
      (issue.status === "waiting_for_user"
        ? "Complete the requested step in settings or documents."
        : "Review the diagnosis and approve a safe repair if offered."),
    letAlphHandle: {
      available: autoOk,
      label: autoOk ? "Let Alph handle" : "Review required",
      reason: issue.risky
        ? "Risky or money/compliance-related — Alph will only prepare a preview for your approval."
        : autoOk
          ? "Alph can attempt a safe auto-heal. You stay in control if it needs approval."
          : "Alph can explain and guide; this item needs a human decision.",
    },
    confidence: confidenceFor(issue),
    severity: issue.severity,
    href: issue.page,
  };
}

export function listAlphSupportRecommendations(
  issues: SupportIssue[],
): AlphSupportRecommendation[] {
  return issues
    .filter((i) => !["resolved", "closed"].includes(i.status))
    .map(toAlphSupportRecommendation)
    .sort((a, b) => b.confidence - a.confidence);
}
