"use client";

import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import { ELD_IFTA_PROVIDERS } from "@/lib/ifta/eld-import";
import type { IftaQuarterId, IftaReportKind } from "@/lib/ifta/types";

type IftaExportPanelProps = {
  quarter: IftaQuarterId;
  year: number;
  readOnly?: boolean;
  onGeneratePackage: () => void;
  onExport: (kind: IftaReportKind | "csv" | "xlsx" | "pdf") => void;
  onEldImport: (provider: "samsara" | "motive" | "geotab") => void;
};

const ONE_CLICK_REPORTS: { kind: IftaReportKind; label: string }[] = [
  { kind: "truck_summary", label: "Truck Summary" },
  { kind: "state_summary", label: "State Summary" },
  { kind: "quarter_summary", label: "Quarter Summary" },
  { kind: "fuel_summary", label: "Fuel Summary" },
  { kind: "mileage_summary", label: "Mileage Summary" },
];

export default function IftaExportPanel({
  quarter,
  year,
  readOnly,
  onGeneratePackage,
  onExport,
  onEldImport,
}: IftaExportPanelProps) {
  return (
    <div className="space-y-5">
      <section className="rounded-[14px] bg-white p-5 ring-1 ring-[#EAEAEA]">
        <p className="text-[12px] font-medium uppercase tracking-wide text-slate-400">
          One-click package
        </p>
        <h3 className="mt-1 text-[17px] font-bold text-slate-950">
          Generate {quarter} {year} IFTA
        </h3>
        <p className="mt-1 text-[14px] font-medium text-slate-600">
          Calculates state miles, taxable miles, gallons, and MPG, then stores an
          accountant-ready package with download history.
        </p>
        <button
          type="button"
          onClick={onGeneratePackage}
          disabled={readOnly}
          title={
            readOnly
              ? "Accountants can download existing reports only"
              : undefined
          }
          className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-[#2563EB] px-5 text-[14px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Generate {quarter} IFTA
        </button>
      </section>

      <section className="rounded-[14px] bg-white p-5 ring-1 ring-[#EAEAEA]">
        <h3 className="text-[15px] font-semibold text-slate-950">
          One-click reports
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {ONE_CLICK_REPORTS.map((report) => (
            <button
              key={report.kind}
              type="button"
              onClick={() => onExport(report.kind)}
              className="inline-flex h-9 items-center rounded-full bg-[#F8FAFC] px-4 text-[13px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA] transition hover:bg-white"
            >
              {report.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[14px] bg-white p-5 ring-1 ring-[#EAEAEA]">
        <h3 className="text-[15px] font-semibold text-slate-950">
          Export formats
        </h3>
        <p className="mt-1 text-[13px] font-medium text-slate-500">
          CSV for spreadsheets, Excel-labeled CSV (.xlsx), and PDF text summary.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onExport("csv")}
            className="inline-flex h-9 items-center rounded-full bg-[#F8FAFC] px-4 text-[13px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA] hover:bg-white"
          >
            Download CSV
          </button>
          <button
            type="button"
            onClick={() => onExport("xlsx")}
            className="inline-flex h-9 items-center rounded-full bg-[#F8FAFC] px-4 text-[13px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA] hover:bg-white"
          >
            Download Excel
          </button>
          <button
            type="button"
            onClick={() => onExport("pdf")}
            className="inline-flex h-9 items-center rounded-full bg-[#F8FAFC] px-4 text-[13px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA] hover:bg-white"
          >
            Download PDF
          </button>
        </div>
      </section>

      <section className="rounded-[14px] bg-white p-5 ring-1 ring-[#EAEAEA]">
        <h3 className="text-[15px] font-semibold text-slate-950">
          ELD mileage import
        </h3>
        <p className="mt-1 text-[13px] font-medium text-slate-500">
          Future-ready stubs for Samsara, Motive, and Geotab.
        </p>
        <div className="mt-3 space-y-2">
          {ELD_IFTA_PROVIDERS.map((provider) => (
            <div
              key={provider.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-[#F8FAFC] px-3 py-3 ring-1 ring-[#EAEAEA]"
            >
              <div>
                <p className="text-[14px] font-semibold text-slate-900">
                  {provider.name}
                </p>
                <p className="text-[12px] font-medium text-slate-500">
                  {provider.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onEldImport(provider.id)}
                disabled={readOnly}
                title={
                  readOnly
                    ? "Read-only accountant access"
                    : "Import stub — not connected yet"
                }
                className={`inline-flex h-9 items-center rounded-full px-4 text-[13px] font-semibold ${CARRIEROS_COLORS.disabled.bg} ${CARRIEROS_COLORS.disabled.text} ring-1 ${CARRIEROS_COLORS.disabled.border} disabled:cursor-not-allowed disabled:opacity-60`}
              >
                Coming soon
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
