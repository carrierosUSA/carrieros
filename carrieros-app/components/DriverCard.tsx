import Link from "next/link";
import type { Driver } from "@/lib/types";

type DriverCardProps = {
  driver: Driver;
};

export default function DriverCard({ driver }: DriverCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-zinc-100">{driver.name}</h2>
      <p className="mt-1 text-sm text-zinc-400">{driver.role}</p>

      <div className="mt-6 space-y-3 text-sm text-zinc-300">
        <p>Status: {driver.status}</p>
        <p>Truck: {driver.truck}</p>
        <p>Phone: {driver.phone}</p>
        <p>License: {driver.license}</p>
        <p>Medical: {driver.medical}</p>
        <p>Location: {driver.location}</p>
      </div>

      <Link
        href={driver.href}
        className="mt-6 block w-full rounded-xl border border-zinc-700 px-4 py-3 text-center text-sm font-semibold text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-800"
      >
        View Profile
      </Link>
    </div>
  );
}
