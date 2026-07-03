import Link from "next/link";
import type { Driver } from "@/lib/types";
import DriverStatusBadge from "@/components/drivers/DriverStatusBadge";
import { formatPayRate, getTruckLabel } from "@/lib/services/drivers/driver-helpers";

type DriverCardProps = {
  driver: Driver;
};

export default function DriverCard({ driver }: DriverCardProps) {
  const truckLabel = getTruckLabel(driver.truckId);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">{driver.name}</h2>
          <p className="mt-1 text-sm text-zinc-400">{driver.role}</p>
        </div>
        <DriverStatusBadge status={driver.status} />
      </div>

      <div className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
        <p>
          <span className="text-zinc-500">Phone:</span> {driver.phone}
        </p>
        <p>
          <span className="text-zinc-500">Location:</span> {driver.location}
        </p>
        <p>
          <span className="text-zinc-500">Truck:</span> {truckLabel ?? "Unassigned"}
        </p>
        <p>
          <span className="text-zinc-500">Pay:</span> {formatPayRate(driver)}
        </p>
        <p>
          <span className="text-zinc-500">License:</span> {driver.licenseClass}
        </p>
        <p>
          <span className="text-zinc-500">Medical:</span> {driver.medicalExpiresAt}
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          href={`/drivers/${driver.id}`}
          className="block rounded-xl border border-zinc-700 px-4 py-3 text-center text-sm font-semibold text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-800"
        >
          View Profile
        </Link>
        <Link
          href={`/drivers/${driver.id}/edit`}
          className="block rounded-xl border border-zinc-700 px-4 py-3 text-center text-sm font-semibold text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-800"
        >
          Edit Driver
        </Link>
      </div>
    </div>
  );
}
