"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const primaryLinks = [
  { name: "Dashboard", href: "/exchange" },
  { name: "Equipment", href: "/exchange/equipment" },
  { name: "Parts", href: "/exchange/parts" },
  { name: "Services", href: "/exchange/services" },
  { name: "AI Shopping", href: "/exchange/ai" },
];

const moreLinks = [
  { name: "Fleet Marketplace", href: "/exchange/fleet" },
  { name: "Freight", href: "/exchange/freight" },
  { name: "Business Services", href: "/exchange/business-services" },
  { name: "Warehouse", href: "/exchange/warehouse" },
  { name: "Rentals", href: "/exchange/rentals" },
  { name: "Auctions", href: "/exchange/auctions" },
  { name: "Businesses for Sale", href: "/exchange/businesses" },
  { name: "Government", href: "/exchange/government" },
  { name: "Enterprise", href: "/exchange/enterprise" },
  { name: "Orders", href: "/exchange/orders" },
  { name: "Financing", href: "/exchange/financing" },
  { name: "Advertising", href: "/exchange/ads" },
  { name: "Seller Hub", href: "/exchange/seller" },
  { name: "Buyer Hub", href: "/exchange/buyer" },
  { name: "Insights", href: "/exchange/insights" },
  { name: "Compare", href: "/exchange/compare" },
];

function isActive(pathname: string, href: string) {
  if (href === "/exchange") return pathname === "/exchange";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function tabClass(active: boolean) {
  return `rounded-full px-4 py-2 text-sm font-medium transition ${
    active
      ? "bg-[#2563EB] text-white"
      : "bg-white text-[#6B7280] shadow-[inset_0_0_0_1px_#E5E7EB] hover:text-[#111827] hover:shadow-[inset_0_0_0_1px_#BFDBFE]"
  }`;
}

export default function ExchangeSubNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const moreActive = moreLinks.some((link) => isActive(pathname, link.href));

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <nav className="flex flex-wrap items-center gap-2" aria-label="Transpo Exchange sections">
      {primaryLinks.map((link) => (
        <Link key={link.href} href={link.href} className={tabClass(isActive(pathname, link.href))}>
          {link.name}
        </Link>
      ))}

      <div className="hidden items-center gap-2 2xl:flex">
        {moreLinks.slice(0, 3).map((link) => (
          <Link key={link.href} href={link.href} className={tabClass(isActive(pathname, link.href))}>
            {link.name}
          </Link>
        ))}
      </div>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen((v) => !v)}
          className={`${tabClass(moreActive)} inline-flex items-center gap-1`}
        >
          More
          <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </button>
        {open ? (
          <div
            role="menu"
            className="absolute left-0 z-20 mt-2 max-h-[70vh] min-w-[240px] overflow-y-auto rounded-[12px] bg-white p-1 shadow-[0_12px_32px_rgba(15,23,42,0.12)] ring-1 ring-[#EAEAEA]"
          >
            {moreLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={`block rounded-[8px] px-3 py-2 text-sm font-medium ${
                  isActive(pathname, link.href)
                    ? "bg-[#EFF6FF] text-[#2563EB]"
                    : "text-[#334155] hover:bg-[#F8F9FB]"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </nav>
  );
}
