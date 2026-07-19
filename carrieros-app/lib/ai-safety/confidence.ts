import { TRANSPO_COLORS } from "@/lib/design-system/colors";

export type ConfidenceLevel =
  | "high"
  | "review_recommended"
  | "needs_human_verification";

export const CONFIDENCE_LEVELS: ConfidenceLevel[] = [
  "high",
  "review_recommended",
  "needs_human_verification",
];

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  high: "High",
  review_recommended: "Review Recommended",
  needs_human_verification: "Needs Human Verification",
};

export const CONFIDENCE_DESCRIPTIONS: Record<ConfidenceLevel, string> = {
  high: "Strong match from clear data — still confirm critical actions.",
  review_recommended: "Useful suggestion — review before you act.",
  needs_human_verification:
    "Uncertain or incomplete data — verify before trusting this result.",
};

/** Map a 0–1 score (e.g. Alph parser confidence) to a policy level. */
export function scoreToConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 0.85) return "high";
  if (score >= 0.6) return "review_recommended";
  return "needs_human_verification";
}

export function confidenceBadgeClasses(level: ConfidenceLevel): {
  bg: string;
  text: string;
} {
  switch (level) {
    case "high":
      return {
        bg: TRANSPO_COLORS.success.bg,
        text: TRANSPO_COLORS.success.text,
      };
    case "review_recommended":
      return {
        bg: TRANSPO_COLORS.warning.bg,
        text: TRANSPO_COLORS.warning.text,
      };
    case "needs_human_verification":
      return {
        bg: TRANSPO_COLORS.critical.bg,
        text: TRANSPO_COLORS.critical.text,
      };
  }
}
