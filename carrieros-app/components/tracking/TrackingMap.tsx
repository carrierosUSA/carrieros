import type { PublicTrackingView } from "@/lib/types";
import LiveTrackingPanel from "@/components/tracking/map/LiveTrackingPanel";

type TrackingMapProps = {
  tracking: PublicTrackingView;
};

export default function TrackingMap({ tracking }: TrackingMapProps) {
  return (
    <LiveTrackingPanel
      loadId={tracking.load.id}
      loadReference={tracking.load.reference}
      originCity={tracking.load.origin.city}
      originState={tracking.load.origin.state}
      destinationCity={tracking.load.destination.city}
      destinationState={tracking.load.destination.state}
      totalMiles={0}
      eta={tracking.etaLabel}
      isLive={tracking.status === "live"}
      currentLocationLabel={tracking.currentStop}
      lastUpdatedLabel={new Date(tracking.lastUpdatedAt).toLocaleString()}
      driverLocation={tracking.location ?? null}
      fullscreenHref={`/loads/${tracking.load.id}/tracking`}
      variant="compact"
    />
  );
}
