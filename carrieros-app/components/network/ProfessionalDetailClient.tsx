import Link from "next/link";
import TrustScoreCard from "@/components/network/TrustScoreCard";
import { NetworkStatusBadge, VerificationBadge } from "@/components/network/NetworkStatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import type { getProfessionalDetail } from "@/lib/network/board";
import { REPUTATION_DISCLAIMER } from "@/lib/network/types";

export default function ProfessionalDetailClient({
  data,
}: {
  data: NonNullable<ReturnType<typeof getProfessionalDetail>>;
}) {
  const { member, passport, experiences, reviews, recommendations, reputation, isOwner } =
    data;

  if (!passport) {
    return (
      <EmptyState
        title="Passport not published"
        description={`${member.displayName} has a directory profile but no Career Passport yet.`}
        actionLabel="Back to professionals"
        actionHref="/network/professionals"
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-[14px] bg-[#EFF6FF] text-[16px] font-semibold text-[#2563EB]">
            {member.initials}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[22px] font-bold text-[#111827]">
                {passport.fullName}
              </h2>
              <VerificationBadge level={member.verification} />
            </div>
            <p className="mt-1 text-[14px] text-[#475569]">{passport.headline}</p>
            <p className="mt-2 text-[13px] text-[#6B7280]">
              Transpo ID {member.transpoId} · {member.city}, {member.state}
            </p>
            {passport.walletPassportLinked ? (
              <p className="mt-2 text-[13px] font-medium text-[#2563EB]">
                Linked to Professional Wallet Career Passport
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isOwner ? (
            <>
              <Link href="/network/identity" className="transpo-btn-primary text-[13px]">
                My Identity
              </Link>
              <Link
                href="/wallet/passport"
                className="rounded-full px-4 py-2 text-[13px] font-medium text-[#2563EB] hover:bg-[#F8F9FB]"
              >
                Wallet Passport
              </Link>
            </>
          ) : null}
          <Link
            href="/workforce"
            className="rounded-full px-4 py-2 text-[13px] font-medium text-[#2563EB] hover:bg-[#F8F9FB]"
          >
            Workforce hiring
          </Link>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <TrustScoreCard
          score={passport.trustScore}
          disclaimer={REPUTATION_DISCLAIMER}
          compact
        />
        <div className="rounded-[16px] bg-[#F8F9FB] p-4 sm:p-5 lg:col-span-2">
          <h3 className="text-[15px] font-semibold text-[#111827]">Skills & equipment</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {[...passport.skills, ...passport.equipment, ...passport.trailerTypes].map(
              (s) => (
                <span
                  key={s}
                  className="rounded-full bg-white px-2.5 py-1 text-[12px] font-medium text-[#334155] shadow-[inset_0_0_0_1px_#E5E7EB]"
                >
                  {s}
                </span>
              ),
            )}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[12px] font-medium text-[#6B7280]">Languages</p>
              <p className="mt-1 text-[14px] text-[#111827]">
                {passport.languages.join(", ")}
              </p>
            </div>
            <div>
              <p className="text-[12px] font-medium text-[#6B7280]">Experience</p>
              <p className="mt-1 text-[14px] font-semibold text-[#111827]">
                {passport.yearsExperience} years
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <h3 className="text-[15px] font-semibold text-[#111827]">Employment</h3>
        <div className="space-y-2">
          {passport.employment.map((job) => (
            <div key={job.id} className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[14px] font-semibold text-[#111827]">
                  {job.role} · {job.company}
                </p>
                {job.verified ? (
                  <NetworkStatusBadge status="confirmed" label="Verified" />
                ) : null}
              </div>
              <p className="mt-1 text-[13px] text-[#6B7280]">
                {job.startDate}
                {job.endDate ? ` – ${job.endDate}` : job.current ? " – Present" : ""}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-[15px] font-semibold text-[#111827]">Timeline & milestones</h3>
        <ol className="space-y-2">
          {passport.timeline.map((t) => (
            <li key={t.id} className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
              <p className="text-[12px] font-medium text-[#6B7280]">{t.date}</p>
              <p className="mt-1 text-[14px] font-semibold text-[#111827]">{t.title}</p>
              <p className="mt-1 text-[13px] text-[#6B7280]">{t.detail}</p>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-2">
          {passport.milestones.map((m) => (
            <span
              key={m}
              className="rounded-full bg-[#ECFDF3] px-2.5 py-1 text-[12px] font-medium text-[#16A34A]"
            >
              {m}
            </span>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <h3 className="text-[15px] font-semibold text-[#111827]">
            Education & training
          </h3>
          <ul className="space-y-1 text-[14px] text-[#334155]">
            {[...passport.education, ...passport.training, ...passport.certifications].map(
              (x) => (
                <li key={x}>{x}</li>
              ),
            )}
          </ul>
        </div>
        <div className="space-y-2">
          <h3 className="text-[15px] font-semibold text-[#111827]">Awards</h3>
          {passport.awards.map((a) => (
            <div key={a.id} className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
              <p className="text-[14px] font-semibold text-[#111827]">{a.title}</p>
              <p className="text-[13px] text-[#6B7280]">
                {a.year} · {a.issuer}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-[15px] font-semibold text-[#111827]">
          Verified experience & recommendations
        </h3>
        {experiences.map((e) => (
          <div key={e.id} className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[14px] font-semibold text-[#111827]">
                {e.position} @ {e.companyName}
              </p>
              <NetworkStatusBadge status={e.status} />
            </div>
            <p className="mt-1 text-[13px] text-[#6B7280]">
              Verified by {e.verifierName}
              {e.miles ? ` · ${e.miles.toLocaleString()} miles` : ""}
            </p>
          </div>
        ))}
        {recommendations.map((r) => (
          <div key={r.id} className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
            <p className="text-[14px] font-semibold text-[#111827]">
              {r.authorName} · {r.authorRole}
            </p>
            <p className="mt-1 text-[13px] text-[#475569]">{r.body}</p>
          </div>
        ))}
        {reviews.map((r) => (
          <div key={r.id} className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
            <p className="text-[14px] font-semibold text-[#111827]">
              Review · {r.authorName}
            </p>
            <p className="mt-1 text-[13px] text-[#475569]">{r.body}</p>
            <p className="mt-2 text-[12px] text-[#6B7280]">
              Overall {r.scores.overall} · verified interaction only
            </p>
          </div>
        ))}
        {reputation ? (
          <p className="text-[13px] leading-relaxed text-[#6B7280]">
            {reputation.alphSummary}
          </p>
        ) : null}
      </section>
    </div>
  );
}
