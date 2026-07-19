"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Building2,
  FileBarChart2,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPinned,
  MessageSquare,
  Receipt,
  Truck,
  X,
} from "lucide-react";
import { usePortal } from "@/components/portal/PortalProvider";
import { PORTAL_ROLE_LABELS } from "@/lib/portal/types";
import type { PortalNavId } from "@/lib/portal/types";
import { useState, type ReactNode } from "react";

const NAV: { id: PortalNavId; href: string; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", href: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "loads", href: "/portal/loads", label: "Loads", icon: Truck },
  { id: "tracking", href: "/portal/tracking", label: "Tracking", icon: MapPinned },
  { id: "documents", href: "/portal/documents", label: "Documents", icon: FileText },
  { id: "invoices", href: "/portal/invoices", label: "Invoices", icon: Receipt },
  { id: "messages", href: "/portal/messages", label: "Messages", icon: MessageSquare },
  { id: "reports", href: "/portal/reports", label: "Reports", icon: FileBarChart2 },
  { id: "profile", href: "/portal/profile", label: "Company", icon: Building2 },
];

function navActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function PortalShell({ children }: { children: ReactNode }) {
  const { session, signOut, notifications, markAllNotificationsRead, markNotificationRead } =
    usePortal();
  const pathname = usePathname();
  const router = useRouter();
  const [showNotifs, setShowNotifs] = useState(false);

  if (!session) return null;

  const unread = notifications.filter((n) => !n.read).length;
  const msgUnread = 0; // threads unread summed in messages page

  return (
    <div className="portal-surface min-h-dvh bg-[#F5F7FA] text-[#111827]">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col lg:flex-row">
        {/* Desktop side nav */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-[#E8ECF2] bg-white lg:flex">
          <div className="border-b border-[#E8ECF2] px-5 py-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
              Transpo.ai Portal
            </p>
            <h1 className="mt-1 truncate text-[18px] font-bold tracking-tight">
              {session.companyName}
            </h1>
            <p className="mt-1 text-sm text-[#6B7280]">
              {session.name} · {PORTAL_ROLE_LABELS[session.role]}
            </p>
          </div>
          <nav className="flex flex-1 flex-col gap-1 p-3">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = navActive(pathname, item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-[#EFF6FF] text-[#1D4ED8]"
                      : "text-[#374151] hover:bg-[#F8F9FB]"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-[#E8ECF2] p-3">
            <button
              type="button"
              onClick={() => {
                signOut();
                router.replace("/portal/login");
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#6B7280] transition hover:bg-[#F8F9FB] hover:text-[#111827]"
            >
              <LogOut className="h-[18px] w-[18px]" strokeWidth={1.9} />
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-[#E8ECF2] bg-white/95 px-4 py-3 backdrop-blur lg:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 lg:hidden">
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
                  Transpo.ai Portal
                </p>
                <p className="truncate text-[16px] font-bold">{session.companyName}</p>
              </div>
              <div className="hidden min-w-0 lg:block">
                <p className="text-sm text-[#6B7280]">
                  {session.companyType === "broker" ? "Broker portal" : "Shipper portal"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowNotifs(true)}
                  className="relative grid h-10 w-10 place-items-center rounded-xl bg-[#F5F7FA] text-[#374151] transition hover:bg-[#EFF6FF]"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" strokeWidth={1.9} />
                  {unread > 0 ? (
                    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
                  ) : null}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    router.replace("/portal/login");
                  }}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-[#F5F7FA] text-[#374151] lg:hidden"
                  aria-label="Sign out"
                >
                  <LogOut className="h-5 w-5" strokeWidth={1.9} />
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-5 pb-[calc(88px+env(safe-area-inset-bottom))] lg:px-6 lg:pb-8">
            <div className="carrieros-fade-in animate-[carrieros-fade-in_0.35s_ease-out]">
              {children}
            </div>
          </main>

          {/* Mobile bottom nav */}
          <nav
            className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E8ECF2] bg-white/95 backdrop-blur lg:hidden"
            style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
          >
            <div className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5 px-1 pt-1">
              {NAV.slice(0, 5).map((item) => {
                const Icon = item.icon;
                const active = navActive(pathname, item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-semibold ${
                      active ? "text-[#2563EB]" : "text-[#6B7280]"
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.9} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
              <Link
                href="/portal/messages"
                className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-semibold ${
                  navActive(pathname, "/portal/messages")
                    ? "text-[#2563EB]"
                    : "text-[#6B7280]"
                }`}
              >
                <MessageSquare className="h-5 w-5" strokeWidth={1.9} />
                <span className="truncate">More</span>
                {msgUnread > 0 ? null : null}
              </Link>
            </div>
            {/* Secondary mobile links */}
            <div className="flex justify-center gap-4 border-t border-[#F3F4F6] px-3 py-1.5 text-[11px] font-semibold text-[#6B7280]">
              <Link href="/portal/messages" className="hover:text-[#2563EB]">
                Messages
              </Link>
              <Link href="/portal/reports" className="hover:text-[#2563EB]">
                Reports
              </Link>
              <Link href="/portal/profile" className="hover:text-[#2563EB]">
                Company
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {showNotifs ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-[2px]">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close notifications"
            onClick={() => setShowNotifs(false)}
          />
          <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E8ECF2] px-5 py-4">
              <div>
                <h2 className="text-lg font-bold">Notifications</h2>
                <p className="text-sm text-[#6B7280]">
                  {unread} unread
                </p>
              </div>
              <div className="flex items-center gap-2">
                {unread > 0 ? (
                  <button
                    type="button"
                    onClick={() => markAllNotificationsRead()}
                    className="rounded-lg px-2 py-1 text-sm font-semibold text-[#2563EB]"
                  >
                    Mark all read
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setShowNotifs(false)}
                  className="grid h-9 w-9 place-items-center rounded-xl bg-[#F5F7FA]"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {notifications.length === 0 ? (
                <p className="px-2 py-8 text-center text-sm text-[#6B7280]">
                  No notifications yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {notifications.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => markNotificationRead(n.id)}
                        className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                          n.read ? "bg-[#F8F9FB]" : "bg-[#EFF6FF]"
                        }`}
                      >
                        <p className="text-sm font-semibold text-[#111827]">
                          {n.title}
                        </p>
                        <p className="mt-0.5 text-sm text-[#6B7280]">{n.body}</p>
                        {n.loadReference ? (
                          <p className="mt-1 text-[12px] font-medium text-[#2563EB]">
                            {n.loadReference}
                          </p>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
