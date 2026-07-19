import Link from "next/link";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import type { ExchangeSeller } from "@/lib/exchange/types";
import { VERIFICATION_LEVEL_LABELS } from "@/lib/network/types";

export default function VerifiedBadge({
  seller,
  compact,
}: {
  seller: Pick<
    ExchangeSeller,
    "verified" | "verificationLevel" | "trustScore" | "networkMemberId"
  >;
  compact?: boolean;
}) {
  if (!seller.verified) {
    return (
      <Link
        href="/wallet/trust"
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium ${TRANSPO_COLORS.disabled.bg} ${TRANSPO_COLORS.disabled.text}`}
        title="Verify identity in Trust / Wallet"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#94A3B8]" aria-hidden />
        {compact ? "Unverified" : "Verify in Trust"}
      </Link>
    );
  }

  return (
    <Link
      href={seller.networkMemberId ? "/network" : "/wallet/trust"}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium ${TRANSPO_COLORS.success.bg} ${TRANSPO_COLORS.success.text}`}
      title="Transpo Verified — Network / Trust"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" aria-hidden />
      {VERIFICATION_LEVEL_LABELS[seller.verificationLevel]}
      {!compact && seller.trustScore != null ? (
        <span className="text-[11px] opacity-80">Trust {seller.trustScore}</span>
      ) : null}
    </Link>
  );
}
