import Link from "next/link";
import type { Trailer } from "@/lib/types";
import TrailerStatusBadge from "@/components/fleet/TrailerStatusBadge";
import TrailerTypeBadge from "@/components/fleet/trailers/TrailerTypeBadge";

type TrailerCardProps = {
  trailer: Trailer;
  truckLabel?: string;
};

/** Legacy list card — prefer `components/fleet/trailers/TrailerCard` for the dashboard. */
export default function TrailerCard({ trailer, truckLabel }: TrailerCardProps) {
  return (
    <Link
      href={`/fleet/trailers/${trailer.id}`}
      className="block rounded-[16px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-[#EAEAEA] transition hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-[#2563EB]">
            Trailer {trailer.unitNumber}
          </p>
          <div className="mt-1.5">
            <TrailerTypeBadge type={trailer.type} />
          </div>
        </div>
        <TrailerStatusBadge status={trailer.status} />
      </div>

      <div className="mt-5 grid gap-3 text-[14px] text-slate-600 sm:grid-cols-2">
        <p>
          <span className="text-slate-400">Plate:</span> {trailer.licensePlate}
        </p>
        <p>
          <span className="text-slate-400">Location:</span>{" "}
          {trailer.location ?? "Unknown"}
        </p>
        <p>
          <span className="text-slate-400">Assigned Truck:</span>{" "}
          {truckLabel ?? "Unassigned"}
        </p>
      </div>
    </Link>
  );
}
