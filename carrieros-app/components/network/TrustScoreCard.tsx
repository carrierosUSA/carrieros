import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import type { TrustScoreFactor } from "@/lib/wallet/types";

export default function TrustScoreCard({
  score,
  disclaimer,
  factors,
  compact,
}: {
  score: number;
  disclaimer: string;
  factors?: TrustScoreFactor[];
  compact?: boolean;
}) {
  const tone =
    score >= 90
      ? TRANSPO_COLORS.success
      : score >= 75
        ? TRANSPO_COLORS.info
        : score >= 60
          ? TRANSPO_COLORS.warning
          : TRANSPO_COLORS.critical;

  return (
    <div className="rounded-[16px] bg-[#F8F9FB] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-[#6B7280]">
            Trust Score
          </p>
          <p className={`mt-2 text-[36px] font-bold leading-none ${tone.text}`}>
            {score}
          </p>
          <p className="mt-2 text-[13px] text-[#6B7280]">Decision support only</p>
        </div>
        <span
          className={`grid h-12 w-12 place-items-center rounded-[12px] text-[14px] font-semibold ${tone.bg} ${tone.text}`}
        >
          TVN
        </span>
      </div>
      {!compact && factors?.length ? (
        <ul className="mt-4 space-y-2">
          {factors.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between gap-3 text-[13px]"
            >
              <span className="text-[#334155]">{f.label}</span>
              <span className="font-semibold text-[#111827]">{f.score}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-4 text-[12px] leading-relaxed text-[#6B7280]">{disclaimer}</p>
    </div>
  );
}
