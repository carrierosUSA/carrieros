"use client";

import Link from "next/link";
import { Bell, Settings2, X } from "lucide-react";
import AlphDailySummaryPanel from "@/components/notifications/AlphDailySummary";
import NotificationFilters from "@/components/notifications/NotificationFilters";
import NotificationList from "@/components/notifications/NotificationList";
import NotificationPreferencesPanel from "@/components/notifications/NotificationPreferences";
import NotificationSearch from "@/components/notifications/NotificationSearch";
import { useNotificationCenter } from "@/components/notifications/NotificationProvider";
import { useKeyboardShortcuts } from "@/components/keyboard/KeyboardShortcutsProvider";
import { useEffect } from "react";

export default function NotificationCenterFlyout() {
  const {
    open,
    setOpen,
    unreadCount,
    board,
    category,
    setCategory,
    search,
    setSearch,
    markAllRead,
    showPreferences,
    setShowPreferences,
    preferences,
    updatePreferences,
    alphSummary,
    livePulse,
  } = useNotificationCenter();

  const { setCommandPaletteOpen, registerOverlayClose } = useKeyboardShortcuts();

  useEffect(() => {
    if (!open) return;
    setCommandPaletteOpen(true);
    const unregister = registerOverlayClose(() => setOpen(false));
    return () => {
      unregister();
      setCommandPaletteOpen(false);
    };
  }, [open, registerOverlayClose, setCommandPaletteOpen, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition animate-[carrieros-fade-in_0.2s_ease-out_both]"
        aria-label="Close notifications"
        onClick={() => setOpen(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Notification center"
        className="relative flex h-full w-full max-w-[440px] flex-col bg-white shadow-2xl shadow-slate-400/20 animate-[carrieros-fade-in_0.25s_ease-out_both] sm:my-3 sm:mr-3 sm:h-[calc(100%-24px)] sm:max-w-[420px] sm:rounded-[22px]"
      >
        {/* Dynamic Island–style unread pill */}
        <div className="flex justify-center px-4 pt-3">
          <div
            className={`inline-flex items-center gap-2 rounded-full bg-[#111827] px-3.5 py-1.5 text-white shadow-lg transition ${
              livePulse ? "scale-[1.02]" : "scale-100"
            }`}
          >
            <Bell className="h-3.5 w-3.5" strokeWidth={2} />
            <span className="text-[12px] font-semibold tracking-wide">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "You're caught up"}
            </span>
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                unreadCount > 0 ? "bg-[#60A5FA]" : "bg-[#4ADE80]"
              }`}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[#111827]">
              Notifications
            </h2>
            <p className="text-[13px] font-medium text-[#6B7280]">
              Prioritized by Alph
            </p>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={markAllRead}
                className="rounded-lg px-2 py-1.5 text-[12px] font-semibold text-[#2563EB] hover:bg-[#EFF6FF]"
              >
                Mark all read
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setShowPreferences(!showPreferences)}
              className={`grid h-9 w-9 place-items-center rounded-xl transition ${
                showPreferences
                  ? "bg-[#EFF6FF] text-[#2563EB]"
                  : "bg-[#F5F7FA] text-[#475569] hover:bg-[#EFF6FF]"
              }`}
              aria-label="Notification preferences"
              title="Preferences"
            >
              <Settings2 className="h-4 w-4" strokeWidth={1.9} />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-xl bg-[#F5F7FA] text-[#475569] hover:bg-[#EFF6FF]"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3 border-b border-[#F1F5F9] px-4 pb-3">
          <NotificationSearch value={search} onChange={setSearch} />
          <NotificationFilters
            value={category}
            onChange={setCategory}
            counts={board.categoryCounts}
            compact
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          {showPreferences ? (
            <div className="space-y-3 animate-[carrieros-fade-in_0.25s_ease-out_both]">
              <NotificationPreferencesPanel
                preferences={preferences}
                onChange={updatePreferences}
              />
              <AlphDailySummaryPanel summary={alphSummary} compact />
            </div>
          ) : (
            <div className="space-y-3">
              <AlphDailySummaryPanel summary={alphSummary} compact />
              <NotificationList
                groups={board.groups}
                compact
                onNavigate={() => setOpen(false)}
              />
            </div>
          )}
        </div>

        <div className="border-t border-[#F1F5F9] px-4 py-3">
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="flex h-10 w-full items-center justify-center rounded-xl bg-[#F5F7FA] text-[13px] font-semibold text-[#111827] transition hover:bg-[#EFF6FF] hover:text-[#2563EB]"
          >
            Open full Notification Center
          </Link>
        </div>
      </div>
    </div>
  );
}
