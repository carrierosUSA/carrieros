import Link from "next/link";
import { VerificationBadge } from "@/components/network/NetworkStatusBadge";
import { categoryLabel, memberHref, publicHref } from "@/lib/network/board";
import type { NetworkMember } from "@/lib/network/types";

export default function DirectoryCard({ member }: { member: NetworkMember }) {
  return (
    <article className="rounded-[16px] bg-[#F8F9FB] p-4 transition hover:bg-[#F1F5F9] sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-white text-[13px] font-semibold text-[#2563EB] shadow-[inset_0_0_0_1px_#EAEAEA]">
          {member.initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={memberHref(member)}
              className="truncate text-[15px] font-semibold text-[#111827] hover:text-[#2563EB]"
            >
              {member.displayName}
            </Link>
            <VerificationBadge level={member.verification} />
          </div>
          <p className="mt-1 text-[13px] text-[#6B7280]">{member.headline}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[#475569]">
            <span>{categoryLabel(member.category)}</span>
            <span>
              {member.city}, {member.state}
            </span>
            <span className="font-semibold text-[#111827]">
              Trust {member.trustScore}
            </span>
            {member.yearsExperience ? (
              <span>{member.yearsExperience} yrs</span>
            ) : null}
            {member.fleetSize != null ? <span>{member.fleetSize} trucks</span> : null}
          </div>
          {member.specializations.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {member.specializations.slice(0, 4).map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-white px-2.5 py-1 text-[12px] font-medium text-[#334155] shadow-[inset_0_0_0_1px_#E5E7EB]"
                >
                  {s}
                </span>
              ))}
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={memberHref(member)} className="transpo-btn-primary text-[13px]">
              Open passport
            </Link>
            {member.publicProfileConsent ? (
              <Link
                href={publicHref(member)}
                className="rounded-full px-4 py-2 text-[13px] font-medium text-[#2563EB] hover:bg-white"
              >
                Public card
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
