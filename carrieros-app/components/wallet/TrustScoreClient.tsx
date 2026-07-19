import AiPolicyNotice from "@/components/ai-safety/AiPolicyNotice";
import TrustScoreCard from "@/components/wallet/TrustScoreCard";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import type { WalletTrustScore } from "@/lib/wallet/types";

export default function TrustScoreClient({ trust }: { trust: WalletTrustScore }) {
  return (
    <div className="space-y-5">
      <AiPolicyNotice variant="panel" />
      <TrustScoreCard trust={trust} />

      <section className="space-y-3">
        <h2 className="text-[15px] font-semibold text-[#111827]">Score factors</h2>
        <div className="space-y-2">
          {trust.factors.map((factor) => (
            <div key={factor.id} className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14px] font-semibold text-[#111827]">{factor.label}</p>
                <p className={`text-[18px] font-bold ${TRANSPO_COLORS.info.text}`}>
                  {factor.score}
                </p>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-[#2563EB]"
                  style={{ width: `${factor.score}%` }}
                />
              </div>
              <p className="mt-2 text-[13px] text-[#6B7280]">
                {factor.hint} · weight {Math.round(factor.weight * 100)}%
              </p>
            </div>
          ))}
        </div>
      </section>

      <p
        className={`rounded-[12px] px-4 py-3 text-[14px] leading-relaxed ${TRANSPO_COLORS.warning.bg} ${TRANSPO_COLORS.warning.text}`}
      >
        {trust.disclaimer} No Trust module existed in this codebase — this score lives in
        the wallet store and can be shared with a future Trust center.
      </p>
    </div>
  );
}
