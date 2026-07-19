"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import EmptyState from "@/components/ui/EmptyState";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/wallet/store";
import type { WalletNotification } from "@/lib/wallet/types";
import { Bell } from "lucide-react";

export default function NotificationsClient({
  notifications,
}: {
  notifications: WalletNotification[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          disabled={pending}
          className="transpo-btn-secondary"
          onClick={() => {
            startTransition(() => {
              markAllNotificationsRead();
              router.refresh();
            });
          }}
        >
          Mark all read
        </button>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="Expiration and hiring alerts will show up here."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-[12px] px-4 py-3 ${
                n.read ? "bg-[#F8F9FB]" : TRANSPO_COLORS.info.bg
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-[#111827]">{n.title}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-[#334155]">{n.body}</p>
                  <p className="mt-1 text-[12px] text-[#6B7280]">
                    {new Date(n.createdAt).toLocaleString()} ·{" "}
                    {n.kind.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {n.href ? (
                    <Link href={n.href} className="transpo-btn-secondary">
                      Open
                    </Link>
                  ) : null}
                  {!n.read ? (
                    <button
                      type="button"
                      disabled={pending}
                      className="transpo-btn-primary"
                      onClick={() => {
                        startTransition(() => {
                          markNotificationRead(n.id);
                          router.refresh();
                        });
                      }}
                    >
                      Mark read
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
