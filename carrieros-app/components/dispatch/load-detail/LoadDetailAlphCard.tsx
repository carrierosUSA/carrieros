"use client";

import { useState } from "react";
import LoadDetailCard from "@/components/dispatch/load-detail/LoadDetailCard";
import {
  AlphMonitoringOk,
  GlowingStarIcon,
  IssueSeverityIcon,
  useAlphIssueActions,
} from "@/components/dispatch/load-detail/LoadDetailAlphIssueActions";
import AiPolicyNotice from "@/components/ai-safety/AiPolicyNotice";
import type { AlphIssue } from "@/lib/dispatch/alph-issues";

type LoadDetailAlphCardProps = {
  issues: AlphIssue[];
  loadId: string;
  driverPhone?: string;
  trackingEnabled: boolean;
  hasDriver: boolean;
};

export default function LoadDetailAlphCard({
  issues,
  loadId,
  driverPhone,
  trackingEnabled,
  hasDriver,
}: LoadDetailAlphCardProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const { fixIssue } = useAlphIssueActions({
    loadId,
    driverPhone,
    trackingEnabled,
    hasDriver,
  });

  const visibleIssues = issues.filter((issue) => !dismissedIds.has(issue.id));

  function dismissIssue(id: string) {
    setDismissedIds((current) => new Set([...current, id]));
  }

  return (
    <LoadDetailCard
      id="load-alph"
      title="Alph"
      icon={<GlowingStarIcon />}
      action={
        visibleIssues.length > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FED7AA] bg-[#FFF7ED] px-2.5 py-0.5 text-[11px] font-semibold text-[#C2410C]">
            {visibleIssues.length} issue{visibleIssues.length === 1 ? "" : "s"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/60 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.8)]" />
            Monitoring
          </span>
        )
      }
    >
      <div className="mb-3">
        <AiPolicyNotice variant="compact" />
      </div>
      {visibleIssues.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {visibleIssues.map((issue) => (
            <div
              key={issue.id}
              className={`rounded-[12px] border px-3.5 py-3 ${
                issue.severity === "critical"
                  ? "border-[#FECACA] bg-[#FEF2F2]"
                  : "border-[#FED7AA] bg-[#FFF7ED]"
              }`}
            >
              <div className="flex items-start gap-3">
                <IssueSeverityIcon severity={issue.severity} />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold leading-snug text-slate-900">
                    {issue.message}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fixIssue(issue.fixAction)}
                      className="inline-flex h-9 items-center rounded-full bg-[#2563EB] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
                    >
                      {issue.fixLabel}
                    </button>
                    <button
                      type="button"
                      onClick={() => dismissIssue(issue.id)}
                      className="inline-flex h-9 items-center rounded-full px-3 text-[13px] font-medium text-slate-500 transition hover:bg-white/70 hover:text-slate-700"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AlphMonitoringOk />
      )}
    </LoadDetailCard>
  );
}
