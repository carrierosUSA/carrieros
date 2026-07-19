import Link from "next/link";
import TrailerStatusBadge from "@/components/fleet/TrailerStatusBadge";
import TrailerTypeBadge from "@/components/fleet/trailers/TrailerTypeBadge";
import { getTrailerOperationalStatus } from "@/lib/fleet/trailer-board";
import type { Load, Trailer } from "@/lib/types";

type TrailerCardProps = {
  trailer: Trailer;
  loads: Load[];
  truckLabel?: string;
};

function TrailerPhoto({ trailer }: { trailer: Trailer }) {
  if (trailer.photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={trailer.photoUrl}
        alt=""
        className="h-16 w-16 rounded-[14px] object-cover ring-2 ring-white"
      />
    );
  }

  return (
    <div
      className="flex h-16 w-16 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-[#EEF2FF] text-[15px] font-bold text-[#2563EB] ring-1 ring-[#EAEAEA]"
      aria-hidden
    >
      {trailer.unitNumber}
    </div>
  );
}

export default function TrailerCard({
  trailer,
  loads,
  truckLabel,
}: TrailerCardProps) {
  const status = getTrailerOperationalStatus(trailer, loads);

  return (
    <Link
      href={`/fleet/trailers/${trailer.id}`}
      className="group block rounded-[16px] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-[#EAEAEA] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)]"
    >
      <div className="flex items-start gap-3">
        <TrailerPhoto trailer={trailer} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[16px] font-semibold text-slate-950 group-hover:text-[#2563EB]">
              Trailer {trailer.unitNumber}
            </h3>
            <TrailerStatusBadge status={status} />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <TrailerTypeBadge type={trailer.type} />
            <p className="text-[13px] text-slate-500">
              {trailer.year ? `${trailer.year} ` : ""}
              {trailer.make ?? "—"}
            </p>
          </div>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-[12px]">
        <div>
          <dt className="font-medium text-slate-400">VIN</dt>
          <dd className="truncate font-semibold text-slate-800">
            {trailer.vin ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-slate-400">Plate</dt>
          <dd className="font-semibold text-slate-800">{trailer.licensePlate}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-400">State</dt>
          <dd className="font-semibold text-slate-800">
            {trailer.licenseState ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-slate-400">Truck</dt>
          <dd className="truncate font-semibold text-slate-800">
            {truckLabel ?? "Unassigned"}
          </dd>
        </div>
      </dl>
    </Link>
  );
}
