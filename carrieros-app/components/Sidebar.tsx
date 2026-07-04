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

  return <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.9} />;
}

export default function Sidebar() {
  const pathname = usePathname();
  const session = getCurrentSession();
  const visibleNavItems = navItems.filter((item) =>
    item.roles.includes(session.role as CarrierOSRole),
  );

  return (
    <aside className="group/sidebar relative z-30 flex w-full shrink-0 flex-col overflow-hidden border-b border-[#DDE2EA] bg-white py-4 shadow-[0_8px_26px_rgba(15,23,42,0.045)] lg:sticky lg:top-0 lg:h-screen lg:w-[72px] lg:border-b-0 lg:border-r lg:px-2 lg:py-5 lg:transition-[width] lg:duration-300 lg:hover:w-[220px] lg:hover:px-3">
      <div className="mb-5 px-2 lg:mb-6 lg:px-0">
        <Brand />
      </div>

      <nav className="flex min-h-0 flex-1 gap-2 overflow-x-auto px-2 pb-1 lg:block lg:space-y-1 lg:overflow-y-auto lg:overflow-x-hidden lg:px-0 lg:pb-0">
        {visibleNavItems.map((item) => {
          const isActive = isActiveRoute(pathname, item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              title={item.name}
              className={`flex h-10 shrink-0 items-center rounded-xl text-[13px] font-semibold transition duration-200 lg:w-full lg:justify-center lg:group-hover/sidebar:justify-start lg:px-2 lg:group-hover/sidebar:px-3 ${
                isActive
                  ? "bg-[#2563EB] text-white shadow-[0_8px_18px_rgba(37,99,235,0.28)]"
                  : "text-[#475569] hover:bg-[#F5F7FA] hover:text-[#111827]"
              }`}
            >
              <span className="grid h-[18px] w-[18px] shrink-0 place-items-center">
                <NavIcon icon={item.icon} />
              </span>
              <span className="ml-2.5 whitespace-nowrap lg:ml-0 lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:transition-all lg:duration-200 lg:group-hover/sidebar:ml-2.5 lg:group-hover/sidebar:max-w-[160px] lg:group-hover/sidebar:opacity-100">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 hidden px-0 lg:mt-auto lg:block lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:transition-all lg:duration-200 lg:group-hover/sidebar:max-w-none lg:group-hover/sidebar:opacity-100">
        <div className="rounded-[14px] border border-[#DDE2EA] bg-[#F8F9FB] p-3">
          <p className="text-sm font-semibold text-[#111827]">Nova Command</p>
          <p className="mt-1 text-xs leading-5 text-[#6B7280]">
            Priorities, exceptions, compliance, payroll, and cash flow.
          </p>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2563EB]">
            Role: {session.role.replace("_", " ")}
          </p>
        </div>
      </div>
    </aside>
  );
}
