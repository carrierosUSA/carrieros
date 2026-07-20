"use client";

import { usePathname } from "next/navigation";
import { Building2, Plus, Search } from "lucide-react";
import { useSyncExternalStore } from "react";
import AlphFloatingOrb from "@/components/alph/AlphFloatingOrb";
import CommandPaletteProvider, {
  useCommandPaletteTrigger,
} from "@/components/command-palette/CommandPaletteProvider";
import KeyboardShortcutHints from "@/components/keyboard/KeyboardShortcutHints";
import KeyboardShortcutsProvider from "@/components/keyboard/KeyboardShortcutsProvider";
import NotificationBellButton from "@/components/notifications/NotificationBellButton";
import NotificationCenterFlyout from "@/components/notifications/NotificationCenterFlyout";
import NotificationProvider from "@/components/notifications/NotificationProvider";
import QuickActionsPopup from "@/components/quick-actions/QuickActionsPopup";
import QuickActionsProvider, {
  useQuickActions,
} from "@/components/quick-actions/QuickActionsProvider";
import MaintenanceBanner from "@/components/admin/MaintenanceBanner";
import SupportIssueBanner from "@/components/support/SupportIssueBanner";
import Sidebar from "@/components/Sidebar";
import { getWorkspaceIdFromPathname } from "@/lib/navigation/daily-use";

function useIsMac() {
  return useSyncExternalStore(
    () => () => {},
    () => navigator.platform.toLowerCase().includes("mac"),
    () => true,
  );
}

type AppShellProps = {
  children: React.ReactNode;
};

function AppHeader() {
  const openCommandPalette = useCommandPaletteTrigger();
  const { openQuickActions } = useQuickActions();
  const isMac = useIsMac();
  const shortcutLabel = isMac ? "⌘K" : "Ctrl K";

  return (
    <header className="sticky top-0 z-20 border-b border-[#DDE2EA] bg-[#F5F7FA]/95 px-3 py-4 backdrop-blur sm:px-4 lg:px-6">
      <div className="flex items-center justify-between rounded-[14px] border border-[#DDE2EA] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.045)]">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={() => openCommandPalette?.()}
            className="hidden h-10 min-w-0 max-w-xl flex-1 items-center gap-2.5 rounded-xl border border-[#DDE2EA] bg-[#F5F7FA] px-3.5 text-left text-sm text-[#6B7280] transition duration-150 hover:border-[#BFDBFE] hover:bg-white hover:shadow-[0_4px_14px_rgba(37,99,235,0.08)] md:flex lg:min-w-[22rem]"
          >
            <Search className="h-[17px] w-[17px] shrink-0 text-[#2563EB]" strokeWidth={1.9} />
            <span className="min-w-0 flex-1 truncate">
              Search or ask Alph… Find Truck 105, Show unpaid invoices
            </span>
            <kbd className="shrink-0 rounded-md border border-[#EAEAEA] bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
              {shortcutLabel}
            </kbd>
          </button>
          <button
            type="button"
            onClick={() => openCommandPalette?.()}
            className="grid h-9 w-9 place-items-center rounded-xl border border-[#DDE2EA] bg-[#F5F7FA] text-slate-600 transition hover:border-blue-200 md:hidden"
            aria-label="Search"
          >
            <Search className="h-[17px] w-[17px]" strokeWidth={1.9} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openQuickActions}
            className="rounded-xl border border-[#DDE2EA] bg-[#2563EB] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            <span className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" strokeWidth={2} />
              Quick actions
            </span>
          </button>
          <NotificationBellButton />
          <button
            type="button"
            className="rounded-xl border border-[#DDE2EA] bg-white px-3 py-2 text-sm font-semibold text-[#111827] hover:border-blue-200"
          >
            <span className="inline-flex items-center gap-2">
              <Building2 className="h-4 w-4" strokeWidth={1.9} />
              Company
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const workspaceId = getWorkspaceIdFromPathname(pathname ?? "/");
  const isPublicTracking = pathname.startsWith("/track/");
  const isDriverMobile = pathname === "/driver" || pathname.startsWith("/driver/");
  const isPortal = pathname === "/portal" || pathname.startsWith("/portal/");
  const isIftaAccountant =
    pathname === "/ifta/accountant" || pathname.startsWith("/ifta/accountant/");
  /** Home uses its own greeting + Alph bar — hide duplicate shell chrome/badge. */
  const isHomeDashboard = pathname === "/dashboard";

  if (isPublicTracking || isDriverMobile || isPortal || isIftaAccountant) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <KeyboardShortcutsProvider>
      <QuickActionsProvider>
        <CommandPaletteProvider>
          <NotificationProvider>
            <div
              className={`min-h-screen text-slate-950 ${
                isHomeDashboard ? "bg-white" : "bg-[#F5F7FA]"
              }`}
              data-workspace={workspaceId}
            >
              <div className="flex min-h-screen flex-col lg:flex-row">
                <Sidebar />
                <div className="relative flex min-w-0 flex-1 flex-col">
                  {isHomeDashboard ? null : <MaintenanceBanner />}
                  {isHomeDashboard ? null : <SupportIssueBanner />}
                  {isHomeDashboard ? null : <AppHeader />}
                  <main
                    className={
                      isHomeDashboard
                        ? "min-w-0 flex-1 bg-white px-3 py-3 sm:px-4 lg:px-6 lg:py-4"
                        : "min-w-0 flex-1 px-3 py-4 sm:px-4 lg:px-6 lg:py-6"
                    }
                    data-workspace={workspaceId}
                  >
                    {children}
                  </main>
                  {isHomeDashboard ? null : (
                    <footer className="hidden border-t border-[#EAEAEA] bg-white/80 px-4 py-2 backdrop-blur-sm lg:block lg:px-6">
                      <KeyboardShortcutHints />
                    </footer>
                  )}
                </div>
              </div>
            </div>
            <QuickActionsPopup />
            {isHomeDashboard ? null : <NotificationCenterFlyout />}
            {/* Home already has a single Alph bar — avoid a second floating entry. */}
            {isHomeDashboard ? null : <AlphFloatingOrb />}
          </NotificationProvider>
        </CommandPaletteProvider>
      </QuickActionsProvider>
    </KeyboardShortcutsProvider>
  );
}
