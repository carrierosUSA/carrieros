"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  FileText,
  Home,
  MessageCircle,
  Moon,
  Sun,
  Truck,
  User,
} from "lucide-react";
import { useDriverMobile } from "@/components/driver-mobile/DriverMobileProvider";
import OfflineBanner from "@/components/driver-mobile/OfflineBanner";
import NotificationsPanel from "@/components/driver-mobile/NotificationsPanel";
import AlphAssistant from "@/components/driver-mobile/AlphAssistant";
import type { DriverMobileTab } from "@/lib/driver-mobile/types";
import { useState, type ReactNode } from "react";

const TABS: { id: DriverMobileTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "loads", label: "Loads", icon: Truck },
  { id: "documents", label: "Docs", icon: FileText },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "profile", label: "Profile", icon: User },
];

export function useDriverTab(): DriverMobileTab {
  const params = useSearchParams();
  const tab = params.get("tab") as DriverMobileTab | null;
  if (tab && TABS.some((t) => t.id === tab)) return tab;
  return "home";
}

export default function DriverMobileShell({ children }: { children: ReactNode }) {
  const { state, darkMode, setDarkMode, online } = useDriverMobile();
  const tab = useDriverTab();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showNotifs, setShowNotifs] = useState(false);
  const unread = state.alerts.filter((a) => !a.read).length;
  const msgUnread = state.threads.reduce((n, t) => n + t.unread, 0);

  const setTab = (next: DriverMobileTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    params.delete("view");
    router.push(`/driver?${params.toString()}`);
  };

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
              <p className="text-[13px] font-medium text-[var(--dm-muted)]">Transpo.ai Driver</p>
              <h1 className="truncate text-[20px] font-bold tracking-tight">
                {state.driverName.split(" ")[0]}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--dm-surface)] text-[var(--dm-fg)]"
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

        <main className="flex-1 overflow-y-auto px-4 pb-[calc(88px+env(safe-area-inset-bottom))] pt-4">
          {children}
        </main>

        <nav
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--dm-border)] bg-[var(--dm-surface)]/95 backdrop-blur-xl"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="mx-auto flex max-w-lg items-stretch justify-between px-1 pt-1">
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = tab === id && !pathname.includes("/loads/");
              const badge = id === "messages" ? msgUnread : 0;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    if (pathname.includes("/loads/")) {
                      router.push(`/driver?tab=${id}`);
                    } else {
                      setTab(id);
                    }
                  }}
                  className={`flex min-h-[56px] min-w-[64px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-[11px] font-medium transition ${
                    active
                      ? "text-[var(--color-info)]"
                      : "text-[var(--dm-muted)]"
                  }`}
                >
                  <span className="relative">
                    <Icon className="h-6 w-6" strokeWidth={active ? 2.2 : 1.8} />
                    {badge > 0 && (
                      <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--color-critical)] px-0.5 text-[9px] font-bold text-white">
                        {badge}
                      </span>
                    )}
                  </span>
                  {label}
                </button>
              );
            })}
          </div>
        </nav>

        {showNotifs && <NotificationsPanel onClose={() => setShowNotifs(false)} />}
        <AlphAssistant />
      </div>
    </div>
  );
}
