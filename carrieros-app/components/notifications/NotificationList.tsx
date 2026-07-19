"use client";

import NotificationItem from "@/components/notifications/NotificationItem";
import type { NotificationGroup } from "@/lib/types/notifications";

type NotificationListProps = {
  groups: NotificationGroup[];
  compact?: boolean;
  emptyLabel?: string;
  onNavigate?: () => void;
};

export default function NotificationList({
  groups,
  compact,
  emptyLabel = "No notifications match your filters.",
  onNavigate,
}: NotificationListProps) {
  if (groups.length === 0) {
    return (
      <div className="rounded-[14px] bg-[#F8F9FB] px-4 py-10 text-center">
        <p className="text-sm font-semibold text-[#111827]">All clear</p>
        <p className="mt-1 text-sm text-[#6B7280]">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.key} aria-label={group.label}>
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
              {group.label}
            </h2>
            <span className="text-[12px] font-medium text-[#94A3B8]">
              {group.items.length}
            </span>
          </div>
          <div className="space-y-2">
            {group.items.map((item) => (
              <NotificationItem
                key={item.id}
                notification={item}
                compact={compact}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
