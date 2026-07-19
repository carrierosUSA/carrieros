"use client";

import { useState } from "react";
import { useDriverApp } from "@/components/driver-app/DriverAppProvider";
import {
  TRIP_STATUS_EXCEPTIONS,
  TRIP_STATUS_FLOW,
  TRIP_STATUS_LABELS,
} from "@/lib/driver-app/constants";
import type { DriverTripStatus } from "@/lib/driver-app/types";
import { BottomSheet } from "@/components/driver-mobile/ui";

export default function StatusStrip({ compact }: { compact?: boolean }) {
  const { state, setTripStatus } = useDriverApp();
  const [open, setOpen] = useState(false);

  const apply = (id: DriverTripStatus) => {
    setTripStatus(id);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex w-full items-center justify-between gap-3 rounded-[18px] bg-[var(--dm-surface)] px-4 text-left transition active:scale-[0.99] ${
          compact ? "min-h-12 py-2.5" : "min-h-14 py-3"
        }`}
      >
        <span>
          <span className="block text-[12px] font-medium text-[var(--dm-muted)]">
            One-tap status
          </span>
          <span className="block text-[16px] font-semibold tracking-tight">
            {TRIP_STATUS_LABELS[state.tripStatus]}
          </span>
        </span>
        <span className="rounded-full bg-[var(--color-info)]/15 px-3 py-1.5 text-[13px] font-semibold text-[var(--color-info)]">
          Update
        </span>
      </button>

      {open && (
        <BottomSheet title="Update status" onClose={() => setOpen(false)}>
          <div className="space-y-2 pb-2">
            <p className="text-[13px] text-[var(--dm-muted)]">
              Each tap updates your trip and notifies dispatch. Queued when offline.
            </p>
            <div className="grid grid-cols-1 gap-2">
              {TRIP_STATUS_FLOW.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => apply(s.id)}
                  className={`flex min-h-12 items-center rounded-2xl px-4 text-left text-[15px] font-semibold ${
                    state.tripStatus === s.id
                      ? "bg-[var(--color-info)] text-white"
                      : "bg-[var(--dm-elevated)]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p className="pt-2 text-[12px] font-semibold uppercase tracking-wide text-[var(--dm-muted)]">
              Exceptions
            </p>
            <div className="grid grid-cols-2 gap-2">
              {TRIP_STATUS_EXCEPTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => apply(s.id)}
                  className="flex min-h-12 items-center justify-center rounded-2xl bg-orange-500/15 px-3 text-[13px] font-semibold text-[var(--color-warning)]"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </BottomSheet>
      )}
    </>
  );
}
