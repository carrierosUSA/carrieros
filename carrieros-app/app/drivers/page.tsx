import Link from "next/link";

const drivers = [
  {
    name: "Onkar Singh",
    role: "Owner / Driver",
    status: "Active",
    truck: "Truck 102",
    phone: "210-555-0000",
    license: "CDL A",
    medical: "Valid until Dec 2026",
    location: "San Antonio, TX",
    href: "/drivers/onkar-singh",
  },
  {
    name: "Lovepreet Kaur",
    role: "Operations Manager",
    status: "Active",
    truck: "Not assigned",
    phone: "210-555-0000",
    license: "CDL A",
    medical: "Valid until Jan 2027",
    location: "San Antonio, TX",
    href: "/drivers/onkar-singh",
  },
];

export default function DriversPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Driver Management</h1>
          <p className="mt-2 text-zinc-400">
            Manage drivers, licenses, medical cards, assignments, and alerts.
          </p>
        </div>

        <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">
          + Add Driver
        </button>
      </div>

      <div className="mt-8 rounded-2xl border border-blue-900/50 bg-blue-950/40 p-5">
        <p className="text-sm font-semibold text-blue-300">Nova Alert</p>
        <p className="mt-1 text-sm text-blue-400/80">
          All driver documents look good. No urgent expirations found.
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {drivers.map((driver) => (
          <div
            key={driver.name}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm"
          >
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
        ))}
      </div>
    </>
  );
}
