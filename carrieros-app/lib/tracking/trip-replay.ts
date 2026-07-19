import { formatCoordinatesLabel } from "@/lib/tracking/map-geocoding";
import { positionAlongRoute } from "@/lib/tracking/map-route";
import type {
  LatLng,
  LiveTrackingSnapshot,
  TrackingMapRoute,
} from "@/lib/tracking/map-types";

export type TripReplayEventCategory =
  | "gps"
  | "fuel_stop"
  | "rest_break"
  | "weather"
  | "traffic"
  | "geofence"
  | "documents"
  | "notes";

export type TripReplayEventType =
  | "driver_assigned"
  | "dispatch_sent"
  | "trip_started"
  | "pickup_arrived"
  | "checked_in"
  | "loaded"
  | "left_pickup"
  | "fuel_stop"
  | "rest_break"
  | "scale_house"
  | "traffic_delay"
  | "weather_event"
  | "geofence_enter"
  | "geofence_exit"
  | "detention_started"
  | "pod_uploaded"
  | "delivery_arrived"
  | "delivery_completed"
  | "invoice_sent"
  | "gps_ping";

export type TripReplayGpsPoint = {
  timestamp: string;
  position: LatLng;
  speedMph: number;
  heading: number;
  milesTraveled: number;
};

export type TripReplayEvent = {
  id: string;
  type: TripReplayEventType;
  category: TripReplayEventCategory;
  title: string;
  timestamp: string;
  timeLabel: string;
  dateLabel: string;
  location: string;
  description?: string;
};

export type TripReplayFilters = {
  gps: boolean;
  fuel_stop: boolean;
  rest_break: boolean;
  weather: boolean;
  traffic: boolean;
  geofence: boolean;
  documents: boolean;
  notes: boolean;
};

export const DEFAULT_TRIP_REPLAY_FILTERS: TripReplayFilters = {
  gps: true,
  fuel_stop: true,
  rest_break: true,
  weather: true,
  traffic: true,
  geofence: true,
  documents: true,
  notes: true,
};

export type TripReplayData = {
  loadId: string;
  loadReference: string;
  startTime: string;
  endTime: string;
  totalMiles: number;
  route: TrackingMapRoute;
  gpsPoints: TripReplayGpsPoint[];
  events: TripReplayEvent[];
  driverName: string;
  originLabel: string;
  destinationLabel: string;
};

export type TripReplayStats = {
  currentTimestamp: string;
  timeLabel: string;
  dateLabel: string;
  speedMph: number;
  location: string;
  milesTraveled: number;
  milesRemaining: number;
  eta: string;
  driverStatus: string;
};

export type TripReplaySpeed = 1 | 2 | 5 | 10;

export const TRIP_REPLAY_EVENT_LABELS: Record<TripReplayEventType, string> = {
  driver_assigned: "Driver Assigned",
  dispatch_sent: "Dispatch Sent",
  trip_started: "Trip Started",
  pickup_arrived: "Pickup Arrived",
  checked_in: "Checked In",
  loaded: "Loaded",
  left_pickup: "Left Pickup",
  fuel_stop: "Fuel Stop",
  rest_break: "Rest Break",
  scale_house: "Scale House",
  traffic_delay: "Traffic Delay",
  weather_event: "Weather Event",
  geofence_enter: "Geofence Enter",
  geofence_exit: "Geofence Exit",
  detention_started: "Detention Started",
  pod_uploaded: "POD Uploaded",
  delivery_arrived: "Delivery Arrived",
  delivery_completed: "Delivery Completed",
  invoice_sent: "Invoice Sent",
  gps_ping: "GPS Update",
};

const EVENT_CATEGORY_MAP: Record<TripReplayEventType, TripReplayEventCategory> = {
  driver_assigned: "notes",
  dispatch_sent: "notes",
  trip_started: "gps",
  pickup_arrived: "gps",
  checked_in: "gps",
  loaded: "gps",
  left_pickup: "gps",
  fuel_stop: "fuel_stop",
  rest_break: "rest_break",
  scale_house: "gps",
  traffic_delay: "traffic",
  weather_event: "weather",
  geofence_enter: "geofence",
  geofence_exit: "geofence",
  detention_started: "notes",
  pod_uploaded: "documents",
  delivery_arrived: "gps",
  delivery_completed: "gps",
  invoice_sent: "documents",
  gps_ping: "gps",
};

type EventTemplate = {
  type: TripReplayEventType;
  progress: number;
  location?: string;
  description?: string;
};

