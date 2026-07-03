import type { MaintenanceRecord } from "@/lib/types";
import MaintenanceStatusBadge from "@/components/fleet/MaintenanceStatusBadge";
import { formatCurrency, formatMileage } from "@/lib/services/fleet/fleet-helpers";

type MaintenanceRecordCardProps = {
  record: MaintenanceRecord;
  truckLabel: string;
  trailerLabel?: string;
};

export default function MaintenanceRecordCard({
  record,
  truckLabel,
  trailerLabel,
}: MaintenanceRecordCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-400">{record.type}</p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-100">{truckLabel}</h2>
        </div>
        <MaintenanceStatusBadge status={record.status} />
      </div>

      <p className="mt-4 text-sm text-zinc-300">{record.description}</p>

      <div className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
        <p>
          <span className="text-zinc-500">Scheduled:</span> {record.scheduledDate}
        </p>
        <p>
          <span className="text-zinc-500">Completed:</span>{" "}
          {record.completedDate ?? "Pending"}
        </p>
        <p>
          <span className="text-zinc-500">Cost:</span> {formatCurrency(record.cost)}
        </p>
        <p>
          <span className="text-zinc-500">Mileage:</span> {formatMileage(record.mileage)} mi
        </p>
        {trailerLabel ? (
          <p className="sm:col-span-2">
            <span className="text-zinc-500">Trailer:</span> {trailerLabel}
          </p>
        ) : null}
      </div>
    </div>
  );
}
