"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Brand from "@/components/Brand";

const navItems = [
  { name: "Command", href: "/", icon: "C" },
  { name: "Dispatch", href: "/loads", icon: "D" },
  { name: "Drivers", href: "/drivers", icon: "R" },
  { name: "Fleet", href: "/fleet", icon: "F" },
  { name: "Finance", href: "/finance", icon: "$" },
  { name: "Documents", href: "/documents", icon: "P" },
  { name: "Analytics", href: "/analytics", icon: "A" },
  { name: "Settings", href: "/settings", icon: "S" },
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
    <aside className="border-b border-slate-800 bg-[#0b1120] px-4 py-4 shadow-2xl shadow-slate-950/40 lg:fixed lg:left-0 lg:top-0 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:border-b-0 lg:border-r lg:border-slate-800/80 lg:px-5 lg:py-6">
      <div className="mb-4 lg:mb-9">
        <Brand />
      </div>

      <nav className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1.5 lg:overflow-visible lg:pb-0">
        {navItems.map((item) => {
          const isActive = isActiveRoute(pathname, item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex shrink-0 items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition duration-200 ${
                isActive
                  ? "bg-white text-slate-950 shadow-xl shadow-slate-950/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-slate-950 text-white"
                    : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white"
                }`}
              >
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden rounded-3xl border border-white/10 bg-white/[0.03] p-4 lg:block">
        <p className="text-sm font-semibold text-white">Nova AI</p>
        <p className="mt-1 text-sm leading-6 text-slate-400">Executive command assistant</p>
      </div>
    </aside>
  );
}
