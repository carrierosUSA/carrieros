import type { FuelRecord } from "@/lib/types";
import { formatCurrency, formatMileage } from "@/lib/services/fleet/fleet-helpers";

type FuelRecordCardProps = {
  record: FuelRecord;
  truckLabel: string;
};

export default function FuelRecordCard({ record, truckLabel }: FuelRecordCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-400">{record.date}</p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-100">{truckLabel}</h2>
        </div>
        <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-300">
          {record.gallons} gal
        </span>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
        <p>
          <span className="text-zinc-500">Location:</span> {record.location}
        </p>
        <p>
          <span className="text-zinc-500">Cost:</span> {formatCurrency(record.cost)}
        </p>
        <p>
          <span className="text-zinc-500">Mileage:</span> {formatMileage(record.mileage)} mi
        </p>
        <p>
          <span className="text-zinc-500">Price/Gal:</span>{" "}
          {formatCurrency(record.cost / record.gallons)}
        </p>
      </div>
    </div>
  );
}
