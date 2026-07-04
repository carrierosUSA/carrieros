"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const fleetLinks = [
  { name: "Dashboard", href: "/fleet" },
  { name: "Trucks", href: "/fleet/trucks" },
  { name: "Trailers", href: "/fleet/trailers" },
  { name: "Maintenance", href: "/fleet/maintenance" },
  { name: "Fuel History", href: "/fleet/fuel" },
  { name: "Roadside Assistance", href: "/marketplace" },
  { name: "Marketplace", href: "/marketplace" },
];

function isActive(pathname: string, href: string) {
  if (href === "/fleet") {
    return pathname === "/fleet";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function FleetSubNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {fleetLinks.map((link) => {
        const active = isActive(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              active
                ? "border-[#2563EB] bg-[#2563EB] text-white"
                : "border-[#E5E7EB] bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-slate-950"
            }`}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
