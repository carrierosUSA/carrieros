import Link from "next/link";
import LoadStatusBadge from "@/components/loads/LoadStatusBadge";
import { formatLoadLane } from "@/lib/services/loads/load-helpers";
import type { Load } from "@/lib/types";

type DriverAssignedLoadsTabProps = {
  loads: Load[];
};

export default function DriverAssignedLoadsTab({ loads }: DriverAssignedLoadsTabProps) {
  if (loads.length === 0) {
    return (
      <section className="rounded-[16px] bg-white p-8 text-center ring-1 ring-[#E5E7EB]">
        <p className="text-[15px] font-semibold text-slate-900">No assigned loads</p>
        <p className="mt-1 text-[14px] text-slate-500">
          Assign this driver from dispatch when they are available.
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
          className="block rounded-[16px] bg-white p-4 ring-1 ring-[#E5E7EB] transition hover:ring-[#BFDBFE]"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[14px] font-semibold text-[#2563EB]">{load.reference}</p>
              <p className="mt-1 text-[14px] text-slate-700">{formatLoadLane(load)}</p>
              <p className="mt-1 text-[12px] text-slate-500">
                Pickup {load.pickupDate} · Delivery {load.deliveryDate}
              </p>
            </div>
            <LoadStatusBadge status={load.status} />
          </div>
        </Link>
      ))}
    </section>
  );
}
