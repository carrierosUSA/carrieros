"use client";

import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_LABELS,
  type NotificationFilterCategory,
} from "@/lib/types/notifications";

type NotificationFiltersProps = {
  value: NotificationFilterCategory;
  onChange: (category: NotificationFilterCategory) => void;
  counts?: Record<string, number>;
  compact?: boolean;
};

const FILTERS: NotificationFilterCategory[] = [
  "all",
  ...NOTIFICATION_CATEGORIES,
];

const FILTER_LABELS: Record<NotificationFilterCategory, string> = {
  all: "All",
  ...NOTIFICATION_CATEGORY_LABELS,
};

export default function NotificationFilters({
  value,
  onChange,
  counts,
  compact,
}: NotificationFiltersProps) {
  return (
    <div
      className={`flex gap-1.5 overflow-x-auto pb-1 ${
        compact ? "" : "flex-wrap"
      }`}
      role="tablist"
      aria-label="Notification filters"
    >
      {FILTERS.map((filter) => {
        const active = value === filter;
        const count = counts?.[filter];
        return (
          <button
            key={filter}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(filter)}
            className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold transition ${
              active
                ? "bg-[#2563EB] text-white"
                : "bg-[#F5F7FA] text-[#475569] hover:bg-[#EFF6FF]"
            }`}
          >
            {FILTER_LABELS[filter]}
            {typeof count === "number" ? (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  active ? "bg-white/20 text-white" : "bg-white text-[#6B7280]"
                }`}
              >
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
