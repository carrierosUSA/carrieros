"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Home,
  LayoutDashboard,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Pin,
  PinOff,
  Route,
  Sparkles,
  Truck,
  WalletCards,
} from "lucide-react";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Brand from "@/components/Brand";
import { getCurrentSession, type CarrierOSRole } from "@/lib/auth/session";
import {
  PRIMARY_NAV,
  getWorkspaceIdFromPathname,
} from "@/lib/navigation/daily-use";

const STORAGE_PINNED = "carrieros-sidebar-pinned";
const STORAGE_COLLAPSED = "carrieros-sidebar-collapsed";

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/" || pathname === "/alph";
  }

  if (href === "/customers") {
    return (
      pathname.startsWith("/customers") ||
      pathname.startsWith("/brokers") ||
      pathname.startsWith("/companies")
    );
  }

  if (href === "/finance") {
    return (
      pathname.startsWith("/finance") ||
      pathname.startsWith("/ifta") ||
      pathname.startsWith("/payroll")
    );
  }

  if (href === "/more") {
    return (
      pathname.startsWith("/more") ||
      pathname.startsWith("/drivers") ||
      pathname.startsWith("/customers") ||
      pathname.startsWith("/brokers") ||
      pathname.startsWith("/companies") ||
      pathname.startsWith("/analytics") ||
      pathname.startsWith("/compliance") ||
      pathname.startsWith("/advanced") ||
      pathname.startsWith("/integrations") ||
      pathname.startsWith("/platform") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/workflows") ||
      pathname.startsWith("/marketplace") ||
      pathname.startsWith("/exchange") ||
      pathname.startsWith("/network") ||
      pathname.startsWith("/wallet") ||
      pathname.startsWith("/workforce") ||
      pathname.startsWith("/alph/copilot") ||
      pathname.startsWith("/settings") ||
      pathname.startsWith("/support") ||
      pathname.startsWith("/setup")
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavIcon({ icon }: { icon: string }) {
  const icons = {
    home: Home,
    dispatch: Route,
    fleet: Truck,
    documents: FileText,
    finance: WalletCards,
    alph: Sparkles,
    more: MoreHorizontal,
    dashboard: LayoutDashboard,
  };
  const Icon = icons[icon as keyof typeof icons] ?? LayoutDashboard;

  return <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.9} />;
}

function readBool(key: string, fallback: boolean): boolean {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return raw === "1" || raw === "true";
  } catch {
    return fallback;
  }
}

