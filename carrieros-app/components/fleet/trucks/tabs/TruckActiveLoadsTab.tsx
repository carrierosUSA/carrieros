import Link from "next/link";
import LoadStatusBadge from "@/components/loads/LoadStatusBadge";
import { formatLoadLane } from "@/lib/services/loads/load-helpers";
import type { Load } from "@/lib/types";

type TruckActiveLoadsTabProps = {
  loads: Load[];
};

export default function TruckActiveLoadsTab({ loads }: TruckActiveLoadsTabProps) {
  if (loads.length === 0) {
    return (
      <section className="rounded-[16px] bg-white p-8 text-center ring-1 ring-[#EAEAEA]">
        <p className="text-[15px] font-semibold text-slate-900">No active loads</p>
        <p className="mt-1 text-[14px] text-slate-500">
          Assign this truck from dispatch when it is ready.
        </p>
        <Link
          href="/loads"
          className="mt-4 inline-flex h-9 items-center rounded-full bg-[#2563EB] px-4 text-[13px] font-semibold text-white"
        >
          Open Dispatch
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {loads.map((load) => (
        <Link
          key={load.id}
          href={`/loads/${load.id}`}
          className="block rounded-[16px] bg-white p-4 ring-1 ring-[#EAEAEA] transition hover:ring-[#BFDBFE]"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[14px] font-semibold text-[#2563EB]">{load.reference}</p>
              <p className="mt-1 text-[14px] text-slate-700">{formatLoadLane(load)}</p>
              <p className="mt-1 text-[12px] text-slate-500">
                Pickup {load.pickupDate} · Delivery {load.deliveryDate}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <LoadStatusBadge status={load.status} />
              <span className="inline-flex h-8 items-center rounded-full bg-[#F8FAFC] px-3 text-[12px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA]">
                Live tracking
              </span>
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
}
