"use client";

import { useEffect, useRef, useState } from "react";
import type { TrackingMapController } from "@/lib/tracking/map-types";
import { createLeafletTrackingMap } from "@/lib/tracking/leaflet-map-provider";
import type {
  LiveTrackingSnapshot,
  MapViewState,
} from "@/lib/tracking/map-types";

type InteractiveTrackingMapProps = {
  snapshot: LiveTrackingSnapshot;
  viewState: MapViewState;
  className?: string;
  showZoomControls?: boolean;
  onMapClick?: () => void;
  clickable?: boolean;
  isLoading?: boolean;
};

export default function InteractiveTrackingMap({
  snapshot,
  viewState,
  className = "h-[280px]",
  showZoomControls = false,
  onMapClick,
  clickable = false,
  isLoading = false,
}: InteractiveTrackingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<TrackingMapController | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    let cancelled = false;

    createLeafletTrackingMap(container, { onMapClick }).then((controller) => {
      if (cancelled) {
        controller.destroy();
        return;
      }

      controllerRef.current = controller;
      controller.setRoute(snapshot.route);
      controller.setMarkers(
        [snapshot.pickup, snapshot.delivery, snapshot.truck],
        viewState.layers,
      );
      controller.setStyle(viewState.style);
      controller.setOverlays(viewState.layers);
      controller.fitRoute();
      setMapReady(true);
    });

    return () => {
      cancelled = true;
      controllerRef.current?.destroy();
      controllerRef.current = null;
      setMapReady(false);
    };
    // Map instance is created once per container.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onMapClick]);

  useEffect(() => {
    const controller = controllerRef.current;

    if (!controller) {
      return;
    }

    controller.setStyle(viewState.style);
    controller.setOverlays(viewState.layers);
    controller.setMarkers(
      [snapshot.pickup, snapshot.delivery, snapshot.truck],
      viewState.layers,
    );
    controller.setRoute(snapshot.route);
  }, [snapshot, viewState]);

  return (
    <div
      className={`relative overflow-hidden bg-[#EEF2F6] ${className} ${
        clickable ? "cursor-pointer" : ""
      }`}
    >
      <div ref={containerRef} className="h-full w-full" />

      {(isLoading || !mapReady) && (
        <div className="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-br from-[#EEF2F6] via-[#F8FAFC] to-[#E2E8F0]" />
      )}

      {clickable && mapReady ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
          <span className="rounded-full border border-white/70 bg-white/90 px-3 py-1 text-[11px] font-medium text-slate-600 shadow-sm backdrop-blur-sm">
            Click map for Full Map
          </span>
        </div>
      ) : null}

      {showZoomControls ? (
        <div className="absolute bottom-4 right-4 z-[500] flex flex-col overflow-hidden rounded-xl border border-[#EAEAEA] bg-white shadow-lg">
          <button
            type="button"
            className="border-b border-[#F1F5F9] px-3 py-2 text-[18px] font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => controllerRef.current?.zoomIn()}
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            className="border-b border-[#F1F5F9] px-3 py-2 text-[18px] font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => controllerRef.current?.zoomOut()}
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            className="px-3 py-2 text-[15px] font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => controllerRef.current?.fitRoute()}
            aria-label="Recenter route"
          >
            ⟳
          </button>
        </div>
      ) : null}
    </div>
  );
}
