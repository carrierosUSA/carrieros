"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import DocumentHealthScoreBadge from "@/components/documents/DocumentHealthScoreBadge";
import DocumentRequestPanel from "@/components/documents/DocumentRequestPanel";
import FadeIn from "@/components/ui/FadeIn";
import type { DocumentHealthAnalytics } from "@/lib/documents/document-health-analytics";
import { sortDocumentHealthSnapshots } from "@/lib/documents/document-health";
import type {
  DocumentHealthSnapshot,
  DocumentHealthSort,
  DocumentRequest,
} from "@/lib/documents/types";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type DocumentHealthDashboardClientProps = {
  snapshots: DocumentHealthSnapshot[];
  analytics: DocumentHealthAnalytics;
  requests: DocumentRequest[];
};

const SORT_OPTIONS: Array<{ value: DocumentHealthSort; label: string }> = [
  { value: "most_critical", label: "Most Critical" },
  { value: "ready_to_invoice", label: "Ready to Invoice" },
  { value: "waiting_on_driver", label: "Waiting on Driver" },
  { value: "waiting_on_broker", label: "Waiting on Broker" },
  { value: "waiting_on_accounting", label: "Waiting on Accounting" },
];

const WAITING_LABELS: Record<DocumentHealthSnapshot["waitingOn"], string> = {
  none: "Clear",
  driver: "Driver",
  broker: "Broker",
  accounting: "Accounting",
  ready_to_invoice: "Ready to invoice",
};

function Metric({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: keyof typeof CARRIEROS_COLORS;
}) {
  const colors = CARRIEROS_COLORS[tone];
  return (
    <div className={`rounded-[14px] px-4 py-4 ${colors.bg}`}>
      <p className={`text-[13px] font-medium ${colors.text}`}>{label}</p>
      <p className={`mt-1 text-[28px] font-bold tabular-nums tracking-tight ${colors.text}`}>
        {value}
      </p>
      <p className={`mt-0.5 text-[13px] ${colors.text} opacity-80`}>{detail}</p>
    </div>
  );
}

export default function DocumentHealthDashboardClient({
  snapshots,
  analytics,
  requests,
}: DocumentHealthDashboardClientProps) {
  const [sort, setSort] = useState<DocumentHealthSort>("most_critical");

  const sorted = useMemo(
    () => sortDocumentHealthSnapshots(snapshots, sort),
    [snapshots, sort],
  );

  return (
    <FadeIn className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Missing Documents Today"
          value={String(analytics.missingDocumentsToday)}
          detail={`${analytics.criticalLoads} loads critical`}
          tone="critical"
        />
        <Metric
          label="Loads Waiting on POD"
          value={String(analytics.loadsWaitingOnPod)}
          detail="Cannot invoice yet"
          tone="warning"
        />
        <Metric
          label="Loads Ready to Invoice"
          value={String(analytics.loadsReadyToInvoice)}
          detail="POD on file"
          tone="success"
        />
        <Metric
          label="Average Upload Time"
          value={`${analytics.averageUploadTimeHours}h`}
          detail="Heuristic until OCR timestamps"
          tone="info"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[16px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] ring-1 ring-[#EAEAEA]">
          <h2 className="text-[15px] font-semibold text-slate-950">
            Missing by driver
          </h2>
          <ul className="mt-4 space-y-3">
            {analytics.byDriver.length === 0 ? (
              <li className="text-[14px] text-slate-500">No driver gaps</li>
            ) : (
              analytics.byDriver.map((row) => (
                <li
                  key={row.driverId}
                  className="flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-[14px] font-semibold text-slate-900">
                      {row.driverName}
                    </p>
                    <p className="text-[12px] text-slate-500">
                      {row.criticalLoads} critical loads
                    </p>
                  </div>
                  <span className="text-[16px] font-bold tabular-nums text-[#DC2626]">
                    {row.missingCount}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-[16px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] ring-1 ring-[#EAEAEA]">
          <h2 className="text-[15px] font-semibold text-slate-950">
            Missing by broker
          </h2>
          <ul className="mt-4 space-y-3">
            {analytics.byBroker.length === 0 ? (
              <li className="text-[14px] text-slate-500">No broker gaps</li>
            ) : (
              analytics.byBroker.map((row) => (
                <li
                  key={row.brokerId}
                  className="flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-[14px] font-semibold text-slate-900">
                      {row.brokerName}
                    </p>
                    <p className="text-[12px] text-slate-500">
                      {row.criticalLoads} critical loads
                    </p>
                  </div>
                  <span className="text-[16px] font-bold tabular-nums text-[#EA580C]">
                    {row.missingCount}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <DocumentRequestPanel requests={requests} />

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[16px] font-semibold text-slate-950">
              Load document health
            </h2>
            <p className="text-[14px] text-slate-500">
              {analytics.completeLoads} complete · {analytics.warningLoads}{" "}
              warning · {analytics.criticalLoads} critical
            </p>
          </div>
          <label className="flex items-center gap-2 text-[13px] font-medium text-slate-600">
            Sort
            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as DocumentHealthSort)
              }
              className="h-10 rounded-full bg-[#F8FAFC] px-4 text-[13px] font-semibold text-slate-900 outline-none ring-1 ring-[#E2E8F0] focus:ring-[#93C5FD]"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="space-y-3">
          {sorted.map((snapshot) => {
            const topIssue = snapshot.issues[0];
            return (
              <Link
                key={snapshot.loadId}
                href={`/loads/${snapshot.loadId}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] ring-1 ring-[#EAEAEA] transition hover:ring-[#BFDBFE]"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[15px] font-semibold text-slate-950">
                      {snapshot.loadReference}
                    </p>
                    <DocumentHealthScoreBadge
                      score={snapshot.score}
                      size="sm"
                    />
                  </div>
                  <p className="mt-1 truncate text-[13px] text-slate-500">
                    {topIssue?.message ?? "All required documents on file"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-medium uppercase tracking-wide text-slate-400">
                    Waiting
                  </p>
                  <p className="text-[14px] font-semibold text-slate-800">
                    {WAITING_LABELS[snapshot.waitingOn]}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </FadeIn>
  );
}
