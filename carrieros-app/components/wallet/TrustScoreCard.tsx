import Link from "next/link";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import type { WalletTrustScore } from "@/lib/wallet/types";

export default function TrustScoreCard({
  trust,
  compact,
}: {
  trust: WalletTrustScore;
  compact?: boolean;
}) {
  return (
    <section className="rounded-[16px] bg-[#F8F9FB] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-[#6B7280]">Trust Score</p>
          <p className={`mt-1 text-[36px] font-bold tracking-tight ${TRANSPO_COLORS.info.text}`}>
            {trust.score}
          </p>
          <p className="mt-1 text-[13px] text-[#6B7280]">out of 100 · decision support</p>
        </div>
        {!compact ? (
          <Link href="/wallet/trust" className="text-[13px] font-medium text-[#2563EB]">
            View factors
          </Link>
        ) : null}
      </div>
      <p className={`mt-4 text-[13px] leading-relaxed ${TRANSPO_COLORS.warning.text}`}>
        {trust.disclaimer}
      </p>
    </section>
  );
}
