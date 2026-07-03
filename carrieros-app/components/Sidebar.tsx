"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Brand from "@/components/Brand";

const navItems = [
  { name: "Command Center", href: "/" },
  { name: "Dispatch", href: "/loads" },
  { name: "Drivers", href: "/drivers" },
  { name: "Fleet", href: "/fleet" },
  { name: "Finance Alpha", href: "/finance" },
  { name: "Documents", href: "/documents" },
  { name: "Analytics Soon", href: "/analytics" },
  { name: "Settings Soon", href: "/settings" },
];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-zinc-800 bg-zinc-950 px-4 py-4 lg:fixed lg:left-0 lg:top-0 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
      <div className="mb-4 lg:mb-10">
        <Brand />
      </div>

      <nav className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
        {navItems.map((item) => {
          const isActive = isActiveRoute(pathname, item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`block shrink-0 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden rounded-2xl border border-blue-900/50 bg-blue-950/40 p-4 lg:block">
        <p className="text-sm font-semibold text-blue-300">AI Partner</p>
        <p className="mt-1 text-sm text-blue-400/80">Ready to help.</p>
      </div>
    </aside>
  );
}
