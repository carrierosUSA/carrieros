"use client";

import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import {
  formatGallons,
  formatMiles,
  formatMoney,
  formatMpg,
} from "@/lib/ifta/board";
import { formatTax } from "@/lib/ifta/tax";
import type { IftaTruckStateBreakdown } from "@/lib/ifta/types";

type IftaTruckDetailDrawerProps = {
  unitNumber: string;
  open: boolean;
  onClose: () => void;
  breakdown: IftaTruckStateBreakdown[];
};

export default function IftaTruckDetailDrawer({
  unitNumber,
  open,
  onClose,
  breakdown,
}: IftaTruckDetailDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close truck detail"
        className="absolute inset-0 bg-slate-950/30"
        onClick={onClose}
      />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-[#EAEAEA] px-5 py-4">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-wide text-slate-400">
              State breakdown
            </p>
            <h2 className="text-[18px] font-bold text-slate-950">
              Unit {unitNumber}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#F8FAFC] px-3 py-1.5 text-[13px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA]"
          >
            Close
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {breakdown.length === 0 ? (
            <p className="px-2 py-8 text-center text-[14px] font-medium text-slate-500">
              No state miles for this truck in the selected quarter.
            </p>
          ) : (
            breakdown.map((row) => (
              <div
                key={row.state}
                className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[15px] font-semibold text-slate-950">
                    {row.stateName}
                    <span className="ml-2 text-[13px] font-medium text-slate-500">
                      {row.state}
                    </span>
                  </p>
                  <p
                    className={`text-[14px] font-bold tabular-nums ${
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
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Mini label="Miles" value={formatMiles(row.miles)} />
                  <Mini label="Taxable" value={formatMiles(row.taxableMiles)} />
                  <Mini label="Gallons" value={formatGallons(row.gallons)} />
                  <Mini label="MPG" value={formatMpg(row.mpg)} />
                </div>
                <p className="mt-2 text-[12px] font-medium text-slate-500">
                  Rate {formatMoney(row.taxRate)}/gal
                </p>
              </div>
            ))
          )}
        </div>
      </aside>
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
