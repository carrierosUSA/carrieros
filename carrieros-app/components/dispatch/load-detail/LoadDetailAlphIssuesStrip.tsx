"use client";

import {
  IssueSeverityIcon,
  useAlphIssueActions,
} from "@/components/dispatch/load-detail/LoadDetailAlphIssueActions";
import type { AlphIssue } from "@/lib/dispatch/alph-issues";

type LoadDetailAlphIssuesStripProps = {
  issues: AlphIssue[];
  loadId: string;
  driverPhone?: string;
  trackingEnabled: boolean;
  hasDriver: boolean;
};

function scrollToTarget(target?: string) {
  if (!target) {
    return;
  }

  document.getElementById(target)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export default function LoadDetailAlphIssuesStrip({
  issues,
  loadId,
  driverPhone,
  trackingEnabled,
  hasDriver,
}: LoadDetailAlphIssuesStripProps) {
  const { fixIssue } = useAlphIssueActions({
    loadId,
    driverPhone,
    trackingEnabled,
    hasDriver,
  });

  if (issues.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Alph detected issues"
      className="mb-3 rounded-[14px] border border-[#FED7AA] bg-[#FFF7ED] p-4 shadow-sm"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[15px]" aria-hidden>
          ⚠
        </span>
        <div>
          <p className="text-[14px] font-bold text-[#9A3412]">
            Alph detected {issues.length} issue{issues.length === 1 ? "" : "s"}
          </p>
          <p className="text-[13px] font-medium text-[#C2410C]">
            Fix these now — no searching required.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="flex flex-wrap items-center gap-3 rounded-[12px] border border-[#FED7AA] bg-white px-3 py-3 sm:flex-nowrap"
          >
            <IssueSeverityIcon severity={issue.severity} />
            <p className="min-w-0 flex-1 text-[14px] font-semibold text-slate-900">
              {issue.message}
            </p>
            <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
              <button
                type="button"
                onClick={() => fixIssue(issue.fixAction)}
                className="inline-flex h-9 flex-1 items-center justify-center rounded-full bg-[#2563EB] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8] sm:flex-none"
              >
                {issue.fixLabel}
              </button>
              <button
                type="button"
                onClick={() => scrollToTarget(issue.viewTarget)}
                className="inline-flex h-9 items-center justify-center rounded-full border border-[#EAEAEA] bg-white px-3 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
