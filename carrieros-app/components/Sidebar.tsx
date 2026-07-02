"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Brand from "@/components/Brand";

const navItems = [
  { name: "Command Center", href: "/" },
  { name: "Drivers", href: "/drivers" },
  { name: "Fleet", href: "/fleet" },
  { name: "Finance", href: "/finance" },
  { name: "Documents", href: "/documents" },
  { name: "Analytics", href: "/analytics" },
  { name: "Settings", href: "/settings" },
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
    <aside className="fixed left-0 top-0 flex h-screen w-72 flex-col border-r border-zinc-800 bg-zinc-950 px-5 py-6">
      <div className="mb-10">
        <Brand />
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = isActiveRoute(pathname, item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
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

      <div className="mt-auto rounded-2xl border border-blue-900/50 bg-blue-950/40 p-4">
        <p className="text-sm font-semibold text-blue-300">AI Partner</p>
        <p className="mt-1 text-sm text-blue-400/80">Ready to help.</p>
      </div>
    </aside>
  );
}
