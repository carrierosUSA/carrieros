import Link from "next/link";
import type { Driver, Truck } from "@/lib/types";

type TruckDriverAssignmentTabProps = {
  truck: Truck;
  driver?: Driver;
};

export default function TruckDriverAssignmentTab({
  truck,
  driver,
}: TruckDriverAssignmentTabProps) {
  if (!driver) {
    return (
      <section className="rounded-[16px] bg-white p-8 text-center ring-1 ring-[#EAEAEA]">
        <p className="text-[15px] font-semibold text-slate-900">No driver assigned</p>
        <p className="mt-1 text-[14px] text-slate-500">
          Assign a driver to put Unit {truck.unitNumber} to work.
        </p>
        <Link
          href={`/fleet/trucks/${truck.id}/edit`}
          className="mt-4 inline-flex h-9 items-center rounded-full bg-[#2563EB] px-4 text-[13px] font-semibold text-white"
        >
          Assign Driver
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {driver.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={driver.photoUrl}
              alt=""
              className="h-14 w-14 rounded-full object-cover ring-2 ring-white"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EFF6FF] text-[16px] font-bold text-[#2563EB]">
              {driver.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </div>
          )}
          <div>
            <h2 className="text-[16px] font-semibold text-slate-950">{driver.name}</h2>
            <p className="mt-0.5 text-[13px] text-slate-500">
              {driver.role} · {driver.phone}
            </p>
            <p className="mt-1 text-[13px] text-slate-500">{driver.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/drivers/${driver.id}`}
            className="inline-flex h-9 items-center rounded-full bg-[#F8FAFC] px-4 text-[13px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA]"
          >
            View Driver
          </Link>
          <Link
            href={`/fleet/trucks/${truck.id}/edit`}
            className="inline-flex h-9 items-center rounded-full bg-[#2563EB] px-4 text-[13px] font-semibold text-white"
          >
            Reassign
          </Link>
        </div>
      </div>
    </section>
  );
}