const EVENT_TEMPLATES: EventTemplate[] = [
  { type: "driver_assigned", progress: 0, location: "Dispatch Center" },
  { type: "dispatch_sent", progress: 0.01, location: "Dispatch Center" },
  { type: "trip_started", progress: 0.03, description: "Driver departed yard" },
  { type: "pickup_arrived", progress: 0.12 },
  { type: "checked_in", progress: 0.13 },
  { type: "loaded", progress: 0.16 },
  { type: "detention_started", progress: 0.17, description: "Waiting at dock" },
  { type: "left_pickup", progress: 0.2 },
  { type: "geofence_exit", progress: 0.21, description: "Exited pickup geofence" },
  { type: "fuel_stop", progress: 0.32, location: "Pilot Travel Center · I-44" },
  { type: "rest_break", progress: 0.38, location: "Rest Area · Mile 142" },
  { type: "scale_house", progress: 0.45, location: "DOT Scale · I-70" },
  { type: "traffic_delay", progress: 0.52, description: "Congestion on I-70" },
  { type: "weather_event", progress: 0.58, description: "Heavy rain advisory" },
  { type: "geofence_enter", progress: 0.72, description: "Entered delivery zone" },
  { type: "delivery_arrived", progress: 0.88 },
  { type: "delivery_completed", progress: 0.92 },
  { type: "pod_uploaded", progress: 0.94, description: "Proof of delivery uploaded" },
  { type: "invoice_sent", progress: 0.98, location: "Back office" },
];

function hashOffset(seed: string, index: number): number {
  let hash = index;

  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % 997;
  }

  return hash;
}

function formatEventTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatEventDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpPosition(a: LatLng, b: LatLng, t: number): LatLng {
  return {
    lat: lerp(a.lat, b.lat, t),
    lng: lerp(a.lng, b.lng, t),
  };
}

