"use client";

import { Bell } from "lucide-react";
import { useNotificationCenter } from "@/components/notifications/NotificationProvider";

type NotificationBellButtonProps = {
  className?: string;
};

export default function NotificationBellButton({
  className,
}: NotificationBellButtonProps) {
  const { open, setOpen, unreadCount, livePulse } = useNotificationCenter();

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={
        className ??
        "relative grid h-9 w-9 place-items-center rounded-xl border border-[#DDE2EA] bg-white text-slate-600 transition hover:border-blue-200"
      }
      aria-label={
        unreadCount > 0
          ? `Notifications, ${unreadCount} unread`
          : "Notifications"
      }
      aria-expanded={open}
    >
      <Bell className="h-[18px] w-[18px]" strokeWidth={1.9} />
      {unreadCount > 0 ? (
        <span
          className={`absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#DC2626] px-1 text-[9px] font-bold text-white transition ${
            livePulse ? "scale-110" : "scale-100"
          }`}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </button>
  );
}
