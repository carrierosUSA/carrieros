"use client";

import Link from "next/link";
import { useDriverApp } from "@/components/driver-app/DriverAppProvider";
import {
  DmCard,
  DmSectionLabel,
  StatusChip,
} from "@/components/driver-mobile/ui";

export default function EldDashboard() {
  const { state } = useDriverApp();
  const eld = state.connections.find((c) => c.category === "eld");

  if (!eld?.connected) {
    return (
      <div className="space-y-5 animate-[carrieros-fade-in_0.35s_ease]">
        <h2 className="text-[22px] font-bold tracking-tight">ELD</h2>
        <DmCard className="space-y-3">
          <p className="text-[15px] font-semibold">No ELD connected</p>
          <p className="text-[14px] text-[var(--dm-muted)]">
            Connect an ELD provider under Connected Services for hours and duty status.
            Demo architecture — not a live ELD API.
          </p>
          <Link
            href="/driver/services"
            className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-[var(--color-info)] px-4 text-[16px] font-semibold text-white"
          >
            Connect ELD
          </Link>
        </DmCard>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-[carrieros-fade-in_0.35s_ease]">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight">ELD</h2>
        <p className="mt-1 text-[14px] text-[var(--dm-muted)]">
          {eld.provider} · last sync{" "}
          {eld.lastSyncAt ? new Date(eld.lastSyncAt).toLocaleString() : "—"}
        </p>
      </div>

      <DmCard className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-medium text-[var(--dm-muted)]">Duty status</p>
          <StatusChip
            label={state.hos.status === "available" ? "Driving OK" : "HOS attention"}
            tone={
              state.hos.status === "critical"
                ? "critical"
                : state.hos.status === "warning"
                  ? "warning"
                  : "success"
            }
          />
        </div>
        <p className="text-[28px] font-bold tracking-tight">
          {state.hos.driveRemainingHours.toFixed(1)}h drive left
        </p>
      </DmCard>

      <div className="grid grid-cols-1 gap-3">
        <HosRow label="Drive remaining" value={`${state.hos.driveRemainingHours.toFixed(1)} h`} />
        <HosRow label="On-duty remaining" value={`${state.hos.onDutyRemainingHours.toFixed(1)} h`} />
        <HosRow label="Cycle remaining" value={`${state.hos.cycleRemainingHours.toFixed(0)} h`} />
        <HosRow label="Next break" value={state.hos.nextBreakDue ?? "—"} />
      </div>

      <DmSectionLabel>Note</DmSectionLabel>
      <DmCard>
        <p className="text-[14px] text-[var(--dm-muted)]">
          Live ELD certification and AOBRD/ELD vendor APIs are intentional stubs. UI is
          wired for provider sync when credentials are available.
        </p>
      </DmCard>
    </div>
  );
}

function HosRow({ label, value }: { label: string; value: string }) {
  return (
    <DmCard className="flex items-center justify-between">
      <span className="text-[14px] text-[var(--dm-muted)]">{label}</span>
      <span className="text-[16px] font-bold">{value}</span>
    </DmCard>
  );
}
