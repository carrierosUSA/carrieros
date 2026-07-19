"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useDriverApp } from "@/components/driver-app/DriverAppProvider";
import {
  DmCard,
  DmSectionLabel,
  StatusChip,
  formatMoney,
  formatStatus,
  statusTone,
} from "@/components/driver-mobile/ui";

export default function TripsList() {
  const { state } = useDriverApp();
  const active = state.loads.filter(
    (l) => !["completed", "delivered", "rejected", "invoiced"].includes(l.status),
  );
  const past = state.loads.filter((l) =>
    ["completed", "delivered", "rejected", "invoiced"].includes(l.status),
  );

  return (
    <div className="space-y-5 animate-[carrieros-fade-in_0.35s_ease]">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight">Trips</h2>
        <p className="mt-1 text-[14px] text-[var(--dm-muted)]">
          Pickup, delivery, and multi-stop — one tap to navigate or update.
        </p>
      </div>

      <DmSectionLabel>Active</DmSectionLabel>
      <div className="space-y-3">
        {active.length === 0 && (
          <DmCard>
            <p className="text-[15px] font-semibold">No active trips</p>
            <p className="mt-1 text-[14px] text-[var(--dm-muted)]">
              You&apos;re available. Dispatch will send the next offer here.
            </p>
          </DmCard>
        )}
        {active.map((load) => (
          <TripRow key={load.id} load={load} />
        ))}
      </div>

      {past.length > 0 && (
        <>
          <DmSectionLabel>Recent</DmSectionLabel>
          <div className="space-y-3">
            {past.map((load) => (
              <TripRow key={load.id} load={load} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TripRow({
  load,
}: {
  load: {
    id: string;
    reference: string;
    status: string;
    originCity: string;
    originState: string;
    destCity: string;
    destState: string;
    miles: number;
    rate: number;
    eta: string;
    offered?: boolean;
  };
}) {
  return (
    <Link
      href={`/driver/trips/${load.id}`}
      className="flex items-center gap-3 rounded-[20px] bg-[var(--dm-surface)] px-4 py-4 transition active:scale-[0.99]"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-medium text-[var(--dm-muted)]">{load.reference}</p>
          <StatusChip
            label={load.offered ? "Offer" : formatStatus(load.status)}
            tone={load.offered ? "warning" : statusTone(load.status)}
          />
        </div>
        <p className="mt-1 text-[16px] font-semibold tracking-tight">
          {load.originCity}, {load.originState}
          <span className="mx-1.5 text-[var(--dm-muted)]">→</span>
          {load.destCity}, {load.destState}
        </p>
        <p className="mt-1 text-[13px] text-[var(--dm-muted)]">
          {load.miles} mi · {formatMoney(load.rate)} · ETA {load.eta}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-[var(--dm-muted)]" />
    </Link>
  );
}
