"use client";

import { useState } from "react";
import { MapPin, Phone, Siren } from "lucide-react";
import { useDriverApp } from "@/components/driver-app/DriverAppProvider";
import { telHref } from "@/lib/driver-mobile/location-share";
import { DmCard, DmPrimaryButton, DmSectionLabel } from "@/components/driver-mobile/ui";

export default function EmergencyView() {
  const { state, location, flash } = useDriverApp();
  const load = state.loads.find((l) => l.id === state.todaysLoadId);
  const [shared, setShared] = useState(false);

  const sharePayload = {
    type: "driver_emergency_share",
    driver: state.driverName,
    phone: state.phone,
    truck: state.truckUnit,
    trailer: load?.trailerUnit ?? "—",
    load: load?.reference ?? "—",
    lat: location.lat,
    lng: location.lng,
    at: new Date().toISOString(),
  };

  return (
    <div className="space-y-5 animate-[carrieros-fade-in_0.35s_ease]">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight text-[var(--color-critical)]">
          Emergency
        </h2>
        <p className="mt-1 text-[14px] text-[var(--dm-muted)]">
          One-tap help. Share live location, unit, and load with dispatch.
        </p>
      </div>

      <a
        href={telHref("911")}
        className="flex min-h-16 items-center justify-center gap-3 rounded-[22px] bg-[var(--color-critical)] text-[18px] font-bold text-white"
      >
        <Siren className="h-6 w-6" /> Call 911
      </a>

      <div className="grid grid-cols-1 gap-3">
        <a
          href={telHref(load?.dispatchPhone ?? "210-555-0100")}
          className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[var(--dm-surface)] text-[16px] font-semibold"
        >
          <Phone className="h-5 w-5 text-[var(--color-info)]" /> Call Dispatcher
        </a>
        <a
          href={telHref("800-555-0199")}
          className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[var(--dm-surface)] text-[16px] font-semibold"
        >
          <Phone className="h-5 w-5" /> Roadside assistance
        </a>
      </div>

      <DmSectionLabel>Share live situation</DmSectionLabel>
      <DmCard className="space-y-3">
        <p className="inline-flex items-center gap-2 text-[14px] text-[var(--dm-muted)]">
          <MapPin className="h-4 w-4" />
          {location.lat.toFixed(4)}, {location.lng.toFixed(4)} · {state.truckUnit}
        </p>
        <pre className="overflow-x-auto rounded-2xl bg-[var(--dm-elevated)] p-3 text-[12px] leading-relaxed text-[var(--dm-muted)]">
          {JSON.stringify(sharePayload, null, 2)}
        </pre>
        <DmPrimaryButton
          tone="danger"
          onClick={async () => {
            try {
              await navigator.clipboard?.writeText(JSON.stringify(sharePayload));
            } catch {
              /* ignore */
            }
            setShared(true);
            flash("Live situation shared with dispatch (demo payload)");
          }}
        >
          Share with dispatch
        </DmPrimaryButton>
        {shared && (
          <p className="text-[13px] font-medium text-[var(--color-success)]">
            Demo payload copied / queued for dispatch.
          </p>
        )}
      </DmCard>
    </div>
  );
}
