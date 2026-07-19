import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";
import { NetworkStatusBadge } from "@/components/network/NetworkStatusBadge";
import { getMember } from "@/lib/network/store";
import type { NetworkRecommendation } from "@/lib/network/types";
import { memberHref } from "@/lib/network/board";

export default function RecommendationsClient({
  recommendations,
}: {
  recommendations: NetworkRecommendation[];
}) {
  if (!recommendations.length) {
    return (
      <EmptyState
        title="No recommendations yet"
        description="Attributed, verified recommendations appear for drivers, dispatchers, mechanics, recruiters, and service providers."
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[14px] text-[#6B7280]">
        Industry recommendations are attributed and marked verified when the author has
        a real relationship in the network.
      </p>
      <div className="space-y-3">
        {recommendations.map((r) => {
          const subject = getMember(r.subjectMemberId);
          return (
            <article key={r.id} className="rounded-[16px] bg-[#F8F9FB] p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                {subject ? (
                  <Link
                    href={memberHref(subject)}
                    className="text-[15px] font-semibold text-[#111827] hover:text-[#2563EB]"
                  >
                    {subject.displayName}
                  </Link>
                ) : (
                  <span className="text-[15px] font-semibold text-[#111827]">
                    {r.subjectMemberId}
                  </span>
                )}
                {r.verified ? (
                  <NetworkStatusBadge status="confirmed" label="Verified" />
                ) : null}
                {r.attributed ? (
                  <NetworkStatusBadge status="healthy" label="Attributed" />
                ) : null}
              </div>
              <p className="mt-2 text-[14px] leading-relaxed text-[#334155]">
                “{r.body}”
              </p>
              <p className="mt-3 text-[13px] text-[#6B7280]">
                — {r.authorName}, {r.authorRole}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
