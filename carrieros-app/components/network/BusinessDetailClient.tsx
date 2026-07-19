import Link from "next/link";
import TrustScoreCard from "@/components/network/TrustScoreCard";
import { NetworkStatusBadge, VerificationBadge } from "@/components/network/NetworkStatusBadge";
import { REPUTATION_DISCLAIMER } from "@/lib/network/types";
import type { getBusinessDetail } from "@/lib/network/board";
import { categoryLabel } from "@/lib/network/board";
import EmptyState from "@/components/ui/EmptyState";

export default function BusinessDetailClient({
  data,
}: {
  data: NonNullable<ReturnType<typeof getBusinessDetail>>;
}) {
  const { member, passport, reviews, recommendations, reputation } = data;

  if (!passport) {
    return (
      <EmptyState
        title="Passport not published"
        description={`${member.displayName} is in the directory but has not published a full Business Passport yet.`}
        actionLabel="Back to businesses"
        actionHref="/network/business"
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[22px] font-bold text-[#111827]">
              {passport.legalName}
            </h2>
            <VerificationBadge level={member.verification} />
          </div>
          {passport.dba ? (
            <p className="mt-1 text-[14px] text-[#6B7280]">DBA {passport.dba}</p>
          ) : null}
          <p className="mt-2 text-[14px] text-[#475569]">{member.headline}</p>
          <p className="mt-2 text-[13px] text-[#6B7280]">
            {categoryLabel(member.category)} · {member.city}, {member.state}
          </p>
        </div>
        <Link href="/network/directory" className="transpo-btn-primary text-[13px]">
          Find partners
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="DOT" value={passport.dotNumber ?? "—"} />
        <Stat label="MC" value={passport.mcNumber ?? "—"} />
        <Stat label="Fleet size" value={String(passport.fleetSize)} />
        <Stat label="Years" value={String(passport.yearsInBusiness)} />
        <Stat label="Safety rating" value={passport.safetyRating ?? "—"} />
        <Stat label="Authority" value={passport.authorityStatus} />
        <Stat label="Partner reviews" value={String(passport.partnerReviewCount)} />
        <Stat label="Trust score" value={String(passport.trustScore)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <TrustScoreCard
          score={passport.trustScore}
          disclaimer={REPUTATION_DISCLAIMER}
          compact
        />
        <div className="rounded-[16px] bg-[#F8F9FB] p-4 sm:p-5 lg:col-span-2 space-y-3">
          <h3 className="text-[15px] font-semibold text-[#111827]">Insurance & coverage</h3>
          <p className="text-[14px] text-[#334155]">{passport.insuranceSummary}</p>
          <div className="flex flex-wrap gap-2">
            {passport.coverageAreas.map((c) => (
              <Chip key={c}>{c}</Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {passport.services.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </div>
        </div>
      </div>

      <Section title="Certifications & licenses">
        <div className="flex flex-wrap gap-2">
          {[...passport.certifications, ...passport.licenses].map((x) => (
            <Chip key={x}>{x}</Chip>
          ))}
        </div>
      </Section>

      <Section title="Locations">
        <ul className="space-y-2">
          {passport.locations.map((loc) => (
            <li key={loc} className="text-[14px] text-[#334155]">
              {loc}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Photos & video (placeholders)">
        <div className="flex flex-wrap gap-2">
          {passport.photoPlaceholders.map((p) => (
            <div
              key={p}
              className="grid h-24 w-36 place-items-center rounded-[12px] bg-[#EEF2FF] text-[12px] font-medium text-[#4338CA]"
            >
              {p}
            </div>
          ))}
          {passport.videoPlaceholders.map((v) => (
            <div
              key={v}
              className="grid h-24 w-36 place-items-center rounded-[12px] bg-[#ECFDF3] text-[12px] font-medium text-[#15803D]"
            >
              ▶ {v}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Company timeline">
        <ol className="space-y-3">
          {passport.timeline.map((t) => (
            <li key={t.id} className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12px] font-medium text-[#6B7280]">
                  {t.date}
                </span>
                {t.verified ? (
                  <NetworkStatusBadge status="confirmed" label="Verified" />
                ) : null}
              </div>
              <p className="mt-1 text-[14px] font-semibold text-[#111827]">
                {t.title}
              </p>
              <p className="mt-1 text-[13px] text-[#6B7280]">{t.detail}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Awards & completed projects">
        <div className="grid gap-3 lg:grid-cols-2">
          {passport.awards.map((a) => (
            <div key={a.id} className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
              <p className="text-[14px] font-semibold text-[#111827]">{a.title}</p>
              <p className="mt-1 text-[13px] text-[#6B7280]">
                {a.year} · {a.issuer}
              </p>
            </div>
          ))}
          {passport.completedProjects.map((p) => (
            <div key={p.id} className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
              <p className="text-[14px] font-semibold text-[#111827]">{p.title}</p>
              <p className="mt-1 text-[13px] text-[#6B7280]">
                {p.year} · {p.summary}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {(reviews.length || recommendations.length || reputation) && (
        <Section title="Partner reputation">
          {reputation ? (
            <p className="mb-3 text-[14px] leading-relaxed text-[#334155]">
              {reputation.alphSummary}
            </p>
          ) : null}
          <div className="space-y-2">
            {reviews.map((r) => (
              <article key={r.id} className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
                <p className="text-[14px] font-semibold text-[#111827]">
                  {r.authorName} · {r.authorRole}
                </p>
                <p className="mt-1 text-[13px] text-[#475569]">{r.body}</p>
                <p className="mt-2 text-[12px] text-[#6B7280]">
                  Overall {r.scores.overall} · verified interaction
                </p>
              </article>
            ))}
            {recommendations.map((r) => (
              <article key={r.id} className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
                <p className="text-[14px] font-semibold text-[#111827]">
                  Recommendation · {r.authorName}
                </p>
                <p className="mt-1 text-[13px] text-[#475569]">{r.body}</p>
              </article>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
      <p className="text-[12px] font-medium text-[#6B7280]">{label}</p>
      <p className="mt-1 text-[14px] font-semibold text-[#111827]">{value}</p>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white px-2.5 py-1 text-[12px] font-medium text-[#334155] shadow-[inset_0_0_0_1px_#E5E7EB]">
      {children}
    </span>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-[15px] font-semibold text-[#111827]">{title}</h3>
      {children}
    </section>
  );
}
