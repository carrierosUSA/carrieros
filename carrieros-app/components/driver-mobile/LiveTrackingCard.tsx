"use client";

import { Navigation, Radio } from "lucide-react";
import { useDriverMobile } from "@/components/driver-mobile/DriverMobileProvider";
import { DmCard, DmSectionLabel, StatusChip } from "@/components/driver-mobile/ui";

export default function LiveTrackingCard() {
  const { location, setSharing } = useDriverMobile();

  return (
    <div>
      <DmSectionLabel>Live tracking</DmSectionLabel>
      <DmCard className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {location.sharing && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-success)] opacity-60" />
              )}
              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                  location.sharing ? "bg-[var(--color-success)]" : "bg-[var(--color-disabled)]"
                }`}
              />
            </span>
            <p className="text-[15px] font-semibold">
              {location.sharing ? "Sharing location" : "Location paused"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSharing(!location.sharing)}
            className="rounded-xl bg-[var(--dm-elevated)] px-3 py-2 text-[13px] font-semibold"
          >
            {location.sharing ? "Pause" : "Resume"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Metric label="Speed" value={`${Math.round(location.speedMph)} mph`} />
          <Metric label="Heading" value={`${Math.round(location.headingDeg)}°`} />
          <Metric label="ETA" value={location.eta} />
        </div>

        <div className="rounded-2xl bg-[var(--dm-elevated)] p-3 text-[13px] text-[var(--dm-muted)]">
          <p className="inline-flex items-center gap-1.5 font-medium text-[var(--dm-fg)]">
            <Radio className="h-3.5 w-3.5" /> GPS
          </p>
          <p className="mt-1 font-mono text-[12px]">
            {location.lat.toFixed(4)}, {location.lng.toFixed(4)} · ±{location.accuracyM}m
          </p>
        </div>

        {location.geofenceEvents[0] && (
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] text-[var(--dm-muted)]">
              <Navigation className="mr-1 inline h-3.5 w-3.5" />
              {location.geofenceEvents[0].type === "entered" ? "Entered" : "Exited"}{" "}
              {location.geofenceEvents[0].label}
            </p>
            <StatusChip
              label={location.geofenceEvents[0].type}
              tone={location.geofenceEvents[0].type === "entered" ? "success" : "info"}
            />
          </div>
        )}
      </DmCard>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[var(--dm-elevated)] p-3 text-center">
      <p className="text-[11px] font-medium text-[var(--dm-muted)]">{label}</p>
      <p className="mt-1 text-[14px] font-bold">{value}</p>
    </div>
  );
}
