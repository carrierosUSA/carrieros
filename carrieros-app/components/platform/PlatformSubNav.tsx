"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { name: "Home", href: "/platform" },
  { name: "Ecosystem", href: "/platform/ecosystem" },
  { name: "App Store", href: "/platform/apps" },
  { name: "Partners", href: "/platform/partners" },
  { name: "Developers", href: "/platform/developers" },
  { name: "Automation", href: "/platform/automation" },
  { name: "Command", href: "/platform/command" },
  { name: "Migration", href: "/platform/migration" },
  { name: "Translate", href: "/platform/translation" },
  { name: "Security", href: "/platform/security" },
  { name: "Governance", href: "/platform/governance" },
  { name: "Foundation", href: "/platform/foundation" },
  { name: "Trust Charter", href: "/platform/trust-charter" },
  { name: "AI Policy", href: "/platform/ai-policy" },
  { name: "Constitution", href: "/platform/constitution" },
];

function isActive(pathname: string, href: string) {
  if (href === "/platform") return pathname === "/platform";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function PlatformSubNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-wrap items-center gap-2"
      aria-label="Transpo Platform sections"
    >
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              active
                ? "bg-[#2563EB] text-white"
                : "bg-white text-[#6B7280] shadow-[inset_0_0_0_1px_#E5E7EB] hover:text-[#111827] hover:shadow-[inset_0_0_0_1px_#BFDBFE]"
            }`}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
