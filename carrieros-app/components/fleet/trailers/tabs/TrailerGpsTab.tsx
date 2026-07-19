import Link from "next/link";
import type { TelematicsLocation } from "@/lib/fleet/telematics-provider";
import type { Load, Trailer } from "@/lib/types";

type TrailerGpsTabProps = {
  trailer: Trailer;
  location: TelematicsLocation | null;
  activeLoad?: Load;
};

export default function TrailerGpsTab({
  trailer,
  location,
  activeLoad,
}: TrailerGpsTabProps) {
  return (
    <div className="space-y-4">
      <section className="rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[15px] font-semibold text-slate-950">Live location</h2>
          <p className="text-[12px] font-medium text-slate-500">
            {(trailer.telematicsProvider ?? "mock").toUpperCase()} · Ready for
            Samsara / Motive / Geotab
          </p>
        </div>

        {location ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]">
              <p className="text-[12px] font-medium text-slate-500">Address</p>
              <p className="mt-1 text-[15px] font-semibold text-slate-950">
                {location.address ?? trailer.location ?? "Unknown"}
              </p>
            </div>
            <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]">
              <p className="text-[12px] font-medium text-slate-500">Coordinates</p>
              <p className="mt-1 text-[15px] font-semibold tabular-nums text-slate-950">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            </div>
            <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]">
              <p className="text-[12px] font-medium text-slate-500">Speed</p>
              <p className="mt-1 text-[15px] font-semibold text-slate-950">
                {location.speedMph != null ? `${location.speedMph} mph` : "—"}
              </p>
            </div>
            <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]">
              <p className="text-[12px] font-medium text-slate-500">Heading</p>
              <p className="mt-1 text-[15px] font-semibold text-slate-950">
                {location.heading != null ? `${location.heading}°` : "—"}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-[14px] text-slate-500">
            No GPS ping yet. Location will appear when a telematics adapter is
            connected.
          </p>
        )}
      </section>

      <section className="rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA]">
        <h2 className="text-[15px] font-semibold text-slate-950">Trip tools</h2>
        <p className="mt-1 text-[14px] text-slate-500">
          Live tracking, replay, and route history open from the active load.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {activeLoad ? (
            <>
              <Link
                href={`/loads/${activeLoad.id}/tracking`}
                className="inline-flex h-9 items-center rounded-full bg-[#2563EB] px-4 text-[13px] font-semibold text-white"
              >
                View Live Location
              </Link>
              <Link
                href={`/loads/${activeLoad.id}/tracking/replay`}
                className="inline-flex h-9 items-center rounded-full bg-[#F8FAFC] px-4 text-[13px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA]"
              >
                Replay Trip
              </Link>
              <Link
                href={`/loads/${activeLoad.id}/tracking`}
                className="inline-flex h-9 items-center rounded-full bg-[#F8FAFC] px-4 text-[13px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA]"
              >
                Route History
              </Link>
            </>
          ) : (
            <p className="text-[13px] font-medium text-slate-500">
              Assign this trailer to an active load to enable trip tools.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
