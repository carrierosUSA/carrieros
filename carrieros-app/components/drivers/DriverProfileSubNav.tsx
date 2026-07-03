"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type DriverProfileSubNavProps = {
  driverId: string;
};

const profileLinks = (driverId: string) => [
  { name: "Profile", href: `/drivers/${driverId}` },
  { name: "Assignment", href: `/drivers/${driverId}/assignment` },
  { name: "License", href: `/drivers/${driverId}/license` },
  { name: "Medical", href: `/drivers/${driverId}/medical` },
  { name: "Payroll", href: `/drivers/${driverId}/payroll` },
  { name: "Performance", href: `/drivers/${driverId}/performance` },
  { name: "Safety", href: `/drivers/${driverId}/safety` },
  { name: "Timeline", href: `/drivers/${driverId}/timeline` },
  { name: "Documents", href: `/drivers/${driverId}/documents` },
  { name: "Time Off", href: `/drivers/${driverId}/time-off` },
];

export default function DriverProfileSubNav({ driverId }: DriverProfileSubNavProps) {
  const pathname = usePathname();
  const links = profileLinks(driverId);

  return (
    <nav className="flex flex-wrap gap-2">
      {links.map((link) => {
        const active = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full border px-3 py-2 text-xs font-medium transition sm:px-4 sm:text-sm ${
              active
                ? "border-blue-500 bg-blue-600 text-white"
                : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800"
            }`}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
