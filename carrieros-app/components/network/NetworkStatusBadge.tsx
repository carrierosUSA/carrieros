import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import { statusTone, verificationTone } from "@/lib/network/board";
import type { VerificationLevel } from "@/lib/network/types";
import { VERIFICATION_LEVEL_LABELS } from "@/lib/network/types";

export function NetworkStatusBadge({
  status,
  label,
}: {
  status: string;
  label?: string;
}) {
  const tone = statusTone(status);
  const colors = TRANSPO_COLORS[tone] ?? TRANSPO_COLORS.disabled;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium ${colors.bg} ${colors.text}`}
    >
      {label ?? status.replace(/_/g, " ")}
    </span>
  );
}

export function VerificationBadge({ level }: { level: VerificationLevel }) {
  const tone = verificationTone(level);
  const colors = TRANSPO_COLORS[tone];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium ${colors.bg} ${colors.text}`}
    >
      {VERIFICATION_LEVEL_LABELS[level]}
    </span>
  );
}