function writeBool(key: string, value: boolean) {
  try {
    window.localStorage.setItem(key, value ? "1" : "0");
  } catch {
    // ignore quota / private mode
  }
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const session = getCurrentSession();
  const isClient = useIsClient();
  /** Home reference uses a fixed expanded compact rail with labels. */
  const isHomeDashboard = pathname === "/dashboard";
  const visibleNavItems = PRIMARY_NAV.filter((item) =>
    item.roles.includes(session.role as CarrierOSRole),
  );

  const [pinned, setPinned] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!isClient) return;
    setPinned(readBool(STORAGE_PINNED, false));
    setCollapsed(readBool(STORAGE_COLLAPSED, true));
  }, [isClient]);

  const togglePinned = useCallback(() => {
    setPinned((current) => {
      const next = !current;
      writeBool(STORAGE_PINNED, next);
      if (next) {
        setCollapsed(false);
        writeBool(STORAGE_COLLAPSED, false);
      }
      return next;
    });
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      writeBool(STORAGE_COLLAPSED, next);
      if (!next) {
        setPinned(true);
        writeBool(STORAGE_PINNED, true);
      } else {
        setPinned(false);
        writeBool(STORAGE_PINNED, false);
      }
      return next;
    });
  }, []);

  const expanded = isHomeDashboard || pinned || !collapsed || hovered;
  const showLabels = expanded;

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group/sidebar relative z-30 flex w-full shrink-0 flex-col overflow-hidden border-b border-[#DDE2EA] bg-white py-4 shadow-[0_8px_26px_rgba(15,23,42,0.045)] transition-[width,padding] duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:py-5 ${
        expanded ? "lg:w-[220px] lg:px-3" : "lg:w-[72px] lg:px-2"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-2 px-2 lg:mb-5 lg:px-0">
        <div className={`min-w-0 ${showLabels ? "" : "lg:mx-auto"}`}>
          <Brand showLabels={showLabels} />
        </div>
        {showLabels && !isHomeDashboard ? (
          <div className="hidden items-center gap-1 lg:flex">
            <button
              type="button"
              onClick={togglePinned}
              title={pinned ? "Unpin sidebar" : "Pin sidebar open"}
              aria-label={pinned ? "Unpin sidebar" : "Pin sidebar open"}
              className={`grid h-8 w-8 place-items-center rounded-lg transition ${
                pinned
                  ? "bg-[#EFF6FF] text-[#2563EB]"
                  : "text-[#94A3B8] hover:bg-[#F5F7FA] hover:text-[#475569]"
              }`}
            >
              {pinned ? (
                <Pin className="h-3.5 w-3.5" strokeWidth={2} />
              ) : (
                <PinOff className="h-3.5 w-3.5" strokeWidth={2} />
              )}
            </button>
            <button
              type="button"
              onClick={toggleCollapsed}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
              className="grid h-8 w-8 place-items-center rounded-lg text-[#94A3B8] transition hover:bg-[#F5F7FA] hover:text-[#475569]"
            >
              <PanelLeftClose className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        ) : null}
      </div>

      <nav className="flex min-h-0 flex-1 gap-2 overflow-x-auto px-2 pb-1 lg:block lg:space-y-1 lg:overflow-y-auto lg:overflow-x-hidden lg:px-0 lg:pb-0">
        {visibleNavItems.map((item) => {
          const isActive = isActiveRoute(pathname, item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group/nav relative flex h-10 shrink-0 items-center rounded-xl text-[13px] font-semibold transition duration-200 lg:w-full ${
                showLabels
                  ? "justify-start px-3"
                  : "justify-center px-2"
              } ${
                isActive
                  ? "bg-[#2563EB] text-white shadow-[0_8px_18px_rgba(37,99,235,0.28)]"
                  : "text-[#475569] hover:bg-[#F5F7FA] hover:text-[#111827]"
              }`}
            >
              <span className="grid h-[18px] w-[18px] shrink-0 place-items-center">
                <NavIcon icon={item.icon} />
              </span>
              <span
                className={`whitespace-nowrap transition-all duration-200 ${
                  showLabels
                    ? "ml-2.5 max-w-[160px] opacity-100"
                    : "ml-0 max-w-0 overflow-hidden opacity-0"
                }`}
              >
                {item.name}
              </span>
              {!showLabels ? (
                <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2.5 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#0F172A] px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition duration-150 group-hover/nav:opacity-100 lg:block">
                  {item.name}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 hidden lg:mt-auto lg:block">
        {!showLabels ? (
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={togglePinned}
              title="Pin sidebar open"
              aria-label="Pin sidebar open"
              className="grid h-9 w-9 place-items-center rounded-xl text-[#94A3B8] transition hover:bg-[#F5F7FA] hover:text-[#2563EB]"
            >
              <Pin className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={toggleCollapsed}
              title="Expand sidebar"
              aria-label="Expand sidebar"
              className="grid h-9 w-9 place-items-center rounded-xl text-[#94A3B8] transition hover:bg-[#F5F7FA] hover:text-[#475569]"
            >
              <PanelLeftOpen className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        ) : isHomeDashboard ? (
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-[12px] border border-[#2563EB] bg-white px-3 py-2.5 text-[13px] font-semibold text-[#2563EB] transition hover:bg-[#EFF6FF]"
          >
            <Sparkles className="h-4 w-4" strokeWidth={2} aria-hidden />
            Ask Alph
          </Link>
        ) : (
          <div className="rounded-[14px] bg-[#F8F9FB] p-3 shadow-[inset_0_0_0_1px_#DDE2EA]">
            <p className="text-sm font-semibold text-[#111827]">Ask Alph</p>
            <p className="mt-1 text-xs leading-5 text-[#6B7280]">
              Daily assistant for loads, docs, and cash — you stay in control.
            </p>
            <Link
              href={`/?workspace=${getWorkspaceIdFromPathname(pathname)}`}
              className="mt-3 inline-flex text-[12px] font-semibold text-[#2563EB]"
            >
              Open Alph →
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
