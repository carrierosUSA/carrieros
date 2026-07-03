"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const fleetLinks = [
  { name: "Dashboard", href: "/fleet" },
  { name: "Trucks", href: "/fleet/trucks" },
  { name: "Trailers", href: "/fleet/trailers" },
  { name: "Maintenance", href: "/fleet/maintenance" },
  { name: "Fuel History", href: "/fleet/fuel" },
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
