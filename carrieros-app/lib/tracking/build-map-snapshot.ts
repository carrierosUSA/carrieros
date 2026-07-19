import {
  formatCoordinatesLabel,
  geocodeCityState,
  interpolatePosition,
} from "@/lib/tracking/map-geocoding";
import { fetchDrivingRoute, positionAlongRoute } from "@/lib/tracking/map-route";
import type {
  LiveTrackingSnapshot,
  LatLng,
  TrackingDriverDetails,
  TrackingStopDetails,
} from "@/lib/tracking/map-types";
import type { DriverLocation } from "@/lib/types";

export type BuildTrackingSnapshotInput = {
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
  currentLocationLabel?: string;
  driverLocation?: DriverLocation | null;
  driver?: TrackingDriverDetails;
  pickupDetails?: Partial<TrackingStopDetails>;
  deliveryDetails?: Partial<TrackingStopDetails>;
  lastUpdatedLabel?: string;
};

function routeProgress(totalMiles: number, milesRemaining: number): number {
  if (totalMiles <= 0) {
    return 0.5;
  }

  const traveled = Math.max(0, totalMiles - milesRemaining);
  return Math.min(1, Math.max(0, traveled / totalMiles));
}

function truckPosition(
  pickup: LatLng,
  delivery: LatLng,
  routeCoordinates: LatLng[],
  progress: number,
  driverLocation?: DriverLocation | null,
): LatLng {
  if (driverLocation) {
    return {
      lat: driverLocation.latitude,
      lng: driverLocation.longitude,
    };
  }

  if (routeCoordinates.length > 1) {
    return positionAlongRoute(
      { coordinates: routeCoordinates, distanceMiles: 0, durationMinutes: 0 },
      progress,
    );
  }

  return interpolatePosition(pickup, delivery, progress);
}

export async function buildLiveTrackingSnapshot(
  input: BuildTrackingSnapshotInput,
): Promise<LiveTrackingSnapshot> {
  const pickupPosition = geocodeCityState(input.originCity, input.originState);
  const deliveryPosition = geocodeCityState(
    input.destinationCity,
    input.destinationState,
  );
  const route = await fetchDrivingRoute(pickupPosition, deliveryPosition);
  const milesRemaining =
    input.milesRemaining ??
    Math.max(0, Math.round(input.totalMiles * 0.35));
  const progress = routeProgress(input.totalMiles, milesRemaining);
  const truckPositionValue = truckPosition(
    pickupPosition,
    deliveryPosition,
    route.coordinates,
    progress,
    input.driverLocation,
  );

  const speedMph = input.driverLocation?.speedMph ?? 62;
  const currentLocation =
    input.currentLocationLabel ?? formatCoordinatesLabel(truckPositionValue);

  return {
    loadId: input.loadId,
    loadReference: input.loadReference,
    isLive: input.isLive,
    pickup: {
      id: "pickup",
      position: pickupPosition,
      label: `${input.originCity}, ${input.originState}`,
    },
    delivery: {
      id: "delivery",
      position: deliveryPosition,
      label: `${input.destinationCity}, ${input.destinationState}`,
    },
    truck: {
      id: "truck",
      position: truckPositionValue,
      label: "Live truck",
      heading: input.driverLocation?.heading,
    },
    route,
    stats: {
      currentLocation,
      speedMph,
      milesRemaining,
      eta: input.eta,
      lastUpdated:
        input.lastUpdatedLabel ??
        new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }).format(new Date()),
    },
    pickupDetails: {
      city: input.originCity,
      state: input.originState,
      company: input.pickupDetails?.company,
      address: input.pickupDetails?.address,
      appointment: input.pickupDetails?.appointment,
    },
    deliveryDetails: {
      city: input.destinationCity,
      state: input.destinationState,
      company: input.deliveryDetails?.company,
      address: input.deliveryDetails?.address,
      appointment: input.deliveryDetails?.appointment,
    },
    driver: input.driver,
  };
}
