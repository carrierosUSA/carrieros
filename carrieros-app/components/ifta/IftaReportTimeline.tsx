"use client";

import {
  formatGallons,
  formatMiles,
  formatMoney,
  formatMpg,
} from "@/lib/ifta/board";
import type { IftaGeneratedReport } from "@/lib/ifta/types";

type IftaReportTimelineProps = {
  reports: IftaGeneratedReport[];
  onDownload: (report: IftaGeneratedReport, format: "csv" | "pdf") => void;
};

export default function IftaReportTimeline({
  reports,
  onDownload,
}: IftaReportTimelineProps) {
  if (reports.length === 0) {
    return (
      <div className="rounded-[14px] bg-[#F8FAFC] px-5 py-8 text-center ring-1 ring-[#EAEAEA]">
        <p className="text-[15px] font-semibold text-slate-800">
          No reports generated yet
        </p>
        <p className="mt-1 text-[13px] font-medium text-slate-500">
          Use Generate IFTA to create an accountant-ready package.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-[14px] font-semibold text-slate-800">
        Report timeline
      </h3>
      {reports.map((report) => (
        <div
          key={report.id}
          className="rounded-[14px] bg-white px-4 py-4 ring-1 ring-[#EAEAEA]"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[15px] font-semibold text-slate-950">
                {report.title}
              </p>
              <p className="mt-0.5 text-[13px] font-medium text-slate-500">
                {new Date(report.generatedAt).toLocaleString()} ·{" "}
                {report.generatedBy}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onDownload(report, "csv")}
                className="inline-flex h-9 items-center rounded-full bg-[#F8FAFC] px-3 text-[13px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA] hover:bg-white"
              >
                CSV
              </button>
              <button
                type="button"
                onClick={() => onDownload(report, "pdf")}
                className="inline-flex h-9 items-center rounded-full bg-[#2563EB] px-3 text-[13px] font-semibold text-white hover:bg-[#1D4ED8]"
              >
                PDF
              </button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Mini
              label="Miles"
              value={formatMiles(report.summary.totalMiles)}
            />
            <Mini
              label="Gallons"
              value={formatGallons(report.summary.gallons)}
            />
            <Mini label="MPG" value={formatMpg(report.summary.mpg)} />
            <Mini
              label="Est. tax"
              value={formatMoney(report.summary.estimatedTax)}
            />
          </div>
          {report.downloadHistory.length > 0 ? (
            <div className="mt-3 border-t border-[#F1F5F9] pt-3">
              <p className="text-[12px] font-medium text-slate-400">
                Downloads
              </p>
              <ul className="mt-1 space-y-1">
                {report.downloadHistory.slice(0, 4).map((dl) => (
                  <li
                    key={dl.id}
                    className="text-[12px] font-medium text-slate-600"
                  >
                    {dl.filename} · {dl.format.toUpperCase()} ·{" "}
                    {new Date(dl.downloadedAt).toLocaleString()} ·{" "}
                    {dl.downloadedBy}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-slate-400">{label}</p>
      <p className="text-[13px] font-bold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}
