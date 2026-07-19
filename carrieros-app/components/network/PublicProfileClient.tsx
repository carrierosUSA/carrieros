import Link from "next/link";
import IdentityCard from "@/components/network/IdentityCard";
import TrustScoreCard from "@/components/network/TrustScoreCard";
import EmptyState from "@/components/ui/EmptyState";
import { memberHref } from "@/lib/network/board";
import { REPUTATION_DISCLAIMER, type NetworkMember } from "@/lib/network/types";
import type { ProfessionalPassport, BusinessPassport } from "@/lib/network/types";
import type { ReputationSummary } from "@/lib/network/types";

export default function PublicProfileClient({
  member,
  professional,
  business,
  reputation,
}: {
  member: NetworkMember | null;
  professional?: ProfessionalPassport;
  business?: BusinessPassport;
  reputation?: ReputationSummary;
}) {
  if (!member) {
    return (
      <EmptyState
        title="Profile not found"
        description="This Transpo ID is not in the Verified Network directory."
        actionLabel="Browse directory"
        actionHref="/network/directory"
      />
    );
  }

  if (!member.publicProfileConsent) {
    return (
      <EmptyState
        title="Profile is private"
        description="This member has not consented to a public profile card."
        actionLabel="Browse directory"
        actionHref="/network/directory"
      />
    );
  }

  return (
    <div className="space-y-5">
      <IdentityCard member={member} showLinks={false} />
      <div className="grid gap-4 lg:grid-cols-3">
        <TrustScoreCard
          score={member.trustScore}
          disclaimer={REPUTATION_DISCLAIMER}
          compact
        />
        <div className="rounded-[16px] bg-[#F8F9FB] p-4 sm:p-5 lg:col-span-2 space-y-3">
          <h3 className="text-[15px] font-semibold text-[#111827]">
            Public verified card
          </h3>
          <p className="text-[14px] text-[#475569]">
            Consent-based public identity for {member.displayName}. Full documents stay
            in Professional Wallet and are never shown here without explicit share
            approval.
          </p>
          {professional ? (
            <ul className="space-y-1 text-[14px] text-[#334155]">
              <li>{professional.yearsExperience} years experience</li>
              <li>Skills: {professional.skills.slice(0, 5).join(", ")}</li>
              <li>Languages: {professional.languages.join(", ")}</li>
            </ul>
          ) : null}
          {business ? (
            <ul className="space-y-1 text-[14px] text-[#334155]">
              {business.dotNumber ? <li>{business.dotNumber}</li> : null}
              {business.mcNumber ? <li>{business.mcNumber}</li> : null}
              <li>Fleet: {business.fleetSize}</li>
              <li>Authority: {business.authorityStatus}</li>
            </ul>
          ) : null}
          {reputation ? (
            <p className="text-[13px] leading-relaxed text-[#6B7280]">
              {reputation.alphSummary}
            </p>
          ) : null}
          <Link href={memberHref(member)} className="transpo-btn-primary inline-flex text-[13px]">
            Open full passport
          </Link>
        </div>
      </div>
    </div>
  );
}
