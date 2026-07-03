import Link from "next/link";
import type { Truck } from "@/lib/types";
import TruckStatusBadge from "@/components/fleet/TruckStatusBadge";
import { formatMileage, formatTruckLabel } from "@/lib/services/fleet/fleet-helpers";

type TruckCardProps = {
  truck: Truck;
  driverName?: string;
};

export default function TruckCard({ truck, driverName }: TruckCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-400">Unit {truck.unitNumber}</p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-100">
            {formatTruckLabel(truck)}
          </h2>
        </div>
        <TruckStatusBadge status={truck.status} />
      </div>

      <div className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
        <p>
          <span className="text-zinc-500">Driver:</span> {driverName ?? "Unassigned"}
        </p>
        <p>
          <span className="text-zinc-500">Location:</span> {truck.location ?? "Unknown"}
        </p>
        <p>
          <span className="text-zinc-500">Mileage:</span> {formatMileage(truck.mileage)} mi
        </p>
        <p>
          <span className="text-zinc-500">Plate:</span> {truck.licensePlate}
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          href={`/fleet/trucks/${truck.id}`}
          className="block rounded-xl border border-zinc-700 px-4 py-3 text-center text-sm font-semibold text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-800"
        >
          View Truck
        </Link>
        <Link
          href={`/fleet/trucks/${truck.id}/edit`}
          className="block rounded-xl border border-zinc-700 px-4 py-3 text-center text-sm font-semibold text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-800"
        >
          Edit Truck
        </Link>
      </div>
    </div>
  );
}
