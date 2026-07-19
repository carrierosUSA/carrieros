import Link from "next/link";
import IdentityCard from "@/components/network/IdentityCard";
import TrustScoreCard from "@/components/network/TrustScoreCard";
import DirectoryCard from "@/components/network/DirectoryCard";
import { NetworkStatusBadge } from "@/components/network/NetworkStatusBadge";
import type { NetworkDashboardData } from "@/lib/network/board";
import { seedTrustScore } from "@/lib/network/seed";
import { COMMUNITY_POST_KIND_LABEL } from "@/components/network/labels";

export default function NetworkDashboardClient({
  data,
}: {
  data: NetworkDashboardData;
}) {
  return (
    <div className="space-y-6">
      <IdentityCard
        member={data.owner}
        badges={data.badges.map((b) => b.id)}
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <TrustScoreCard
          score={data.trustScore}
          disclaimer={data.trustDisclaimer}
          factors={seedTrustScore.factors}
          compact
        />
        <Kpi
          label="Connections"
          value={String(data.connectionsAccepted)}
          hint={`${data.connectionsPending} pending`}
          href="/network/connections"
        />
        <Kpi
          label="Experience to confirm"
          value={String(data.pendingExperiences)}
          hint="Verified employment requests"
          href="/network/experience"
        />
        <Kpi
          label="Reputation reviews"
          value={String(data.reputationSummary?.reviewCount ?? 0)}
          hint="From verified interactions only"
          href="/network/reputation"
        />
      </div>

      {data.reputationSummary ? (
        <section className="rounded-[16px] bg-[#F8F9FB] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[15px] font-semibold text-[#111827]">
              Alph reputation summary
            </h3>
            <NetworkStatusBadge status="healthy" label="Decision support" />
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-[#334155]">
            {data.reputationSummary.alphSummary}
          </p>
          <p className="mt-3 text-[12px] text-[#6B7280]">
            {data.reputationSummary.disclaimer}
          </p>
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[15px] font-semibold text-[#111827]">
            Alph networking suggestions
          </h3>
          <Link href="/network/ai" className="text-[13px] font-medium text-[#2563EB]">
            Open AI Networking
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.alphSuggestions.map((s) => (
            <Link
              key={s.id}
              href={s.href}
              className="rounded-full bg-[#EFF6FF] px-4 py-2 text-[13px] font-medium text-[#2563EB] hover:bg-[#DBEAFE]"
            >
              {s.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[15px] font-semibold text-[#111827]">
            Directory highlights
          </h3>
          <Link
            href="/network/directory"
            className="text-[13px] font-medium text-[#2563EB]"
          >
            Browse directory
          </Link>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {data.directoryHighlights.map((m) => (
            <DirectoryCard key={m.id} member={m} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[15px] font-semibold text-[#111827]">
            Community updates
          </h3>
          <Link
            href="/network/community"
            className="text-[13px] font-medium text-[#2563EB]"
          >
            Open community
          </Link>
        </div>
        <div className="space-y-2">
          {data.communityUpdates.map((post) => (
            <article
              key={post.id}
              className="rounded-[12px] bg-[#F8F9FB] px-4 py-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-semibold text-[#111827]">
                  {post.authorName}
                </span>
                <span className="text-[12px] text-[#6B7280]">
                  {COMMUNITY_POST_KIND_LABEL[post.kind]}
                </span>
              </div>
              <p className="mt-1 text-[14px] font-medium text-[#111827]">
                {post.title}
              </p>
              <p className="mt-1 text-[13px] text-[#6B7280]">{post.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string;
  hint: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[16px] bg-[#F8F9FB] p-4 transition hover:bg-[#F1F5F9] sm:p-5"
    >
      <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-[#6B7280]">
        {label}
      </p>
      <p className="mt-2 text-[28px] font-bold text-[#111827]">{value}</p>
      <p className="mt-1 text-[13px] text-[#6B7280]">{hint}</p>
    </Link>
  );
}
