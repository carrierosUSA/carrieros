import Link from "next/link";
import IdentityCard from "@/components/network/IdentityCard";
import TrustScoreCard from "@/components/network/TrustScoreCard";
import { VerificationBadge } from "@/components/network/NetworkStatusBadge";
import type { NetworkMember } from "@/lib/network/types";
import type { CareerPassport, WalletBadge, WalletTrustScore } from "@/lib/wallet/types";
import { WALLET_BADGE_LABELS } from "@/lib/wallet/types";
import { networkProfilePath } from "@/lib/network/qr";

export default function IdentityClient({
  member,
  passport,
  badges,
  trust,
}: {
  member: NetworkMember;
  passport: CareerPassport;
  badges: WalletBadge[];
  trust: WalletTrustScore;
}) {
  return (
    <div className="space-y-6">
      <IdentityCard member={member} badges={badges.map((b) => b.id)} />

      <div className="grid gap-4 lg:grid-cols-3">
        <TrustScoreCard
          score={trust.score}
          disclaimer={trust.disclaimer}
          factors={trust.factors}
        />
        <div className="rounded-[16px] bg-[#F8F9FB] p-4 sm:p-5 lg:col-span-2">
          <h3 className="text-[15px] font-semibold text-[#111827]">
            Lifetime identity
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-[#475569]">
            Your Transpo ID is permanent across roles and employers. Career Passport
            and Professional Wallet share the same verified foundation — consent
            controls what others can see.
          </p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <Item label="Preferred name" value={passport.identity.preferredName ?? "—"} />
            <Item label="Email" value={passport.identity.email} />
            <Item label="Phone" value={passport.identity.phone} />
            <Item
              label="Public profile"
              value={member.publicProfileConsent ? "Consent granted" : "Private"}
            />
            <Item
              label="Public URL"
              value={networkProfilePath(member.transpoId)}
            />
            <Item
              label="Wallet link"
              value={member.walletLinked ? "Career Passport synced" : "Not linked"}
            />
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/wallet/passport" className="transpo-btn-primary text-[13px]">
              Open Career Passport
            </Link>
            <Link
              href="/wallet"
              className="rounded-full px-4 py-2 text-[13px] font-medium text-[#2563EB] hover:bg-white"
            >
              Professional Wallet
            </Link>
            <Link
              href={`/network/p/${encodeURIComponent(member.transpoId)}`}
              className="rounded-full px-4 py-2 text-[13px] font-medium text-[#2563EB] hover:bg-white"
            >
              View public card
            </Link>
            <Link
              href="/workforce"
              className="rounded-full px-4 py-2 text-[13px] font-medium text-[#2563EB] hover:bg-white"
            >
              Hire via Workforce
            </Link>
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <h3 className="text-[15px] font-semibold text-[#111827]">Badges</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((b) => (
            <div key={b.id} className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[14px] font-semibold text-[#111827]">
                  {WALLET_BADGE_LABELS[b.id]}
                </p>
                {b.verified ? (
                  <VerificationBadge level="verified" />
                ) : null}
              </div>
              <p className="mt-1 text-[13px] text-[#6B7280]">{b.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[12px] font-medium text-[#6B7280]">{label}</dt>
      <dd className="mt-1 text-[14px] text-[#111827]">{value}</dd>
    </div>
  );
}
