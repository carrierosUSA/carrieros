"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  isNavLinkActive,
  type NavLink,
} from "@/lib/navigation/daily-use";

type WorkspaceSubNavProps = {
  links: NavLink[];
  ariaLabel: string;
  /** First N links always visible; remainder go in More on small screens (and optionally desktop). */
  primaryCount?: number;
  /** When true, overflow links stay in More on desktop too. */
  moreOnDesktop?: boolean;
};

function tabClass(active: boolean) {
  return `rounded-full px-3.5 py-2 text-sm font-medium transition ${
    active
      ? "bg-[#2563EB] text-white"
      : "bg-white text-[#6B7280] shadow-[inset_0_0_0_1px_#E5E7EB] hover:text-[#111827] hover:shadow-[inset_0_0_0_1px_#BFDBFE]"
  }`;
}

export default function WorkspaceSubNav({
  links,
  ariaLabel,
  primaryCount,
  moreOnDesktop = false,
}: WorkspaceSubNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? "";
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const splitAt =
    primaryCount != null && primaryCount < links.length
      ? primaryCount
      : links.length;
  const primary = links.slice(0, splitAt);
  const more = links.slice(splitAt);
  const moreActive = more.some((link) =>
    isNavLinkActive(pathname, search, link),
  );

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function renderLink(link: NavLink) {
    const active = isNavLinkActive(pathname, search, link);
    return (
      <Link key={link.href + link.name} href={link.href} className={tabClass(active)}>
        {link.name}
      </Link>
    );
  }

  return (
    <nav
      className="flex flex-wrap items-center gap-2"
      aria-label={ariaLabel}
    >
      {primary.map(renderLink)}

      {more.length > 0 ? (
        <>
          {!moreOnDesktop ? (
            <div className="hidden items-center gap-2 lg:flex">
              {more.map(renderLink)}
            </div>
          ) : null}

          <div
            className={`relative ${moreOnDesktop ? "" : "lg:hidden"}`}
            ref={menuRef}
          >
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
                className="absolute left-0 z-20 mt-2 max-h-[70vh] min-w-[220px] overflow-y-auto rounded-[12px] bg-white p-1 shadow-[0_12px_32px_rgba(15,23,42,0.12)] ring-1 ring-[#EAEAEA]"
              >
                {more.map((link) => (
                  <Link
                    key={link.href + link.name}
                    href={link.href}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className={`block rounded-[8px] px-3 py-2 text-sm font-medium ${
                      isNavLinkActive(pathname, search, link)
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
        </>
      ) : null}
    </nav>
  );
}
