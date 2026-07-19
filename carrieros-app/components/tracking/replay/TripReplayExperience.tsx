"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import InteractiveTrackingMap from "@/components/tracking/map/InteractiveTrackingMap";
import TripReplayControls from "@/components/tracking/replay/TripReplayControls";
import TripReplayEventList from "@/components/tracking/replay/TripReplayEventList";
import TripReplayFilters from "@/components/tracking/replay/TripReplayFilters";
import TripReplayStatsPanel from "@/components/tracking/replay/TripReplayStats";
import TripReplayTimeline from "@/components/tracking/replay/TripReplayTimeline";
import { useTripReplay } from "@/hooks/useTripReplay";
import { buildLiveTrackingSnapshot } from "@/lib/tracking/build-map-snapshot";
import {
  DEFAULT_MAP_VIEW_STATE,
  type LiveTrackingSnapshot,
  type MapViewState,
  type TrackingDriverDetails,
  type TrackingStopDetails,
} from "@/lib/tracking/map-types";
import {
  buildReplaySnapshot,
  buildTripReplay,
  type TripReplayData,
} from "@/lib/tracking/trip-replay";
import type { DriverLocation } from "@/lib/types";

export type TripReplayExperienceInput = {
  loadId: string;
  loadReference: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  totalMiles: number;
  eta: string;
  driverName?: string;
  driver?: TrackingDriverDetails;
  pickupDetails?: Partial<TrackingStopDetails>;
  deliveryDetails?: Partial<TrackingStopDetails>;
  driverLocation?: DriverLocation | null;
  backHref: string;
};

export default function TripReplayExperience(input: TripReplayExperienceInput) {
  const [baseSnapshot, setBaseSnapshot] = useState<LiveTrackingSnapshot | null>(
    null,
  );
  const [replayData, setReplayData] = useState<TripReplayData | null>(null);
  const viewState: MapViewState = DEFAULT_MAP_VIEW_STATE;

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
      eta: input.eta,
      isLive: false,
      driverLocation: input.driverLocation,
      driver: input.driver,
      pickupDetails: input.pickupDetails,
      deliveryDetails: input.deliveryDetails,
    }).then((snapshot) => {
      if (cancelled) {
        return;
      }

      setBaseSnapshot(snapshot);
      setReplayData(
        buildTripReplay({
          loadId: input.loadId,
          loadReference: input.loadReference,
          originLabel: `${input.originCity}, ${input.originState}`,
          destinationLabel: `${input.destinationCity}, ${input.destinationState}`,
          route: snapshot.route,
          totalMiles: input.totalMiles,
          driverName: input.driverName ?? input.driver?.name,
        }),
      );
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
    input.eta,
    input.driverLocation,
    input.driver,
    input.driverName,
    input.pickupDetails,
    input.deliveryDetails,
  ]);

  const replay = useTripReplay({
    data:
      replayData ??
      ({
        loadId: input.loadId,
        loadReference: input.loadReference,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        totalMiles: input.totalMiles,
        route: { coordinates: [], distanceMiles: 0, durationMinutes: 0 },
        gpsPoints: [],
        events: [],
        driverName: input.driverName ?? "Unassigned",
        originLabel: `${input.originCity}, ${input.originState}`,
        destinationLabel: `${input.destinationCity}, ${input.destinationState}`,
      } satisfies TripReplayData),
    etaLabel: input.eta,
  });

  const replaySnapshot = useMemo(() => {
    if (!baseSnapshot || !replayData) {
      return null;
    }

    return buildReplaySnapshot(
      replayData,
      replay.currentTimeMs,
      input.eta,
      baseSnapshot,
    );
  }, [baseSnapshot, input.eta, replay.currentTimeMs, replayData]);

  const startLabel = replayData
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(replayData.startTime))
    : "—";

  const endLabel = replayData
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(replayData.endTime))
    : "—";

  return (
    <div className="min-h-[calc(100dvh-80px)] bg-[#F5F7FA]">
      <div className="border-b border-[#EAEAEA] bg-white px-1 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href={input.backHref}
              className="text-[13px] font-medium text-[#2563EB] transition hover:text-[#1D4ED8]"
            >
              ← Back to Tracking
            </Link>
            <h1 className="mt-2 text-[24px] font-bold tracking-[-0.03em] text-slate-950">
              Trip Replay
            </h1>
            <p className="mt-0.5 text-[14px] text-slate-500">
              {input.originCity}, {input.originState} → {input.destinationCity},{" "}
              {input.destinationState}
            </p>
          </div>

          <TripReplayControls
            isPlaying={replay.isPlaying}
            speed={replay.speed}
            onTogglePlay={replay.togglePlay}
            onStepBackward={replay.stepBackward}
            onStepForward={replay.stepForward}
            onSpeedChange={replay.setSpeed}
          />
        </div>
      </div>

      <div className="grid gap-4 p-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.85fr)]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[16px] border border-[#EAEAEA] bg-white shadow-sm">
            <InteractiveTrackingMap
              snapshot={
                replaySnapshot ?? {
                  loadId: input.loadId,
                  loadReference: input.loadReference,
                  isLive: false,
                  pickup: {
                    id: "pickup",
                    position: { lat: 0, lng: 0 },
                    label: "",
                  },
                  delivery: {
                    id: "delivery",
                    position: { lat: 0, lng: 0 },
                    label: "",
                  },
                  truck: {
                    id: "truck",
                    position: { lat: 0, lng: 0 },
                    label: "",
                  },
                  route: { coordinates: [], distanceMiles: 0, durationMinutes: 0 },
                  stats: {
                    currentLocation: "Loading...",
                    speedMph: 0,
                    milesRemaining: 0,
                    eta: input.eta,
                    lastUpdated: "—",
                  },
                  pickupDetails: {
                    city: input.originCity,
                    state: input.originState,
                  },
                  deliveryDetails: {
                    city: input.destinationCity,
                    state: input.destinationState,
                  },
                }
              }
              viewState={viewState}
              className="h-[min(58vh,640px)]"
              showZoomControls
              isLoading={!replaySnapshot}
            />
          </div>

          <div className="rounded-[16px] border border-[#EAEAEA] bg-white p-4 shadow-sm">
            <TripReplayTimeline
              progress={replay.progress}
              events={replay.visibleEvents}
              activeEventId={replay.activeEventId}
              startLabel={startLabel}
              endLabel={endLabel}
              onSeekProgress={replay.seekProgress}
              onJumpToEvent={replay.jumpToEvent}
            />
          </div>

          <TripReplayStatsPanel
            stats={replay.stats}
            driverName={replayData?.driverName ?? input.driverName ?? "Unassigned"}
            loadReference={input.loadReference}
          />
        </div>

        <aside className="space-y-4">
          <TripReplayFilters
            filters={replay.filters}
            onToggle={replay.toggleFilter}
          />

          <div className="overflow-hidden rounded-[16px] border border-[#EAEAEA] bg-white shadow-sm lg:min-h-[520px] lg:max-h-[calc(100dvh-180px)]">
            <TripReplayEventList
              events={replay.visibleEvents}
              activeEventId={replay.activeEventId}
              currentTimeMs={replay.currentTimeMs}
              onJumpToEvent={replay.jumpToEvent}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
