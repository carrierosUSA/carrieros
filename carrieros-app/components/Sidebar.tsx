"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Brand from "@/components/Brand";

const navItems = [
  { name: "Command", href: "/", icon: "command" },
  { name: "Dispatch", href: "/loads", icon: "route" },
  { name: "Drivers", href: "/drivers", icon: "users" },
  { name: "Fleet", href: "/fleet", icon: "truck" },
  { name: "Finance", href: "/finance", icon: "wallet" },
  { name: "Documents", href: "/documents", icon: "file" },
  { name: "Analytics", href: "/analytics", icon: "chart" },
  { name: "Settings", href: "/settings", icon: "gear" },
];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavIcon({ icon }: { icon: string }) {
  const common = {
    className: "h-4 w-4",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (icon === "route") {
    return (
      <svg {...common}>
        <path d="M6 18c4-8 8 0 12-8" />
        <path d="M6 18h.01" />
        <path d="M18 10h.01" />
      </svg>
    );
  }

  if (icon === "users") {
    return (
      <svg {...common}>
        <path d="M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4" />
        <path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M19 18c0-1.7-1-3.1-2.4-3.7" />
      </svg>
    );
  }

  if (icon === "truck") {
    return (
      <svg {...common}>
        <path d="M3 7h11v8H3z" />
        <path d="M14 10h4l3 3v2h-7z" />
        <path d="M7 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        <path d="M17 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      </svg>
    );
  }

  if (icon === "wallet") {
    return (
      <svg {...common}>
        <path d="M4 7h16v12H4z" />
        <path d="M16 12h4v4h-4z" />
        <path d="M4 7l3-3h10l3 3" />
      </svg>
    );
  }

  if (icon === "file") {
    return (
      <svg {...common}>
        <path d="M7 3h7l4 4v14H7z" />
        <path d="M14 3v5h5" />
        <path d="M10 13h5" />
        <path d="M10 17h4" />
      </svg>
    );
  }

  if (icon === "chart") {
    return (
      <svg {...common}>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 15l3-4 3 2 5-7" />
      </svg>
    );
  }

  if (icon === "gear") {
    return (
      <svg {...common}>
        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
        <path d="M19 12a7 7 0 0 0-.1-1.1l2-1.5-2-3.4-2.4 1a7.8 7.8 0 0 0-1.9-1.1L14.3 3h-4.6l-.3 2.9A7.8 7.8 0 0 0 7.5 7l-2.4-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.1l-2 1.5 2 3.4 2.4-1c.6.5 1.2.9 1.9 1.1l.3 2.9h4.6l.3-2.9c.7-.3 1.4-.7 1.9-1.1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1.1Z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M5 12a7 7 0 1 0 14 0 7 7 0 0 0-14 0Z" />
      <path d="M9 12h6" />
      <path d="M12 9v6" />
    </svg>
  );
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
                className={`grid h-8 w-8 place-items-center rounded-xl transition ${
                  isActive
                    ? "bg-slate-950 text-white"
                    : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white"
                }`}
              >
                <NavIcon icon={item.icon} />
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
