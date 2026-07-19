"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SETTINGS_LINKS = [
  { href: "/settings", label: "Overview", match: "exact" as const },
  {
    href: "/settings/permissions",
    label: "Permissions",
    match: "prefix" as const,
  },
];

export default function SettingsSubNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Settings"
      className="flex gap-1 overflow-x-auto rounded-[14px] bg-[#F8FAFC] p-1 ring-1 ring-[#EAEAEA]"
    >
      {SETTINGS_LINKS.map((link) => {
        const active =
          link.match === "exact"
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 rounded-[10px] px-3 py-2 text-[13px] font-semibold transition ${
              active
                ? "bg-white text-[#111827] shadow-sm ring-1 ring-[#EAEAEA]"
                : "text-[#6B7280] hover:text-[#111827]"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
