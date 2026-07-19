"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import InteractiveTrackingMap from "@/components/tracking/map/InteractiveTrackingMap";
import RouteHistoryDrawer from "@/components/tracking/map/RouteHistoryDrawer";
import TrackingMapControls from "@/components/tracking/map/TrackingMapControls";
import TrackingMapStats from "@/components/tracking/map/TrackingMapStats";
import { useLiveTrackingMotion } from "@/hooks/useLiveTrackingMotion";
import { buildLiveTrackingSnapshot } from "@/lib/tracking/build-map-snapshot";
import {
  DEFAULT_MAP_VIEW_STATE,
  type LiveTrackingSnapshot,
  type MapViewState,
  type TrackingDriverDetails,
  type TrackingStopDetails,
} from "@/lib/tracking/map-types";
import { buildRouteHistory } from "@/lib/tracking/route-history";
import type { DriverLocation } from "@/lib/types";

export type LiveTrackingPanelInput = {
  loadId: string;
  loadReference: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  totalMiles: number;
  milesRemaining?: number;
  eta: string;
  isLive: boolean;
  loadStatus?: string;
  currentLocationLabel?: string;
  lastUpdatedLabel?: string;
  driverLocation?: DriverLocation | null;
  driver?: TrackingDriverDetails;
  pickupDetails?: Partial<TrackingStopDetails>;
  deliveryDetails?: Partial<TrackingStopDetails>;
  fullscreenHref: string;
  replayHref?: string;
};

type LiveTrackingPanelProps = LiveTrackingPanelInput & {
  variant?: "compact" | "fullscreen";
  showRouteHistoryButton?: boolean;
  onOpenRouteHistory?: () => void;
  routeHistoryOpen?: boolean;
  onCloseRouteHistory?: () => void;
};

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#BBF7D0] bg-[#ECFDF3] px-2.5 py-1 text-[11px] font-semibold text-[#166534]">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16A34A] opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#16A34A]" />
      </span>
      LIVE
    </span>
  );
}

