import Link from "next/link";
import { listMembers, listConnections, listCommunityPosts, listReviews } from "@/lib/network/store";
import { NETWORK_CATEGORY_LABELS } from "@/lib/network/types";

export default function InsightsClient() {
  const members = listMembers();
  const connections = listConnections();
  const posts = listCommunityPosts();
  const reviews = listReviews();

  const byCategory = members.reduce<Record<string, number>>((acc, m) => {
    acc[m.category] = (acc[m.category] ?? 0) + 1;
    return acc;
  }, {});

  const topCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const avgTrust = Math.round(
    members.reduce((s, m) => s + m.trustScore, 0) / Math.max(members.length, 1),
  );

  const verifiedPct = Math.round(
    (members.filter((m) => m.verification === "verified" || m.verification === "premium")
      .length /
      Math.max(members.length, 1)) *
      100,
  );

  return (
    <div className="space-y-6">
      <p className="text-[14px] text-[#6B7280]">
        Network insights from seed directory activity — who is verified, where trust is
        strong, and how the community is engaging.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Members" value={String(members.length)} />
        <Stat label="Avg trust score" value={String(avgTrust)} />
        <Stat label="Verified+" value={`${verifiedPct}%`} />
        <Stat
          label="Accepted connections"
          value={String(connections.filter((c) => c.status === "accepted").length)}
        />
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[16px] bg-[#F8F9FB] p-4 sm:p-5">
          <h3 className="text-[15px] font-semibold text-[#111827]">
            Category coverage
          </h3>
          <ul className="mt-3 space-y-2">
            {topCategories.map(([cat, count]) => (
              <li
                key={cat}
                className="flex items-center justify-between text-[14px]"
              >
                <span className="text-[#334155]">
                  {NETWORK_CATEGORY_LABELS[cat as keyof typeof NETWORK_CATEGORY_LABELS] ??
                    cat}
                </span>
                <span className="font-semibold text-[#111827]">{count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[16px] bg-[#F8F9FB] p-4 sm:p-5">
          <h3 className="text-[15px] font-semibold text-[#111827]">Engagement</h3>
          <ul className="mt-3 space-y-2 text-[14px] text-[#334155]">
            <li className="flex justify-between">
              <span>Community posts</span>
              <span className="font-semibold text-[#111827]">{posts.length}</span>
            </li>
            <li className="flex justify-between">
              <span>Verified reviews</span>
              <span className="font-semibold text-[#111827]">{reviews.length}</span>
            </li>
            <li className="flex justify-between">
              <span>Pending connections</span>
              <span className="font-semibold text-[#111827]">
                {connections.filter((c) => c.status === "pending").length}
              </span>
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/network/ai" className="transpo-btn-primary text-[13px]">
              Ask Alph
            </Link>
            <Link
              href="/network/directory"
              className="rounded-full px-4 py-2 text-[13px] font-medium text-[#2563EB]"
            >
              Open directory
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] bg-[#F8F9FB] p-4 sm:p-5">
      <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-[#6B7280]">
        {label}
      </p>
      <p className="mt-2 text-[28px] font-bold text-[#111827]">{value}</p>
    </div>
  );
}
