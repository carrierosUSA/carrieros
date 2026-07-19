import Link from "next/link";
import LoadStatusBadge from "@/components/loads/LoadStatusBadge";
import { formatLoadLane } from "@/lib/services/loads/load-helpers";
import type { Load } from "@/lib/types";

type TrailerLoadHistoryTabProps = {
  loads: Load[];
};

export default function TrailerLoadHistoryTab({ loads }: TrailerLoadHistoryTabProps) {
  if (loads.length === 0) {
    return (
      <section className="rounded-[16px] bg-white p-8 text-center ring-1 ring-[#EAEAEA]">
        <p className="text-[15px] font-semibold text-slate-900">No load history</p>
        <p className="mt-1 text-[14px] text-slate-500">
          Loads linked through this trailer&apos;s truck assignment will appear here.
        </p>
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
                {load.pickupDate} → {load.deliveryDate}
              </p>
            </div>
            <LoadStatusBadge status={load.status} />
          </div>
        </Link>
      ))}
    </section>
  );
}
