"use client";

import { Settings2 } from "lucide-react";
import AlphDailySummaryPanel from "@/components/notifications/AlphDailySummary";
import NotificationFilters from "@/components/notifications/NotificationFilters";
import NotificationList from "@/components/notifications/NotificationList";
import NotificationPreferencesPanel from "@/components/notifications/NotificationPreferences";
import NotificationSearch from "@/components/notifications/NotificationSearch";
import { useNotificationCenter } from "@/components/notifications/NotificationProvider";
import FadeIn from "@/components/ui/FadeIn";

export default function NotificationsPageClient() {
  const {
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
  } = useNotificationCenter();

  return (
    <FadeIn className="mx-auto max-w-[1100px] space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#94A3B8]">
            Operations
          </p>
          <h1 className="carrieros-page-title mt-1 text-[#111827]">
            Notification Center
          </h1>
          <p className="mt-1 text-[14px] font-medium text-[#6B7280]">
            Every important event — prioritized by Alph, ready for one-click
            action.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={markAllRead}
              className="h-10 rounded-xl bg-[#EFF6FF] px-4 text-[13px] font-semibold text-[#2563EB] transition hover:bg-[#DBEAFE]"
            >
              Mark all read ({unreadCount})
            </button>
          ) : (
            <span className="rounded-full bg-[#ECFDF3] px-3 py-1.5 text-[12px] font-semibold text-[#16A34A]">
              All caught up
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowPreferences(!showPreferences)}
            className={`inline-flex h-10 items-center gap-2 rounded-xl px-3 text-[13px] font-semibold transition ${
              showPreferences
                ? "bg-[#2563EB] text-white"
                : "bg-white text-[#374151] ring-1 ring-[#E8ECF2] hover:bg-[#F5F7FA]"
            }`}
          >
            <Settings2 className="h-4 w-4" strokeWidth={1.9} />
            Preferences
          </button>
        </div>
      </header>

      <AlphDailySummaryPanel summary={alphSummary} />

      {showPreferences ? (
        <NotificationPreferencesPanel
          preferences={preferences}
          onChange={updatePreferences}
        />
      ) : null}

      <section className="rounded-[18px] bg-white p-4 ring-1 ring-[#E8ECF2] sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="sm:max-w-sm sm:flex-1">
            <NotificationSearch value={search} onChange={setSearch} />
          </div>
          <p className="text-[13px] font-medium text-[#6B7280]">
            {board.totalCount} shown
          </p>
        </div>

        <div className="mb-4">
          <NotificationFilters
            value={category}
            onChange={setCategory}
            counts={board.categoryCounts}
          />
        </div>

        <NotificationList groups={board.groups} />
      </section>
    </FadeIn>
  );
}
