import type { DriverLocation } from "@/lib/types";
import type { LiveTrackingSnapshot } from "@/lib/tracking/map-types";

/** Future hook point for Samsara, Motive, Geotab, ELD, mobile GPS. */
export type GpsProviderName =
  | "mock"
  | "samsara"
  | "motive"
  | "geotab"
  | "eld"
  | "mobile";

export type GpsLocationUpdate = {
  provider: GpsProviderName;
  location: DriverLocation;
  receivedAt: string;
};

export type GpsStreamSubscription = {
  unsubscribe: () => void;
};

export interface GpsTrackingProvider {
  readonly name: GpsProviderName;
  getLatestLocation(loadId: string, driverId: string): Promise<DriverLocation | null>;
  subscribe(
    loadId: string,
    driverId: string,
    onUpdate: (update: GpsLocationUpdate) => void,
  ): GpsStreamSubscription;
}

export type MapProviderName = "leaflet" | "mapbox" | "google";

export interface MapTrackingProvider {
  readonly name: MapProviderName;
  supportsTraffic: boolean;
  supportsWeather: boolean;
  supportsSatellite: boolean;
}

export type TrackingExperienceData = {
  snapshot: LiveTrackingSnapshot;
  gpsProvider: GpsProviderName;
  mapProvider: MapProviderName;
};
