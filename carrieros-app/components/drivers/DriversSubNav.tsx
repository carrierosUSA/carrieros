"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const moduleLinks = [
  { name: "Dashboard", href: "/drivers" },
  { name: "Directory", href: "/drivers/directory" },
  { name: "Hiring", href: "/drivers/hiring/new" },
];

function isActive(pathname: string, href: string) {
  if (href === "/drivers") {
    return pathname === "/drivers";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DriversSubNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {moduleLinks.map((link) => {
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
