import {
  CONFIDENCE_DESCRIPTIONS,
  CONFIDENCE_LABELS,
  confidenceBadgeClasses,
  scoreToConfidenceLevel,
  type ConfidenceLevel,
} from "@/lib/ai-safety";

type AiConfidenceBadgeProps = {
  level?: ConfidenceLevel;
  /** 0–1 score — used when level is omitted. */
  score?: number;
  showDescription?: boolean;
  className?: string;
};

export default function AiConfidenceBadge({
  level,
  score,
  showDescription = false,
  className = "",
}: AiConfidenceBadgeProps) {
  const resolved =
    level ??
    (typeof score === "number"
      ? scoreToConfidenceLevel(score)
      : "needs_human_verification");
  const tone = confidenceBadgeClasses(resolved);

  return (
    <span className={`inline-flex flex-col items-start gap-1 ${className}`}>
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${tone.bg} ${tone.text}`}
        title={CONFIDENCE_DESCRIPTIONS[resolved]}
      >
        {CONFIDENCE_LABELS[resolved]}
      </span>
      {showDescription ? (
        <span className="text-[13px] leading-snug text-[#64748B]">
          {CONFIDENCE_DESCRIPTIONS[resolved]}
        </span>
      ) : null}
    </span>
  );
}
