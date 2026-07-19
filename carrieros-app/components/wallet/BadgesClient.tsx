import WalletBadgeChip from "@/components/wallet/WalletBadgeChip";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import type { WalletBadge, WalletBadgeId } from "@/lib/wallet/types";
import { WALLET_BADGE_LABELS } from "@/lib/wallet/types";

const CATALOG: WalletBadgeId[] = [
  "verified_driver",
  "owner_operator",
  "dispatcher",
  "broker",
  "shipper",
  "recruiter",
  "mechanic",
  "technician",
  "fleet_manager",
  "safety_manager",
  "company",
  "partner",
  "top_rated",
  "safe_driver_5yr",
  "safe_driver_10yr",
  "million_mile",
  "elite_carrier",
  "premium_partner",
];

export default function BadgesClient({ badges }: { badges: WalletBadge[] }) {
  const earned = new Set(badges.map((b) => b.id));

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-[15px] font-semibold text-[#111827]">Earned badges</h2>
        <div className="flex flex-wrap gap-2">
          {badges.map((b) => (
            <WalletBadgeChip key={b.id} badge={b} />
          ))}
        </div>
        <div className="space-y-2">
          {badges.map((b) => (
            <div key={b.id} className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
              <p className="text-[14px] font-semibold text-[#111827]">
                {WALLET_BADGE_LABELS[b.id]}
              </p>
              <p className="mt-1 text-[14px] text-[#6B7280]">{b.description}</p>
              <p className="mt-1 text-[12px] text-[#94A3B8]">
                Earned {new Date(b.earnedAt).toLocaleDateString()}
                {b.verified ? " · Verified" : ""}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[15px] font-semibold text-[#111827]">Badge catalog</h2>
        <p className="text-[14px] text-[#6B7280]">
          Professional identity badges across drivers, operations, and partners.
        </p>
        <div className="flex flex-wrap gap-2">
          {CATALOG.map((id) => {
            const has = earned.has(id);
            return (
              <span
                key={id}
                className={`rounded-full px-3 py-1.5 text-[12px] font-medium ${
                  has
                    ? `${TRANSPO_COLORS.success.bg} ${TRANSPO_COLORS.success.text}`
                    : `${TRANSPO_COLORS.disabled.bg} ${TRANSPO_COLORS.disabled.text}`
                }`}
              >
                {WALLET_BADGE_LABELS[id]}
              </span>
            );
          })}
        </div>
      </section>
    </div>
  );
}