function headingBetween(a: LatLng, b: LatLng): number {
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export type BuildTripReplayInput = {
  loadId: string;
  loadReference: string;
  originLabel: string;
  destinationLabel: string;
  route: TrackingMapRoute;
  totalMiles: number;
  driverName?: string;
  tripDurationHours?: number;
};

/**
 * Placeholder replay data — replace with ELD / GPS provider history later.
 */
export function buildTripReplay(input: BuildTripReplayInput): TripReplayData {
  const driverName = input.driverName ?? "Unassigned";
  const tripDurationMs = (input.tripDurationHours ?? 18) * 60 * 60 * 1000;
  const endTime = new Date("2026-07-05T18:00:00Z");
  const startTime = new Date(endTime.getTime() - tripDurationMs);

  const gpsPointCount = 120;
  const gpsPoints: TripReplayGpsPoint[] = [];

  for (let i = 0; i <= gpsPointCount; i += 1) {
    const progress = i / gpsPointCount;
    const timestamp = new Date(
      startTime.getTime() + progress * tripDurationMs,
    );
    const position = positionAlongRoute(input.route, progress);
    const milesTraveled = Math.round(input.totalMiles * progress);
    const isStopped =
      progress > 0.12 && progress < 0.2
        ? true
        : progress > 0.31 && progress < 0.34
          ? true
          : progress > 0.37 && progress < 0.4
            ? true
            : progress > 0.87 && progress < 0.93;

    const speedMph = isStopped
      ? 0
      : progress < 0.03
        ? 25
        : progress > 0.95
          ? 15
          : 55 + Math.round(Math.sin(progress * 14 + hashOffset(input.loadId, i)) * 8);

    const prevPosition =
      i > 0
        ? gpsPoints[i - 1].position
        : positionAlongRoute(input.route, Math.max(0, progress - 0.01));

    gpsPoints.push({
      timestamp: timestamp.toISOString(),
      position,
      speedMph,
      heading: headingBetween(prevPosition, position),
      milesTraveled,
    });
  }

  const events: TripReplayEvent[] = EVENT_TEMPLATES.map((template, index) => {
    const timestamp = new Date(
      startTime.getTime() +
        template.progress * tripDurationMs +
        hashOffset(input.loadId, index) * 60_000,
    );
    const location =
      template.location ??
      (template.progress < 0.2
        ? input.originLabel
        : template.progress > 0.85
          ? input.destinationLabel
          : formatCoordinatesLabel(
              positionAlongRoute(input.route, template.progress),
            ));

    return {
      id: `${input.loadId}-replay-${template.type}-${index}`,
      type: template.type,
      category: EVENT_CATEGORY_MAP[template.type],
      title: TRIP_REPLAY_EVENT_LABELS[template.type],
      timestamp: timestamp.toISOString(),
      timeLabel: formatEventTime(timestamp),
      dateLabel: formatEventDate(timestamp),
      location,
      description: template.description,
    };
  });

  // Sparse GPS ping events for timeline density
  for (let i = 1; i < gpsPoints.length - 1; i += 8) {
    const point = gpsPoints[i];
    const ts = new Date(point.timestamp);

    events.push({
      id: `${input.loadId}-gps-${i}`,
      type: "gps_ping",
      category: "gps",
      title: TRIP_REPLAY_EVENT_LABELS.gps_ping,
      timestamp: point.timestamp,
      timeLabel: formatEventTime(ts),
      dateLabel: formatEventDate(ts),
      location: formatCoordinatesLabel(point.position),
    });
  }

  events.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  return {
    loadId: input.loadId,
    loadReference: input.loadReference,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    totalMiles: input.totalMiles,
    route: input.route,
    gpsPoints,
    events,
    driverName,
    originLabel: input.originLabel,
    destinationLabel: input.destinationLabel,
  };
}

export function interpolateGpsAtTime(
  gpsPoints: TripReplayGpsPoint[],
  timestampMs: number,
): TripReplayGpsPoint | null {
  if (gpsPoints.length === 0) {
    return null;
  }

  const first = gpsPoints[0];
  const last = gpsPoints[gpsPoints.length - 1];
  const firstMs = new Date(first.timestamp).getTime();
  const lastMs = new Date(last.timestamp).getTime();

  if (timestampMs <= firstMs) {
    return first;
  }

  if (timestampMs >= lastMs) {
    return last;
  }

  for (let i = 0; i < gpsPoints.length - 1; i += 1) {
    const current = gpsPoints[i];
    const next = gpsPoints[i + 1];
    const currentMs = new Date(current.timestamp).getTime();
    const nextMs = new Date(next.timestamp).getTime();

    if (timestampMs >= currentMs && timestampMs <= nextMs) {
      const span = nextMs - currentMs || 1;
      const t = (timestampMs - currentMs) / span;

      return {
        timestamp: new Date(timestampMs).toISOString(),
        position: lerpPosition(current.position, next.position, t),
        speedMph: Math.round(lerp(current.speedMph, next.speedMph, t)),
        heading: lerp(current.heading, next.heading, t),
        milesTraveled: Math.round(
          lerp(current.milesTraveled, next.milesTraveled, t),
        ),
      };
    }
  }

  return last;
}

export function deriveReplayStats(
  data: TripReplayData,
  timestampMs: number,
  etaLabel: string,
): TripReplayStats {
  const gps = interpolateGpsAtTime(data.gpsPoints, timestampMs);
  const current = new Date(timestampMs);
  const milesTraveled = gps?.milesTraveled ?? 0;
  const milesRemaining = Math.max(0, data.totalMiles - milesTraveled);
  const progress = data.totalMiles > 0 ? milesTraveled / data.totalMiles : 0;

  let driverStatus = "En route";

  if (progress < 0.03) {
    driverStatus = "Pre-trip";
  } else if (progress >= 0.12 && progress < 0.2) {
    driverStatus = "At pickup";
  } else if (progress >= 0.87 && progress < 0.93) {
    driverStatus = "At delivery";
  } else if (progress >= 0.93) {
    driverStatus = "Post-delivery";
  } else if ((gps?.speedMph ?? 0) < 5) {
    driverStatus = "Stopped";
  } else if ((gps?.speedMph ?? 0) > 0) {
    driverStatus = "Driving";
  }

  return {
    currentTimestamp: current.toISOString(),
    timeLabel: formatEventTime(current),
    dateLabel: formatEventDate(current),
    speedMph: gps?.speedMph ?? 0,
    location: gps ? formatCoordinatesLabel(gps.position) : "Unknown",
    milesTraveled,
    milesRemaining,
    eta: etaLabel,
    driverStatus,
  };
}

export function filterReplayEvents(
  events: TripReplayEvent[],
  filters: TripReplayFilters,
): TripReplayEvent[] {
  return events.filter((event) => {
    if (event.type === "gps_ping") {
      return filters.gps;
    }

    return filters[event.category];
  });
}

export function buildReplaySnapshot(
  data: TripReplayData,
  timestampMs: number,
  etaLabel: string,
  baseSnapshot: LiveTrackingSnapshot,
): LiveTrackingSnapshot {
  const gps = interpolateGpsAtTime(data.gpsPoints, timestampMs);
  const stats = deriveReplayStats(data, timestampMs, etaLabel);

  if (!gps) {
    return baseSnapshot;
  }

  return {
    ...baseSnapshot,
    isLive: false,
    truck: {
      ...baseSnapshot.truck,
      position: gps.position,
      heading: gps.heading,
    },
    stats: {
      currentLocation: stats.location,
      speedMph: stats.speedMph,
      milesRemaining: stats.milesRemaining,
      eta: stats.eta,
      lastUpdated: stats.timeLabel,
    },
  };
}

export function timestampToProgress(
  data: TripReplayData,
  timestampMs: number,
): number {
  const startMs = new Date(data.startTime).getTime();
  const endMs = new Date(data.endTime).getTime();
  const span = endMs - startMs || 1;

  return Math.min(1, Math.max(0, (timestampMs - startMs) / span));
}

export function progressToTimestamp(
  data: TripReplayData,
  progress: number,
): number {
  const startMs = new Date(data.startTime).getTime();
  const endMs = new Date(data.endTime).getTime();

  return startMs + progress * (endMs - startMs);
}
