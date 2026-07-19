import Link from "next/link";
import type { TelematicsVehicleSnapshot } from "@/lib/fleet/telematics-provider";
import type { Load, Truck } from "@/lib/types";
import { getActiveLoadsForTruck } from "@/lib/fleet/truck-board";

type TruckGpsTabProps = {
  truck: Truck;
  loads: Load[];
  snapshot: TelematicsVehicleSnapshot;
};

export default function TruckGpsTab({
  truck,
  loads,
  snapshot,
}: TruckGpsTabProps) {
  const activeLoads = getActiveLoadsForTruck(truck.id, loads);
  const primaryLoad = activeLoads[0];
  const location = snapshot.location;

  return (
    <div className="space-y-4">
      <section className="rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-950">
              Live location
            </h2>
            <p className="mt-1 text-[13px] text-slate-500">
              Provider: {(truck.telematicsProvider ?? snapshot.provider).toUpperCase()}
              {snapshot.connected ? " · Connected" : " · Offline"}
            </p>
          </div>
          {primaryLoad ? (
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/loads/${primaryLoad.id}/tracking`}
                className="inline-flex h-9 items-center rounded-full bg-[#2563EB] px-4 text-[13px] font-semibold text-white"
              >
                View Live Location
              </Link>
              <Link
                href={`/loads/${primaryLoad.id}/tracking/replay`}
                className="inline-flex h-9 items-center rounded-full bg-[#F8FAFC] px-4 text-[13px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA]"
              >
                Replay Trip
              </Link>
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]">
            <p className="text-[12px] font-medium text-slate-500">Address</p>
            <p className="mt-1 text-[14px] font-semibold text-slate-900">
              {location?.address ?? truck.location ?? "Unknown"}
            </p>
          </div>
          <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]">
            <p className="text-[12px] font-medium text-slate-500">Coordinates</p>
            <p className="mt-1 text-[14px] font-semibold text-slate-900">
              {location
                ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                : "—"}
            </p>
          </div>
          <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]">
            <p className="text-[12px] font-medium text-slate-500">Speed</p>
            <p className="mt-1 text-[14px] font-semibold text-slate-900">
              {typeof location?.speedMph === "number"
                ? `${location.speedMph} mph`
                : "—"}
            </p>
          </div>
          <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]">
            <p className="text-[12px] font-medium text-slate-500">Last ping</p>
            <p className="mt-1 text-[14px] font-semibold text-slate-900">
              {location?.recordedAt
                ? new Date(location.recordedAt).toLocaleString()
                : "—"}
            </p>
          </div>
        </div>

        {!primaryLoad ? (
          <p className="mt-4 text-[13px] text-slate-500">
            Assign an active load to open live map tracking, trip replay, and route
            history.
          </p>
        ) : null}
      </section>
    </div>
  );
}
