"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, Check, X } from "lucide-react";
import PriorityPill from "@/components/notifications/PriorityPill";
import { useNotificationCenter } from "@/components/notifications/NotificationProvider";
import { formatRelativeTime } from "@/lib/notifications/notification-board";
import { ALPH_TIER_LABELS } from "@/lib/types/notifications";
import type { CarrierNotification } from "@/lib/types/notifications";
import { NOTIFICATION_CATEGORY_LABELS } from "@/lib/types/notifications";

type NotificationItemProps = {
  notification: CarrierNotification;
  compact?: boolean;
  onNavigate?: () => void;
};

export default function NotificationItem({
  notification,
  compact,
  onNavigate,
}: NotificationItemProps) {
  const router = useRouter();
  const { runAction, markRead, dismiss, archive } = useNotificationCenter();
  const unread = !notification.readAt;
  const isCritical = notification.priority === "critical";

  return (
    <article
      className={`group relative overflow-hidden rounded-[14px] bg-white transition animate-[carrieros-fade-in_0.3s_ease-out_both] ${
        unread ? "bg-[#F8FBFF]" : ""
      } ${
        isCritical
          ? "border-l-[3px] border-l-[#DC2626] pl-[13px] pr-3 py-3"
          : "px-3 py-3"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
            unread ? "bg-[#2563EB]" : "bg-transparent"
          }`}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[14px] font-semibold text-[#111827]">
              {notification.title}
            </h3>
            <PriorityPill priority={notification.priority} compact />
          </div>
          <p
            className={`mt-1 text-[13px] leading-5 text-[#6B7280] ${
              compact ? "line-clamp-2" : ""
            }`}
          >
            {notification.body}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-medium text-[#94A3B8]">
            <span>{NOTIFICATION_CATEGORY_LABELS[notification.category]}</span>
            <span aria-hidden>·</span>
            <span>{formatRelativeTime(notification.createdAt)}</span>
            {!compact ? (
              <>
                <span aria-hidden>·</span>
                <span className="text-[#2563EB]">
                  {ALPH_TIER_LABELS[notification.alphTier]}
                </span>
              </>
            ) : null}
          </div>
          {notification.entityRefs.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {notification.entityRefs.map((ref) => (
                <span
                  key={`${ref.type}-${ref.id}`}
                  className="rounded-md bg-[#F5F7FA] px-2 py-0.5 text-[12px] font-semibold text-[#475569]"
                >
                  {ref.label}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {notification.actions.map((action) => {
              if (action.kind === "navigate" && action.href) {
                return (
                  <Link
                    key={action.id}
                    href={action.href}
                    onClick={() => {
                      runAction(notification, action);
                      onNavigate?.();
                    }}
                    className={`inline-flex h-8 items-center rounded-full px-3 text-[12px] font-semibold transition ${
                      action.primary
                        ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                        : "bg-[#F5F7FA] text-[#374151] hover:bg-[#EFF6FF]"
                    }`}
                  >
                    {action.label}
                  </Link>
                );
              }

              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => {
                    const href = runAction(notification, action);
                    if (href) {
                      onNavigate?.();
                      router.push(href);
                    }
                  }}
                  className={`inline-flex h-8 items-center rounded-full px-3 text-[12px] font-semibold transition ${
                    action.primary
                      ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                      : "bg-[#F5F7FA] text-[#374151] hover:bg-[#EFF6FF]"
                  }`}
                >
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
          {unread ? (
            <button
              type="button"
              onClick={() => markRead(notification.id)}
              className="grid h-7 w-7 place-items-center rounded-lg text-[#6B7280] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
              aria-label="Mark as read"
              title="Mark as read"
            >
              <Check className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => dismiss(notification.id)}
            className="grid h-7 w-7 place-items-center rounded-lg text-[#6B7280] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
            aria-label="Dismiss"
            title="Dismiss"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => archive(notification.id)}
            className="grid h-7 w-7 place-items-center rounded-lg text-[#6B7280] hover:bg-[#F5F7FA] hover:text-[#111827]"
            aria-label="Archive"
            title="Archive"
          >
            <Archive className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </article>
  );
}
