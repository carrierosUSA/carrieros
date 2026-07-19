"use client";

import Link from "next/link";
import { Briefcase, Calendar, Sparkles, UserRound } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import WorkforceKpiStrip from "@/components/workforce/WorkforceKpiStrip";
import WorkforceStatusBadge from "@/components/workforce/WorkforceStatusBadge";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import type { getWorkforceDashboard } from "@/lib/workforce/board";
import {
  APPLICATION_STATUS_LABELS,
  PROFESSIONAL_ROLE_LABELS,
} from "@/lib/types/workforce";
import { candidateFullName, formatPay } from "@/lib/workforce/board";

type Dashboard = ReturnType<typeof getWorkforceDashboard>;

export default function WorkforceDashboardClient({ data }: { data: Dashboard }) {
  return (
    <div className="space-y-6">
      <WorkforceKpiStrip kpis={data.kpis} />

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[#111827]">Open jobs</h2>
            <Link href="/workforce/jobs" className="text-[13px] font-medium text-[#2563EB]">
              View all
            </Link>
          </div>
          {data.jobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No open jobs"
              description="Post a role to start matching candidates with Alph."
              actionLabel="Create job"
              actionHref="/workforce/jobs"
            />
          ) : (
            <div className="space-y-2">
              {data.jobs.slice(0, 5).map((job) => (
                <Link
                  key={job.id}
                  href={`/workforce/jobs/${job.id}`}
                  className="flex items-center justify-between gap-3 rounded-[12px] bg-[#F8F9FB] px-4 py-3 transition hover:bg-[#EFF6FF]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-[#111827]">
                      {job.title}
                    </p>
                    <p className="mt-0.5 text-[13px] text-[#6B7280]">
                      {PROFESSIONAL_ROLE_LABELS[job.role]} · {job.region} · {formatPay(job)}
                    </p>
                  </div>
                  <span className="shrink-0 text-[13px] font-medium text-[#2563EB]">
                    {job.applicantsCount} applicants
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-[15px] font-semibold text-[#111827]">Pipeline</h2>
          <div className="space-y-2 rounded-[12px] bg-[#F8F9FB] p-3">
            {data.pipeline.map((p) => (
              <div key={p.status} className="flex items-center justify-between gap-2 px-1 py-1">
                <WorkforceStatusBadge
                  status={p.status}
                  label={APPLICATION_STATUS_LABELS[p.status]}
                />
                <span className="text-[15px] font-bold text-[#111827]">{p.count}</span>
              </div>
            ))}
          </div>
          <Link
            href="/workforce/applications"
            className="inline-flex text-[13px] font-medium text-[#2563EB]"
          >
            Open applications →
          </Link>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[#111827]">Interviews this week</h2>
            <Link href="/workforce/interviews" className="text-[13px] font-medium text-[#2563EB]">
              Schedule
            </Link>
          </div>
          {data.interviewsThisWeek.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No interviews scheduled"
              description="Schedule from an application when a candidate is ready."
              actionLabel="View applications"
              actionHref="/workforce/applications"
            />
          ) : (
            <div className="space-y-2">
              {data.interviewsThisWeek.map((i) => {
                const candidate = data.topMatches.find((c) => c.id === i.candidateId);
                return (
                  <div
                    key={i.id}
                    className="rounded-[12px] bg-[#F8F9FB] px-4 py-3"
                  >
                    <p className="text-[14px] font-semibold text-[#111827]">
                      {candidate
                        ? candidateFullName(candidate)
                        : "Candidate"}{" "}
                      · {new Date(i.scheduledAt).toLocaleString()}
                    </p>
                    <p className="mt-0.5 text-[13px] text-[#6B7280]">
                      {i.interviewer} · {i.type.replace("_", " ")}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[#111827]">Onboarding in progress</h2>
            <Link href="/workforce/onboarding" className="text-[13px] font-medium text-[#2563EB]">
              View
            </Link>
          </div>
          {data.onboarding.length === 0 ? (
            <EmptyState
              icon={UserRound}
              title="No active onboarding"
              description="Checklists appear when a hire moves to offer or hired."
            />
          ) : (
            <div className="space-y-2">
              {data.onboarding.map((o) => (
                <div key={o.id} className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[14px] font-semibold text-[#111827]">{o.hireName}</p>
                    <span className={`text-[13px] font-bold ${TRANSPO_COLORS.warning.text}`}>
                      {o.progress}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-[#EA580C]"
                      style={{ width: `${o.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#2563EB]" strokeWidth={1.9} />
            <h2 className="text-[15px] font-semibold text-[#111827]">AI match highlights</h2>
          </div>
          <div className="space-y-2">
            {data.topMatches.map((c) => (
              <Link
                key={c.id}
                href={`/workforce/candidates/${c.id}`}
                className="flex items-center justify-between gap-3 rounded-[12px] bg-[#EFF6FF] px-4 py-3 transition hover:bg-[#DBEAFE]"
              >
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-[#111827]">
                    {candidateFullName(c)}
                  </p>
                  <p className="mt-0.5 truncate text-[13px] text-[#6B7280]">{c.headline}</p>
                </div>
                <span className="shrink-0 text-[15px] font-bold text-[#2563EB]">
                  {c.matchScore}
                </span>
              </Link>
            ))}
          </div>
          <Link href="/workforce/ai" className="inline-flex text-[13px] font-medium text-[#2563EB]">
            Open AI Recruiting →
          </Link>
        </section>

        <section className="space-y-3">
          <h2 className="text-[15px] font-semibold text-[#111827]">
            Urgent docs & certifications
          </h2>
          {data.urgentExpirations.length === 0 ? (
            <div className={`rounded-[12px] px-4 py-3 ${TRANSPO_COLORS.success.bg}`}>
              <p className={`text-[14px] font-medium ${TRANSPO_COLORS.success.text}`}>
                Nothing urgent in the next 60 days.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.urgentExpirations.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`block rounded-[12px] px-4 py-3 ${
                    item.tone === "critical"
                      ? TRANSPO_COLORS.critical.bg
                      : TRANSPO_COLORS.warning.bg
                  }`}
                >
                  <p
                    className={`text-[14px] font-semibold ${
                      item.tone === "critical"
                        ? TRANSPO_COLORS.critical.text
                        : TRANSPO_COLORS.warning.text
                    }`}
                  >
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-[13px] text-[#6B7280]">{item.detail}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
