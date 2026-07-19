"use client";

import { CloudOff, RefreshCw } from "lucide-react";
import { useDriverMobile } from "@/components/driver-mobile/DriverMobileProvider";

export default function OfflineBanner({ syncing }: { syncing?: boolean }) {
  const { state, syncQueue, online } = useDriverMobile();
  const count = state.offlineQueue.length;

  return (
    <div
      className={`mb-3 flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-[13px] font-medium ${
        syncing
          ? "bg-blue-500/15 text-[var(--color-info)]"
          : "bg-orange-500/15 text-[var(--color-warning)]"
      }`}
    >
      <span className="inline-flex items-center gap-2">
        {syncing ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <CloudOff className="h-4 w-4" />
        )}
        {syncing
          ? `Syncing ${count} queued action${count === 1 ? "" : "s"}…`
          : `You're offline${count ? ` · ${count} queued` : ""}`}
      </span>
      {online && count > 0 && !syncing && (
        <button
          type="button"
          onClick={() => void syncQueue()}
          className="rounded-lg px-2 py-1 font-semibold underline-offset-2 hover:underline"
        >
          Sync now
        </button>
      )}
    </div>
  );
}
