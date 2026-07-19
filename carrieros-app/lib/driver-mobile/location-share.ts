import type {
  GeofenceEvent,
  LocationShareSnapshot,
} from "@/lib/driver-mobile/types";
import type { DriverLocation } from "@/lib/types";
import type { GpsLocationUpdate, GpsTrackingProvider } from "@/lib/tracking/gps-provider";
import { DEMO_TENANT_ID } from "@/lib/data/tenant";

/**
 * Stub mobile GPS share — records mock location updates and is shaped
 * for a real navigator.geolocation / ELD provider later.
 */
export type LocationShareListener = (snapshot: LocationShareSnapshot) => void;

const MOCK_ROUTE = [
  { lat: 35.4676, lng: -97.5164, speedMph: 62, headingDeg: 18 },
  { lat: 35.52, lng: -97.4, speedMph: 58, headingDeg: 42 },
  { lat: 35.58, lng: -97.28, speedMph: 65, headingDeg: 55 },
  { lat: 35.64, lng: -97.15, speedMph: 48, headingDeg: 70 },
  { lat: 35.7, lng: -97.02, speedMph: 0, headingDeg: 0 },
];

function id() {
  return `loc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function toDriverLocation(
  snap: LocationShareSnapshot,
  driverId: string,
): DriverLocation {
  return {
    tenantId: DEMO_TENANT_ID,
    driverId,
    latitude: snap.lat,
    longitude: snap.lng,
    heading: snap.headingDeg,
    speedMph: snap.speedMph,
    recordedAt: snap.updatedAt,
    provider: "mobile",
  };
}

export class MockMobileGpsShare {
  private index = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<LocationShareListener>();
  private history: LocationShareSnapshot[] = [];
  private sharing = true;
  private geofenceEvents: GeofenceEvent[] = [];

  constructor(private eta = "2h 15m") {}

  getLatest(): LocationShareSnapshot {
    const point = MOCK_ROUTE[this.index % MOCK_ROUTE.length];
    return {
      ...point,
      eta: this.eta,
      accuracyM: 8 + (this.index % 5),
      sharing: this.sharing,
      updatedAt: new Date().toISOString(),
      geofenceEvents: [...this.geofenceEvents],
    };
  }

  getHistory(): LocationShareSnapshot[] {
    return [...this.history];
  }

  setSharing(sharing: boolean) {
    this.sharing = sharing;
    this.emit(this.getLatest());
  }

  subscribe(listener: LocationShareListener): () => void {
    this.listeners.add(listener);
    listener(this.getLatest());
    return () => this.listeners.delete(listener);
  }

  start(intervalMs = 4000) {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /** Simulate a geofence enter/exit for demo UI. */
  recordGeofence(type: GeofenceEvent["type"], label: string) {
    const event: GeofenceEvent = {
      id: id(),
      type,
      label,
      occurredAt: new Date().toISOString(),
    };
    this.geofenceEvents = [event, ...this.geofenceEvents].slice(0, 8);
    this.emit(this.getLatest());
  }

  private tick() {
    if (!this.sharing) return;
    this.index += 1;
    if (this.index === 3) {
      this.recordGeofence("entered", "Delivery geofence (5 mi)");
    }
    const snap = this.getLatest();
    this.history.push(snap);
    if (this.history.length > 40) this.history.shift();
    this.emit(snap);
  }

  private emit(snap: LocationShareSnapshot) {
    for (const listener of this.listeners) listener(snap);
  }
}

/** Adapter so mobile share plugs into the existing GpsTrackingProvider shape. */
export function createMobileGpsProvider(
  share: MockMobileGpsShare,
  driverId: string,
): GpsTrackingProvider {
  return {
    name: "mobile",
    async getLatestLocation(_loadId, driverIdArg) {
      return toDriverLocation(share.getLatest(), driverIdArg || driverId);
    },
    subscribe(_loadId, _driverId, onUpdate) {
      const unsub = share.subscribe((snap) => {
        const update: GpsLocationUpdate = {
          provider: "mobile",
          receivedAt: snap.updatedAt,
          location: toDriverLocation(snap, driverId),
        };
        onUpdate(update);
      });
      share.start();
      return { unsubscribe: unsub };
    },
  };
}

export function mapsNavigationUrl(address: string): string {
  const q = encodeURIComponent(address);
  // Universal geo link — iOS opens Apple Maps, Android opens Google Maps
  return `https://maps.apple.com/?daddr=${q}&dirflg=d`;
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function smsHref(phone: string, body?: string): string {
  const base = `sms:${phone.replace(/[^\d+]/g, "")}`;
  return body ? `${base}?body=${encodeURIComponent(body)}` : base;
}
