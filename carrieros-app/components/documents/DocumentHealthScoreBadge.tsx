import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import type { DocumentHealthScore } from "@/lib/documents/types";

type DocumentHealthScoreBadgeProps = {
  score: DocumentHealthScore;
  size?: "sm" | "md";
  showPercent?: boolean;
};

const levelDot: Record<DocumentHealthScore["level"], string> = {
  complete: "bg-[#16A34A]",
  warning: "bg-[#EA580C]",
  critical: "bg-[#DC2626]",
};

function levelColors(level: DocumentHealthScore["level"]) {
  switch (level) {
    case "complete":
      return CARRIEROS_COLORS.success;
    case "warning":
      return CARRIEROS_COLORS.warning;
    case "critical":
      return CARRIEROS_COLORS.critical;
  }
}

export default function DocumentHealthScoreBadge({
  score,
  size = "md",
  showPercent = true,
}: DocumentHealthScoreBadgeProps) {
  const colors = levelColors(score.level);
  const padding = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-[12px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${colors.bg} ${colors.text} ${padding}`}
      title={`Document health: ${score.label} (${score.percent}%)`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${levelDot[score.level]}`}
        aria-hidden
      />
      <span>{score.label}</span>
      {showPercent ? (
        <span className="font-bold tabular-nums">{score.percent}%</span>
      ) : null}
    </span>
  );
}
