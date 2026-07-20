"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  activeIssueBanner,
  getSupportStore,
  getSupportStoreServerSnapshot,
  subscribeSupportStore,
  ISSUE_STATUS_LABELS,
} from "@/lib/support";

export default function SupportIssueBanner() {
  const store = useSyncExternalStore(
    subscribeSupportStore,
    getSupportStore,
    getSupportStoreServerSnapshot,
  );
  const issue = activeIssueBanner(store.issues);

  if (!issue) return null;

  const isResolved = issue.status === "resolved";
  const tone =
    issue.severity === "critical" || issue.severity === "high"
      ? "border-[#FECACA] bg-[#FEF2F2]"
      : "border-[#FED7AA] bg-[#FFF7ED]";

  return (
    <div className={`border-b px-3 py-2.5 sm:px-4 lg:px-6 ${tone}`}>
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            {isResolved ? "Resolved" : "Issue Found"} ·{" "}
            {ISSUE_STATUS_LABELS[issue.status]}
          </p>
          <p className="mt-0.5 text-[14px] font-medium text-slate-900">
            {issue.humanMessage}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/support?issue=${issue.id}`}
            className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-800 ring-1 ring-[#EAEAEA] transition hover:bg-slate-50"
          >
            Review Details
          </Link>
          <Link
            href="/support"
            className="rounded-full bg-[#2563EB] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            Open Support
          </Link>
        </div>
      </div>
    </div>
  );
}
