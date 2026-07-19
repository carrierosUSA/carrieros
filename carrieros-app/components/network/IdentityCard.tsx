import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import { buildTranspoQrDataUrl } from "@/lib/network/qr";
import type { NetworkMember } from "@/lib/network/types";
import { NETWORK_CATEGORY_LABELS, NETWORK_IDENTITY_DISCLAIMER } from "@/lib/network/types";
import { WALLET_BADGE_LABELS } from "@/lib/wallet/types";
import type { WalletBadgeId } from "@/lib/wallet/types";
import { VerificationBadge } from "@/components/network/NetworkStatusBadge";

export default function IdentityCard({
  member,
  badges,
  showQr = true,
  showLinks = true,
}: {
  member: NetworkMember;
  badges?: WalletBadgeId[];
  showQr?: boolean;
  showLinks?: boolean;
}) {
  const qr = buildTranspoQrDataUrl(member.transpoId, 140);
  const badgeIds = badges ?? member.badges;

  return (
    <div className="overflow-hidden rounded-[16px] bg-gradient-to-br from-[#0B1F3A] via-[#12355C] to-[#1E4D8C] p-5 text-white sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#93C5FD]">
            Universal Verified ID
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="grid h-14 w-14 place-items-center rounded-[14px] bg-white/10 text-[18px] font-semibold">
              {member.initials}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-[22px] font-bold tracking-[-0.02em]">
                {member.displayName}
              </h2>
              <p className="mt-1 text-[14px] text-[#BFDBFE]">{member.headline}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <VerificationBadge level={member.verification} />
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium ${TRANSPO_COLORS.success.bg} ${TRANSPO_COLORS.success.text}`}
            >
              <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              Verified Badge
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[12px] font-medium text-[#E0F2FE]">
              {NETWORK_CATEGORY_LABELS[member.category]}
            </span>
          </div>

          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-[12px] font-medium text-[#93C5FD]">Transpo ID</dt>
              <dd className="mt-1 text-[15px] font-semibold tracking-wide">
                {member.transpoId}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] font-medium text-[#93C5FD]">Location</dt>
              <dd className="mt-1 text-[15px]">
                {member.city}, {member.state}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] font-medium text-[#93C5FD]">Trust Score</dt>
              <dd className="mt-1 text-[20px] font-bold">{member.trustScore}</dd>
            </div>
            <div>
              <dt className="text-[12px] font-medium text-[#93C5FD]">Member since</dt>
              <dd className="mt-1 text-[15px]">
                {new Date(member.createdAt).getFullYear()}
              </dd>
            </div>
          </dl>

          {badgeIds.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {badgeIds.slice(0, 6).map((id) => (
                <span
                  key={id}
                  className="rounded-full bg-white/10 px-2.5 py-1 text-[12px] font-medium text-[#E0F2FE]"
                >
                  {WALLET_BADGE_LABELS[id] ?? id}
                </span>
              ))}
            </div>
          ) : null}

          {showLinks ? (
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/wallet/passport"
                className="rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[#0B1F3A]"
              >
                Career Passport
              </Link>
              <Link
                href="/wallet"
                className="rounded-full bg-white/10 px-4 py-2 text-[13px] font-semibold text-white ring-1 ring-white/20"
              >
                Professional Wallet
              </Link>
              <Link
                href="/network/business"
                className="rounded-full bg-white/10 px-4 py-2 text-[13px] font-semibold text-white ring-1 ring-white/20"
              >
                Business Passport
              </Link>
              <Link
                href="/workforce"
                className="rounded-full bg-white/10 px-4 py-2 text-[13px] font-semibold text-white ring-1 ring-white/20"
              >
                Workforce
              </Link>
            </div>
          ) : null}
        </div>

        {showQr ? (
          <div className="shrink-0 rounded-[16px] bg-white p-3 text-center text-[#0F172A]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qr}
              alt={`QR code for ${member.transpoId}`}
              width={140}
              height={140}
              className="mx-auto"
            />
            <p className="mt-2 text-[11px] font-medium text-[#64748B]">Scan Transpo ID</p>
          </div>
        ) : null}
      </div>
      <p className="mt-5 max-w-3xl text-[12px] leading-relaxed text-[#93C5FD]">
        {NETWORK_IDENTITY_DISCLAIMER}
      </p>
    </div>
  );
}
