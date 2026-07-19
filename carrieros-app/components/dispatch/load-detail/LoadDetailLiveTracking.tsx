"use client";

import LiveTrackingPanel from "@/components/tracking/map/LiveTrackingPanel";
import type { TrackingDriverDetails } from "@/lib/tracking/map-types";
import type { DriverLocation } from "@/lib/types";

type LoadDetailLiveTrackingProps = {
  loadId: string;
  loadReference: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  totalMiles: number;
  milesLeft: number;
  currentLocation?: string;
  fallbackLocation?: string;
  eta: string;
  lastLocationUpdate?: string;
  trackingEnabled?: boolean;
  hasDriver?: boolean;
  driverLocation?: DriverLocation | null;
  driver?: TrackingDriverDetails;
};

export default function LoadDetailLiveTracking({
  loadId,
  loadReference,
  originCity,
  originState,
  destinationCity,
  destinationState,
  totalMiles,
  milesLeft,
  currentLocation,
  fallbackLocation,
  eta,
  lastLocationUpdate,
  trackingEnabled = false,
  hasDriver = false,
  driverLocation,
  driver,
}: LoadDetailLiveTrackingProps) {
  return (
    <LiveTrackingPanel
      loadId={loadId}
      loadReference={loadReference}
      originCity={originCity}
      originState={originState}
      destinationCity={destinationCity}
      destinationState={destinationState}
      totalMiles={totalMiles}
      milesRemaining={milesLeft}
      eta={eta}
      isLive={trackingEnabled && hasDriver}
      currentLocationLabel={currentLocation ?? fallbackLocation}
      lastUpdatedLabel={lastLocationUpdate}
      driverLocation={driverLocation}
      driver={driver}
      fullscreenHref={`/loads/${loadId}/tracking`}
      variant="compact"
    />
  );
}
