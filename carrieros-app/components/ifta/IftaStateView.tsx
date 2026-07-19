"use client";

import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import {
  formatGallons,
  formatMiles,
  formatMoney,
  formatMpg,
} from "@/lib/ifta/board";
import { formatTax } from "@/lib/ifta/tax";
import type { IftaStateRow } from "@/lib/ifta/types";

type IftaStateViewProps = {
  rows: IftaStateRow[];
};

export default function IftaStateView({ rows }: IftaStateViewProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-[14px] bg-[#F8FAFC] px-5 py-10 text-center ring-1 ring-[#EAEAEA]">
        <p className="text-[15px] font-semibold text-slate-800">
          No state activity this quarter
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div
          key={row.state}
          className="rounded-[14px] bg-white px-4 py-4 ring-1 ring-[#EAEAEA]"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[15px] font-semibold text-slate-950">
                {row.stateName}
              </p>
              <p className="text-[13px] font-medium text-slate-500">
                {row.state} · rate {formatMoney(row.taxRate)}/gal
              </p>
            </div>
            <p
              className={`text-[16px] font-bold tabular-nums ${
                row.estimatedTax > 0
                  ? CARRIEROS_COLORS.warning.text
                  : row.estimatedTax < 0
                    ? CARRIEROS_COLORS.success.text
                    : "text-slate-900"
              }`}
            >
              {formatTax(row.estimatedTax)}
            </p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Cell label="Total miles" value={formatMiles(row.totalMiles)} />
            <Cell label="Taxable" value={formatMiles(row.taxableMiles)} />
            <Cell label="Fuel cost" value={formatMoney(row.fuelPurchasedCost)} />
            <Cell label="Gallons" value={formatGallons(row.gallons)} />
            <Cell label="MPG" value={formatMpg(row.mpg)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="text-[14px] font-bold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}
