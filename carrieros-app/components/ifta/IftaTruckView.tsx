"use client";

import {
  formatGallons,
  formatMiles,
  formatMpg,
} from "@/lib/ifta/board";
import { formatTax } from "@/lib/ifta/tax";
import type { IftaTruckRow } from "@/lib/ifta/types";

type IftaTruckViewProps = {
  rows: IftaTruckRow[];
  onSelectTruck: (truckId: string) => void;
};

export default function IftaTruckView({
  rows,
  onSelectTruck,
}: IftaTruckViewProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-[14px] bg-[#F8FAFC] px-5 py-10 text-center ring-1 ring-[#EAEAEA]">
        <p className="text-[15px] font-semibold text-slate-800">
          No truck miles this quarter
        </p>
        <p className="mt-1 text-[13px] font-medium text-slate-500">
          Import ELD mileage or add trips to build the truck summary.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <button
          key={row.truckId}
          type="button"
          onClick={() => onSelectTruck(row.truckId)}
          className="flex w-full flex-col gap-3 rounded-[14px] bg-white px-4 py-4 text-left ring-1 ring-[#EAEAEA] transition hover:bg-[#F8FAFC] sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-slate-950">
              Unit {row.unitNumber}
            </p>
            <p className="mt-1 text-[13px] font-medium text-slate-500">
              States: {row.statesVisited.join(", ") || "—"}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 sm:justify-end">
            <Metric label="Miles" value={formatMiles(row.totalMiles)} />
            <Metric label="Fuel" value={`${formatGallons(row.totalFuel)} gal`} />
            <Metric label="MPG" value={formatMpg(row.mpg)} />
            <Metric label="Est. tax" value={formatTax(row.estimatedTax)} />
          </div>
        </button>
      ))}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="text-[14px] font-bold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}
