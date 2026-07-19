"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useDriverMobile } from "@/components/driver-mobile/DriverMobileProvider";
import {
  DmCard,
  StatusChip,
  formatMoney,
  formatStatus,
  statusTone,
} from "@/components/driver-mobile/ui";

export default function LoadsList() {
  const { state } = useDriverMobile();
  const active = state.loads.filter((l) =>
    !["delivered", "invoiced", "completed", "rejected", "cancelled"].includes(l.status),
  );
  const past = state.loads.filter((l) =>
    ["delivered", "invoiced", "completed", "rejected", "cancelled"].includes(l.status),
  );

  return (
    <div className="space-y-5 animate-[carrieros-fade-in_0.35s_ease]">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight">Loads</h2>
        <p className="mt-1 text-[14px] text-[var(--dm-muted)]">
          Accept offers and manage stops in one place.
        </p>
      </div>

      {active.length === 0 ? (
        <DmCard>
          <p className="text-[15px] font-medium">No active loads</p>
          <p className="mt-1 text-[13px] text-[var(--dm-muted)]">
            New offers will show up here.
          </p>
        </DmCard>
      ) : (
        <div className="space-y-3">
          {active.map((load) => (
            <Link key={load.id} href={`/driver/trips/${load.id}`}>
              <DmCard className="mb-3 transition active:scale-[0.99]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-medium text-[var(--dm-muted)]">
                      {load.reference} · {load.brokerName}
                    </p>
                    <p className="mt-1 text-[17px] font-semibold leading-snug">
                      {load.originCity}, {load.originState} → {load.destCity}, {load.destState}
                    </p>
                  </div>
                  <StatusChip label={formatStatus(load.status)} tone={statusTone(load.status)} />
                </div>
                <div className="mt-3 flex items-center justify-between text-[14px]">
                  <span className="text-[var(--dm-muted)]">
                    {load.miles} mi · {load.eta}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold">
                    {formatMoney(load.rate)}
                    <ChevronRight className="h-4 w-4 text-[var(--dm-muted)]" />
                  </span>
                </div>
                {load.offered && (
                  <p className="mt-3 rounded-xl bg-orange-500/10 px-3 py-2 text-[13px] font-medium text-[var(--color-warning)]">
                    Offer waiting — tap to accept or reject
                  </p>
                )}
              </DmCard>
            </Link>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <>
          <h3 className="px-1 text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--dm-muted)]">
            Recent
          </h3>
          <div className="space-y-2">
            {past.slice(0, 5).map((load) => (
              <Link
                key={load.id}
                href={`/driver/trips/${load.id}`}
                className="flex items-center justify-between rounded-[18px] bg-[var(--dm-surface)] px-4 py-3.5"
              >
                <div>
                  <p className="text-[15px] font-semibold">{load.reference}</p>
                  <p className="text-[13px] text-[var(--dm-muted)]">
                    {load.originCity} → {load.destCity}
                  </p>
                </div>
                <StatusChip label={formatStatus(load.status)} tone={statusTone(load.status)} />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
