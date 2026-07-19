"use client";

import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import {
  formatGallons,
  formatMiles,
  formatMpg,
} from "@/lib/ifta/board";
import { formatTax } from "@/lib/ifta/tax";
import type { IftaQuarterId, IftaQuarterRow } from "@/lib/ifta/types";

type IftaQuarterViewProps = {
  rows: IftaQuarterRow[];
  selectedQuarter: IftaQuarterId;
  onSelectQuarter: (quarter: IftaQuarterId) => void;
};

export default function IftaQuarterView({
  rows,
  selectedQuarter,
  onSelectQuarter,
}: IftaQuarterViewProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rows.map((row) => {
        const active = row.quarter === selectedQuarter;
        const empty = row.tripCount === 0 && row.fuelCount === 0;
        return (
          <button
            key={row.label}
            type="button"
            disabled={empty}
            title={empty ? "No trips or fuel recorded for this quarter" : undefined}
            onClick={() => onSelectQuarter(row.quarter)}
            className={`rounded-[14px] px-4 py-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
              active
                ? `${CARRIEROS_COLORS.info.bg} ring-2 ${CARRIEROS_COLORS.info.ring}`
                : "bg-white ring-1 ring-[#EAEAEA] hover:bg-[#F8FAFC]"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[16px] font-bold text-slate-950">{row.label}</p>
              {row.reportCount > 0 ? (
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${CARRIEROS_COLORS.success.bg} ${CARRIEROS_COLORS.success.text}`}
                >
                  {row.reportCount} report{row.reportCount === 1 ? "" : "s"}
                </span>
              ) : null}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Cell label="Miles" value={formatMiles(row.totalMiles)} />
              <Cell label="Taxable" value={formatMiles(row.taxableMiles)} />
              <Cell label="Gallons" value={formatGallons(row.gallons)} />
              <Cell label="MPG" value={formatMpg(row.mpg)} />
            </div>
            <p
              className={`mt-3 text-[14px] font-bold tabular-nums ${
                row.estimatedTax > 0
                  ? CARRIEROS_COLORS.warning.text
                  : "text-slate-800"
              }`}
            >
              Est. tax {formatTax(row.estimatedTax)}
            </p>
            <p className="mt-1 text-[12px] font-medium text-slate-500">
              {row.tripCount} trips · {row.fuelCount} fuel fills
            </p>
          </button>
        );
      })}
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-slate-400">{label}</p>
      <p className="text-[14px] font-bold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}
