"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  Command,
  FileText,
  LayoutDashboard,
  Route,
  Settings,
  ShieldCheck,
  Truck,
  Users,
  WalletCards,
} from "lucide-react";
import Brand from "@/components/Brand";
import { getCurrentSession, type CarrierOSRole } from "@/lib/auth/session";

const navItems = [
  { name: "Command", href: "/", icon: "command", roles: ["owner", "dispatcher", "fleet_manager", "safety"] },
  { name: "Dispatch", href: "/loads", icon: "route", roles: ["owner", "dispatcher"] },
  { name: "Drivers", href: "/drivers", icon: "users", roles: ["owner", "dispatcher", "safety"] },
  { name: "Fleet", href: "/fleet", icon: "truck", roles: ["owner", "dispatcher", "fleet_manager", "mechanic"] },
  { name: "Documents", href: "/documents", icon: "file", roles: ["owner", "dispatcher", "safety"] },
  { name: "Finance", href: "/finance", icon: "wallet", roles: ["owner", "accountant"] },
  { name: "Payroll", href: "/payroll", icon: "wallet", roles: ["owner", "accountant"] },
  { name: "Compliance", href: "/compliance", icon: "shield", roles: ["owner", "safety"] },
  { name: "Marketplace", href: "/marketplace", icon: "market", roles: ["owner", "fleet_manager", "mechanic"] },
  { name: "Reports", href: "/analytics", icon: "chart", roles: ["owner", "accountant", "safety"] },
  { name: "Settings", href: "/settings", icon: "gear", roles: ["owner"] },
];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavIcon({ icon }: { icon: string }) {
  const icons = {
    command: LayoutDashboard,
    route: Route,
    users: Users,
    truck: Truck,
    wallet: WalletCards,
    file: FileText,
    chart: BarChart3,
    gear: Settings,
    shield: ShieldCheck,
    market: Boxes,
  };
  const Icon = icons[icon as keyof typeof icons] ?? Command;

  return <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />;
}

export default function Sidebar() {
  const pathname = usePathname();
  const session = getCurrentSession();
  const visibleNavItems = navItems.filter((item) =>
    item.roles.includes(session.role as CarrierOSRole),
  );

  return (
    <aside className="group/sidebar relative z-30 w-full shrink-0 overflow-hidden border-b border-[#DDE2EA] bg-white px-3 py-4 shadow-[0_8px_26px_rgba(15,23,42,0.045)] lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[88px] lg:flex-col lg:border-b-0 lg:border-r lg:px-3 lg:py-5 lg:transition-[width] lg:duration-300 lg:hover:w-[230px]">
      <div className="mb-5 flex items-center justify-between">
        <Brand />
        <button
          type="button"
          className="hidden rounded-lg border border-[#DDE2EA] px-2 py-1 text-xs font-semibold text-slate-500 opacity-0 transition group-hover/sidebar:opacity-100 hover:border-blue-200 hover:text-slate-900 lg:block"
        >
          ⌘
        </button>
      </div>

      <nav className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1.5 lg:overflow-visible lg:pb-0">
        {visibleNavItems.map((item) => {
          const isActive = isActiveRoute(pathname, item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex shrink-0 items-center gap-2.5 rounded-full px-2.5 py-2 text-[13px] font-medium transition duration-200 ${
                isActive
                  ? "border border-blue-100 bg-blue-50 text-[#2563EB] shadow-sm"
                  : "text-slate-600 hover:bg-[#F5F7FA] hover:text-[#111827]"
              }`}
            >
              <span
                className={`grid h-7 w-7 place-items-center rounded-full transition ${
                  isActive
                    ? "bg-[#2563EB] text-white"
                    : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                }`}
              >
                <NavIcon icon={item.icon} />
              </span>
              <span className="whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden rounded-[14px] border border-[#DDE2EA] bg-[#F5F7FA] p-3 opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100 lg:block">
        <p className="text-sm font-semibold text-slate-950">Nova Command</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          Priorities, exceptions, compliance, payroll, and cash flow.
        </p>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">
          Role: {session.role.replace("_", " ")}
        </p>
      </div>
    </aside>
  );
}