function PremiumActionButton({
  label,
  emoji,
  href,
  onClick,
}: {
  label: string;
  emoji: string;
  href?: string;
  onClick?: () => void;
}) {
  const className =
    "inline-flex h-9 items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-3.5 text-[12px] font-semibold text-slate-800 shadow-sm transition hover:border-[#2563EB] hover:bg-[#F8FBFF] hover:text-[#1D4ED8]";

  if (href) {
    return (
      <Link href={href} className={className}>
        <span aria-hidden>{emoji}</span>
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      <span aria-hidden>{emoji}</span>
      {label}
    </button>
  );
}

export default function LiveTrackingPanel({
  variant = "compact",
  fullscreenHref,
  replayHref,
  showRouteHistoryButton = true,
  onOpenRouteHistory,
  routeHistoryOpen = false,
  onCloseRouteHistory,
  ...input
}: LiveTrackingPanelProps) {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<LiveTrackingSnapshot | null>(null);
  const [viewState, setViewState] = useState<MapViewState>(DEFAULT_MAP_VIEW_STATE);
  const [localHistoryOpen, setLocalHistoryOpen] = useState(false);
  const isFullscreen = variant === "fullscreen";
  const historyOpen = routeHistoryOpen || localHistoryOpen;

  useEffect(() => {
    let cancelled = false;

    buildLiveTrackingSnapshot({
      loadId: input.loadId,
      loadReference: input.loadReference,
      originCity: input.originCity,
      originState: input.originState,
      destinationCity: input.destinationCity,
      destinationState: input.destinationState,
      totalMiles: input.totalMiles,
      milesRemaining: input.milesRemaining,
      eta: input.eta,
      isLive: input.isLive,
      currentLocationLabel: input.currentLocationLabel,
      lastUpdatedLabel: input.lastUpdatedLabel,
      driverLocation: input.driverLocation,
      driver: input.driver,
      pickupDetails: input.pickupDetails,
      deliveryDetails: input.deliveryDetails,
    }).then((nextSnapshot) => {
      if (!cancelled) {
        setSnapshot(nextSnapshot);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    input.loadId,
    input.loadReference,
    input.originCity,
    input.originState,
    input.destinationCity,
    input.destinationState,
    input.totalMiles,
    input.milesRemaining,
    input.eta,
    input.isLive,
    input.currentLocationLabel,
    input.lastUpdatedLabel,
    input.driverLocation,
    input.driver,
    input.pickupDetails,
    input.deliveryDetails,
  ]);

  const placeholderSnapshot: LiveTrackingSnapshot = {
    loadId: input.loadId,
    loadReference: input.loadReference,
    isLive: false,
    pickup: { id: "pickup", position: { lat: 0, lng: 0 }, label: "" },
    delivery: { id: "delivery", position: { lat: 0, lng: 0 }, label: "" },
    truck: { id: "truck", position: { lat: 0, lng: 0 }, label: "" },
    route: { coordinates: [], distanceMiles: 0, durationMinutes: 0 },
    stats: {
      currentLocation: "Loading map...",
      speedMph: 0,
      milesRemaining: 0,
      eta: input.eta,
      lastUpdated: "—",
    },
    pickupDetails: { city: input.originCity, state: input.originState },
    deliveryDetails: {
      city: input.destinationCity,
      state: input.destinationState,
    },
  };

  const liveSnapshot = useLiveTrackingMotion({
    snapshot: snapshot ?? placeholderSnapshot,
    enabled: Boolean(snapshot?.isLive),
  });

  const routeHistory = useMemo(
    () =>
      buildRouteHistory({
        loadId: input.loadId,
        loadReference: input.loadReference,
        originLabel: `${input.originCity}, ${input.originState}`,
        destinationLabel: `${input.destinationCity}, ${input.destinationState}`,
        driverName: input.driver?.name,
        driverLocation: input.currentLocationLabel,
        loadStatus: input.loadStatus,
      }),
    [
      input.loadId,
      input.loadReference,
      input.originCity,
      input.originState,
      input.destinationCity,
      input.destinationState,
      input.driver?.name,
      input.currentLocationLabel,
      input.loadStatus,
    ],
  );

  function toggleLayer(layer: keyof MapViewState["layers"]) {
    setViewState((current) => ({
      ...current,
      layers: {
        ...current.layers,
        [layer]: !current.layers[layer],
      },
    }));
  }

  function openRouteHistory() {
    if (onOpenRouteHistory) {
      onOpenRouteHistory();
      return;
    }

    setLocalHistoryOpen(true);
  }

  function closeRouteHistory() {
    if (onCloseRouteHistory) {
      onCloseRouteHistory();
      return;
    }

    setLocalHistoryOpen(false);
  }

  function openFullMap() {
    router.push(fullscreenHref);
  }

  return (
    <>
      <div
        className={`overflow-hidden rounded-[16px] border border-[#EAEAEA] bg-white shadow-sm ${
          isFullscreen ? "min-h-[calc(100dvh-120px)]" : ""
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F5F9] px-4 py-3">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-900">
              {input.originCity}, {input.originState} → {input.destinationCity},{" "}
              {input.destinationState}
            </p>
            {input.isLive ? (
              <div className="mt-1">
                <LiveBadge />
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isFullscreen ? (
              <>
                <PremiumActionButton
                  label="Full Map"
                  emoji="⛶"
                  href={fullscreenHref}
                />
                <PremiumActionButton
                  label="Replay Trip"
                  emoji="▶"
                  href={replayHref ?? `${fullscreenHref}/replay`}
                />
                {showRouteHistoryButton ? (
                  <PremiumActionButton
                    label="Route History"
                    emoji="📜"
                    onClick={openRouteHistory}
                  />
                ) : null}
              </>
            ) : (
              <>
                <PremiumActionButton
                  label="Replay Trip"
                  emoji="▶"
                  href={replayHref ?? `${fullscreenHref}/replay`}
                />
                {showRouteHistoryButton ? (
                  <PremiumActionButton
                    label="Route History"
                    emoji="📜"
                    onClick={openRouteHistory}
                  />
                ) : null}
              </>
            )}
          </div>
        </div>

        <TrackingMapControls
          style={viewState.style}
          layers={viewState.layers}
          onStyleChange={(style) => setViewState((current) => ({ ...current, style }))}
          onLayerToggle={toggleLayer}
          compact={!isFullscreen}
        />

        <InteractiveTrackingMap
          snapshot={liveSnapshot}
          viewState={viewState}
          className={isFullscreen ? "h-[min(62vh,720px)]" : "h-[300px]"}
          showZoomControls={isFullscreen}
          onMapClick={!isFullscreen ? openFullMap : undefined}
          clickable={!isFullscreen}
          isLoading={!snapshot}
        />

        <TrackingMapStats stats={liveSnapshot.stats} compact={!isFullscreen} />
      </div>

      <RouteHistoryDrawer
        open={historyOpen}
        onClose={closeRouteHistory}
        timeline={routeHistory}
      />
    </>
  );
}

export { LiveBadge, PremiumActionButton };
