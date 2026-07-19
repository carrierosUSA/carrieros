"use client";

import { useState } from "react";
import {
  COMPLIANCE_REPORT_TYPE_LABELS,
  type ComplianceReportCard,
} from "@/lib/types/compliance";
import { formatComplianceDate } from "@/lib/compliance/compliance-board";
import { markReportGenerated } from "@/lib/data/compliance-store";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type ComplianceReportsPanelProps = {
  reports: ComplianceReportCard[];
};

export default function ComplianceReportsPanel({
  reports: initial,
}: ComplianceReportsPanelProps) {
  const [reports, setReports] = useState(initial);
  const [toast, setToast] = useState<string | null>(null);

  function handleExport(report: ComplianceReportCard) {
    const updated = markReportGenerated(report.id);
    if (updated) {
      setReports((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r)),
      );
    }
    setToast(`${COMPLIANCE_REPORT_TYPE_LABELS[report.type]} exported`);
    window.setTimeout(() => setToast(null), 2200);
  }

  return (
    <section className="space-y-4">
      <div>
        <p className="text-[15px] font-semibold text-slate-900">Reports</p>
        <p className="text-[13px] text-slate-500">
          Clean safety packages ready to share with auditors and insurers.
        </p>
      </div>

      {toast ? (
        <div
          className={`rounded-[12px] px-4 py-2 text-[13px] font-semibold ${CARRIEROS_COLORS.success.bg} ${CARRIEROS_COLORS.success.text}`}
        >
          {toast} — download stub ready
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => {
          const stale = report.status === "stale";
          return (
            <div
              key={report.id}
              className="flex flex-col rounded-[16px] bg-white p-4 ring-1 ring-[#EAEAEA]"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[15px] font-semibold text-slate-900">
                  {report.title}
                </p>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
                    stale
                      ? `${CARRIEROS_COLORS.warning.bg} ${CARRIEROS_COLORS.warning.text} ${CARRIEROS_COLORS.warning.border}`
                      : `${CARRIEROS_COLORS.success.bg} ${CARRIEROS_COLORS.success.text} ${CARRIEROS_COLORS.success.border}`
                  }`}
                >
                  {stale ? "Needs refresh" : "Ready"}
                </span>
              </div>
              <p className="mt-2 flex-1 text-[13px] leading-5 text-slate-600">
                {report.description}
              </p>
              <p className="mt-3 text-[12px] font-medium text-slate-400">
                Updated {formatComplianceDate(report.lastGeneratedAt)}
              </p>
              <button
                type="button"
                onClick={() => handleExport(report)}
                className="mt-3 inline-flex h-9 items-center justify-center rounded-full bg-[#2563EB] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
              >
                {stale ? "Refresh & Export" : "Export PDF"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
