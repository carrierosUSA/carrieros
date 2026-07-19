"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  FileText,
  Home,
  MessageCircle,
  MoreHorizontal,
  Moon,
  Route,
  Sun,
  Wallet,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useDriverApp } from "@/components/driver-app/DriverAppProvider";
import OfflineBanner from "@/components/driver-mobile/OfflineBanner";
import NotificationsPanel from "@/components/driver-mobile/NotificationsPanel";
import AlphAssistant from "@/components/driver-mobile/AlphAssistant";
import { BOTTOM_NAV, DRIVER_BRAND } from "@/lib/driver-app/constants";

const NAV_ICONS = {
  "/driver": Home,
  "/driver/trips": Route,
  "/driver/documents": FileText,
  "/driver/messages": MessageCircle,
  "/driver/wallet": Wallet,
  "/driver/more": MoreHorizontal,
} as const;

export default function DriverAppShell({ children }: { children: ReactNode }) {
  const { state, darkMode, setDarkMode, online, toast } = useDriverApp();
  const pathname = usePathname();
  const [showNotifs, setShowNotifs] = useState(false);
  const unread = state.alerts.filter((a) => !a.read).length;
  const msgUnread = state.threads.reduce((n, t) => n + t.unread, 0);

  const hideAlphFab =
    pathname.startsWith("/driver/alph") || pathname.startsWith("/driver/emergency");

  return (
    <div
      className={`driver-mobile min-h-dvh ${darkMode ? "driver-mobile-dark dark" : ""}`}
      data-theme={darkMode ? "dark" : "light"}
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-[var(--dm-bg)] text-[var(--dm-fg)]">
        <header
          className="sticky top-0 z-30 border-b border-[var(--dm-border)] bg-[var(--dm-bg)]/95 px-4 backdrop-blur-xl"
          style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
        >
          <div className="flex items-center justify-between gap-3 pb-3">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold tracking-wide text-[var(--color-info)]">
                {DRIVER_BRAND}
              </p>
              <h1 className="truncate text-[20px] font-bold tracking-tight">
                {state.driverName.split(" ")[0]}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--dm-surface)]"
                aria-label={darkMode ? "Light mode" : "Dark mode"}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                type="button"
                onClick={() => setShowNotifs(true)}
                className="relative grid h-11 w-11 place-items-center rounded-2xl bg-[var(--dm-surface)]"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[var(--color-critical)]" />
                )}
              </button>
            </div>
          </div>
          {!online && <OfflineBanner />}
          {online && state.offlineQueue.length > 0 && <OfflineBanner syncing />}
        </header>

        <main className="flex-1 overflow-y-auto px-4 pb-[calc(92px+env(safe-area-inset-bottom))] pt-4">
          {children}
        </main>

        {toast && (
          <div className="pointer-events-none fixed bottom-[calc(100px+env(safe-area-inset-bottom))] left-1/2 z-50 w-[min(92%,28rem)] -translate-x-1/2 rounded-full bg-[var(--dm-fg)] px-4 py-3 text-center text-[14px] font-semibold text-[var(--dm-bg)] shadow-lg animate-[carrieros-fade-in_0.25s_ease]">
            {toast}
          </div>
        )}

        <nav
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--dm-border)] bg-[var(--dm-surface)]/95 backdrop-blur-xl"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="mx-auto flex max-w-lg items-stretch justify-between px-0.5 pt-1">
            {BOTTOM_NAV.map((item) => {
              const Icon = NAV_ICONS[item.href as keyof typeof NAV_ICONS] ?? Home;
              const active = item.match(pathname);
              const badge = item.href === "/driver/messages" ? msgUnread : 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-2 text-[10px] font-semibold transition ${
                    active ? "text-[var(--color-info)]" : "text-[var(--dm-muted)]"
                  }`}
                >
                  <span className="relative">
                    <Icon className="h-5 w-5" strokeWidth={active ? 2.3 : 1.8} />
                    {badge > 0 && (
                      <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--color-critical)] px-0.5 text-[9px] font-bold text-white">
                        {badge}
                      </span>
                    )}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {showNotifs && <NotificationsPanel onClose={() => setShowNotifs(false)} />}
        {!hideAlphFab && <AlphAssistant />}
      </div>
    </div>
  );
}
