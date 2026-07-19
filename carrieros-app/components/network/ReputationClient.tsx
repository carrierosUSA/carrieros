import TrustScoreCard from "@/components/network/TrustScoreCard";
import EmptyState from "@/components/ui/EmptyState";
import {
  REPUTATION_DIMENSION_LABELS,
  REPUTATION_DISCLAIMER,
  type ReputationReview,
  type ReputationSummary,
} from "@/lib/network/types";
import { getMember } from "@/lib/network/store";
import { seedTrustScore } from "@/lib/network/seed";

export default function ReputationClient({
  summaries,
  reviews,
}: {
  summaries: ReputationSummary[];
  reviews: ReputationReview[];
}) {
  if (!reviews.length) {
    return (
      <EmptyState
        title="No verified reviews yet"
        description="Reputation reviews only appear after a verified interaction or accepted connection — never from anonymous strangers."
      />
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-[14px] leading-relaxed text-[#6B7280]">
        Multi-dimension reputation for decision support. Fake-review prevention requires
        a verified interaction flag in the store. {REPUTATION_DISCLAIMER}
      </p>

      <div className="grid gap-4 lg:grid-cols-3">
        <TrustScoreCard
          score={seedTrustScore.score}
          disclaimer={seedTrustScore.disclaimer}
          factors={seedTrustScore.factors}
          compact
        />
        {summaries.map((s) => {
          const member = getMember(s.memberId);
          return (
            <div key={s.memberId} className="rounded-[16px] bg-[#F8F9FB] p-4 sm:p-5">
              <h3 className="text-[15px] font-semibold text-[#111827]">
                {member?.displayName ?? s.memberId}
              </h3>
              <p className="mt-1 text-[13px] text-[#6B7280]">
                {s.reviewCount} verified review{s.reviewCount === 1 ? "" : "s"}
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-[#334155]">
                {s.alphSummary}
              </p>
            </div>
          );
        })}
      </div>

      <section className="space-y-3">
        <h3 className="text-[15px] font-semibold text-[#111827]">
          Dimension scores & reviews
        </h3>
        {reviews.map((r) => {
          const subject = getMember(r.subjectMemberId);
          return (
            <article key={r.id} className="rounded-[16px] bg-[#F8F9FB] p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[15px] font-semibold text-[#111827]">
                    {subject?.displayName ?? r.subjectMemberId}
                  </p>
                  <p className="text-[13px] text-[#6B7280]">
                    By {r.authorName} · {r.authorRole} · interaction{" "}
                    {r.verifiedInteractionId}
                  </p>
                </div>
                <p className="text-[24px] font-bold text-[#2563EB]">
                  {r.scores.overall}
                </p>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {(
                  Object.keys(REPUTATION_DIMENSION_LABELS) as Array<
                    keyof typeof REPUTATION_DIMENSION_LABELS
                  >
                ).map((dim) => (
                  <div key={dim} className="rounded-[10px] bg-white px-3 py-2">
                    <p className="text-[11px] font-medium text-[#6B7280]">
                      {REPUTATION_DIMENSION_LABELS[dim]}
                    </p>
                    <p className="mt-0.5 text-[15px] font-semibold text-[#111827]">
                      {r.scores[dim]}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[14px] text-[#334155]">{r.body}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
