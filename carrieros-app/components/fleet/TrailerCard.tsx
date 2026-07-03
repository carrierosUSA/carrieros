import type { Trailer } from "@/lib/types";
import TrailerStatusBadge from "@/components/fleet/TrailerStatusBadge";

type TrailerCardProps = {
  trailer: Trailer;
  truckLabel?: string;
};

export default function TrailerCard({ trailer, truckLabel }: TrailerCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-400">Unit {trailer.unitNumber}</p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-100">{trailer.type}</h2>
        </div>
        <TrailerStatusBadge status={trailer.status} />
      </div>

      <div className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
        <p>
          <span className="text-zinc-500">Plate:</span> {trailer.licensePlate}
        </p>
        <p>
          <span className="text-zinc-500">Location:</span> {trailer.location ?? "Unknown"}
        </p>
        <p>
          <span className="text-zinc-500">Assigned Truck:</span> {truckLabel ?? "Unassigned"}
        </p>
      </div>
    </div>
  );
}
