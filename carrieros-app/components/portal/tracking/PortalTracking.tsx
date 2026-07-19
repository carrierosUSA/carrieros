"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Cloud, Navigation, Play, Route } from "lucide-react";
import { usePortal } from "@/components/portal/PortalProvider";
import PermissionButton from "@/components/portal/PermissionButton";
import {
  PortalBadge,
  PortalCard,
  PortalEmpty,
  PortalSectionTitle,
} from "@/components/portal/ui";
import { getPortalLoadsForSession } from "@/lib/portal/data";
import { LOAD_STATUS_LABELS } from "@/lib/types/load";
import type { LiveTrackingPanelInput } from "@/components/tracking/map/LiveTrackingPanel";

const LiveTrackingPanel = dynamic(
  () => import("@/components/tracking/map/LiveTrackingPanel"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[360px] animate-[carrieros-shimmer_1.4s_ease_infinite] rounded-2xl bg-[linear-gradient(90deg,#e8ecf2_0%,#f8f9fb_50%,#e8ecf2_100%)] bg-[length:200%_100%]" />
    ),
  },
);

export default function PortalTracking() {
  const { session } = usePortal();
  const loads = useMemo(
    () => (session ? getPortalLoadsForSession(session) : []),
    [session],
  );

  const trackable = loads.filter(
    (l) =>
      l.trackingEnabled &&
      l.trackingToken &&
      ["dispatched", "picked_up", "in_transit", "delivered"].includes(l.status),
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected =
    trackable.find((l) => l.id === selectedId) ?? trackable[0] ?? null;

  if (!session) return null;

  const panelInput: LiveTrackingPanelInput | null = selected
    ? {
        loadId: selected.id,
        loadReference: selected.reference,
        originCity: selected.origin.city,
        originState: selected.origin.state,
        destinationCity: selected.destination.city,
        destinationState: selected.destination.state,
        totalMiles: selected.miles,
        milesRemaining: Math.round(selected.miles * 0.35),
        eta: selected.destination.scheduledAt ?? `${selected.deliveryDate}T18:00:00Z`,
        isLive: ["picked_up", "in_transit", "dispatched"].includes(selected.status),
        loadStatus: selected.status,
        currentLocationLabel: `${selected.origin.city} corridor`,
        lastUpdatedLabel: "Updated just now",
        fullscreenHref: selected.trackingToken
          ? `/track/${selected.trackingToken}`
          : `/loads/${selected.id}/tracking`,
        replayHref: `/loads/${selected.id}/tracking/replay`,
      }
    : null;

  return (
    <div className="space-y-6">
      <PortalSectionTitle
        title="Tracking"
        subtitle="Live truck location, ETA, traffic, and weather for your shipments."
      />

      {trackable.length === 0 ? (
        <PortalEmpty
          title="No live shipments"
          body="When a load is dispatched with tracking enabled, it will appear here."
        />
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {trackable.map((load) => (
              <button
                key={load.id}
                type="button"
                onClick={() => setSelectedId(load.id)}
                className={`shrink-0 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                  selected?.id === load.id
                    ? "bg-[#2563EB] text-white"
                    : "bg-white text-[#374151] shadow-sm"
                }`}
              >
                {load.reference}
              </button>
            ))}
          </div>

          {selected && panelInput ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <InfoChip
                  icon={<Navigation className="h-4 w-4" />}
                  label="Status"
                  value={LOAD_STATUS_LABELS[selected.status]}
                />
                <InfoChip
                  icon={<Route className="h-4 w-4" />}
                  label="Traffic"
                  value="Moderate · I-10"
                />
                <InfoChip
                  icon={<Cloud className="h-4 w-4" />}
                  label="Weather"
                  value="Clear · 84°F"
                />
                <InfoChip
                  icon={<Play className="h-4 w-4" />}
                  label="ETA"
                  value={new Date(panelInput.eta).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                />
              </div>

              <PortalCard className="overflow-hidden p-0">
                <div className="border-b border-[#F3F4F6] px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[#111827]">
                        {selected.reference}
                      </p>
                      <p className="text-sm text-[#6B7280]">
                        {selected.origin.city}, {selected.origin.state} →{" "}
                        {selected.destination.city}, {selected.destination.state}
                      </p>
                    </div>
                    <PortalBadge tone={panelInput.isLive ? "green" : "gray"}>
                      {panelInput.isLive ? "Live" : "Last known"}
                    </PortalBadge>
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <LiveTrackingPanel {...panelInput} variant="compact" />
                </div>
              </PortalCard>

              <div className="flex flex-wrap gap-2">
                {selected.trackingToken ? (
                  <Link
                    href={`/track/${selected.trackingToken}`}
                    className="rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
                  >
                    Open public tracking
                  </Link>
                ) : null}
                <PermissionButton
                  role={session.role}
                  permission="replay_trip"
                  onClick={() => {
                    window.location.href = `/loads/${selected.id}/tracking/replay`;
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] shadow-sm"
                >
                  <Play className="h-4 w-4" />
                  Replay Trip (Premium)
                </PermissionButton>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function InfoChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-2 text-[#6B7280]">
        {icon}
        <span className="carrieros-label">{label}</span>
      </div>
      <p className="mt-2 text-base font-semibold text-[#111827]">{value}</p>
    </div>
  );
}
