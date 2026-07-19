import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import type { WalletBadge } from "@/lib/wallet/types";
import { WALLET_BADGE_LABELS } from "@/lib/wallet/types";

export default function WalletBadgeChip({
  badge,
  compact,
}: {
  badge: WalletBadge;
  compact?: boolean;
}) {
  return (
    <span
      title={badge.description}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium ${TRANSPO_COLORS.success.bg} ${TRANSPO_COLORS.success.text}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${badge.verified ? "bg-[#16A34A]" : "bg-[#94A3B8]"}`}
        aria-hidden
      />
      {WALLET_BADGE_LABELS[badge.id]}
      {!compact && badge.verified ? (
        <span className="text-[11px] opacity-80">Verified</span>
      ) : null}
    </span>
  );
}
