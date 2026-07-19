"use client";

import Link from "next/link";
import {
  Bell,
  Building2,
  FileWarning,
  Share2,
  Sparkles,
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import TrustScoreCard from "@/components/wallet/TrustScoreCard";
import WalletBadgeChip from "@/components/wallet/WalletBadgeChip";
import WalletStatusBadge from "@/components/wallet/WalletStatusBadge";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import type { getWalletDashboard } from "@/lib/wallet/store";

type Dashboard = ReturnType<typeof getWalletDashboard>;

function Stat({
  label,
  value,
  hint,
  tone,
  href,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: keyof typeof TRANSPO_COLORS;
  href: string;
}) {
  const colors = tone ? TRANSPO_COLORS[tone] : null;
  return (
    <Link
      href={href}
      className={`block rounded-[12px] px-4 py-3 transition hover:bg-[#EFF6FF] ${colors?.bg ?? "bg-[#F8F9FB]"}`}
    >
      <p className="text-[13px] font-medium text-[#6B7280]">{label}</p>
      <p className={`mt-1 text-[28px] font-bold ${colors?.text ?? "text-[#111827]"}`}>
        {value}
      </p>
      <p className="mt-1 text-[13px] text-[#6B7280]">{hint}</p>
    </Link>
  );
}

export default function WalletDashboardClient({ data }: { data: Dashboard }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-[#EFF6FF] text-[15px] font-bold text-[#2563EB]">
          {data.identity.photoInitials}
        </div>
        <div className="min-w-0">
          <p className="text-[18px] font-semibold text-[#111827]">
            {data.identity.fullName}
          </p>
          <p className="text-[14px] text-[#6B7280]">{data.identity.headline}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Completeness"
          value={`${data.completeness}%`}
          hint="Career Passport readiness"
          tone={data.completeness >= 80 ? "success" : "warning"}
          href="/wallet/passport"
        />
        <Stat
          label="Expiring soon"
          value={String(data.expiring.length)}
          hint="Next 60 days"
          tone={data.expiring.length ? "warning" : "success"}
          href="/wallet/documents"
        />
        <Stat
          label="Active shares"
          value={String(data.activeShares)}
          hint="Revoke anytime"
          tone="info"
          href="/wallet/sharing"
        />
        <Stat
          label="Unread alerts"
          value={String(data.unreadNotifications)}
          hint="Smart notifications"
          tone={data.unreadNotifications ? "warning" : "success"}
          href="/wallet/notifications"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <TrustScoreCard trust={data.trustScore} />

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-[#111827]">Badges</h2>
              <Link href="/wallet/badges" className="text-[13px] font-medium text-[#2563EB]">
                All badges
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.badges.map((b) => (
                <WalletBadgeChip key={b.id} badge={b} compact />
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-[#111827]">Expiring soon</h2>
              <Link href="/wallet/documents" className="text-[13px] font-medium text-[#2563EB]">
                Documents
              </Link>
            </div>
            {data.expiring.length === 0 ? (
              <EmptyState
                icon={FileWarning}
                title="Nothing urgent"
                description="No documents expire in the next 60 days."
                actionLabel="Browse documents"
                actionHref="/wallet/documents"
              />
            ) : (
              <div className="space-y-2">
                {data.expiring.slice(0, 5).map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/wallet/documents/${doc.id}`}
                    className="flex items-center justify-between gap-3 rounded-[12px] bg-[#F8F9FB] px-4 py-3 transition hover:bg-[#EFF6FF]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-[#111827]">
                        {doc.title}
                      </p>
                      <p className="mt-0.5 text-[13px] text-[#6B7280]">
                        Expires {doc.expiresAt ?? "soon"}
                      </p>
                    </div>
                    <WalletStatusBadge status={doc.status} />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-[16px] bg-[#EFF6FF] p-4">
            <div className="flex items-center gap-2 text-[#2563EB]">
              <Sparkles className="h-4 w-4" strokeWidth={2} />
              <h2 className="text-[15px] font-semibold">Alph tips</h2>
            </div>
            <ul className="mt-3 space-y-2">
              {data.alphTips.map((tip) => (
                <li key={tip} className="text-[14px] leading-relaxed text-[#334155]">
                  {tip}
                </li>
              ))}
            </ul>
            <Link
              href="/wallet/ai"
              className="mt-4 inline-flex text-[13px] font-medium text-[#2563EB]"
            >
              Open AI Assistant
            </Link>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#6B7280]" />
              <h2 className="text-[15px] font-semibold text-[#111827]">
                Enterprise requests
              </h2>
            </div>
            {data.openEnterprise.length === 0 ? (
              <p className="text-[14px] text-[#6B7280]">No open company requests.</p>
            ) : (
              <div className="space-y-2">
                {data.openEnterprise.map((req) => (
                  <Link
                    key={req.id}
                    href="/wallet/enterprise"
                    className="block rounded-[12px] bg-[#F8F9FB] px-4 py-3 transition hover:bg-[#EFF6FF]"
                  >
                    <p className="text-[14px] font-semibold text-[#111827]">
                      {req.companyName}
                    </p>
                    <p className="mt-1 text-[13px] text-[#6B7280] line-clamp-2">
                      {req.message}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#6B7280]" />
                <h2 className="text-[15px] font-semibold text-[#111827]">Recent activity</h2>
              </div>
              <Link href="/wallet/audit" className="text-[13px] font-medium text-[#2563EB]">
                Audit
              </Link>
            </div>
            <div className="space-y-2">
              {data.recentActivity.map((item) => (
                <Link
                  key={item.id}
                  href={item.href ?? "/wallet/audit"}
                  className="block rounded-[12px] bg-[#F8F9FB] px-4 py-3 transition hover:bg-[#EFF6FF]"
                >
                  <p className="text-[14px] text-[#111827]">{item.summary}</p>
                  <p className="mt-1 text-[12px] text-[#6B7280]">
                    {new Date(item.at).toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <Link
            href="/wallet/sharing"
            className="inline-flex items-center gap-2 text-[13px] font-medium text-[#2563EB]"
          >
            <Share2 className="h-4 w-4" />
            Manage sharing
          </Link>
        </div>
      </div>
    </div>
  );
}
