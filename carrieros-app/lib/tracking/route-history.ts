export type RouteHistoryEventType =
  | "load_assigned"
  | "driver_assigned"
  | "dispatch_sent"
  | "arrived_pickup"
  | "checked_in"
  | "loaded"
  | "left_pickup"
  | "fuel_stop"
  | "rest_break"
  | "live_gps_update"
  | "geofence_enter"
  | "geofence_exit"
  | "detention_started"
  | "pod_uploaded"
  | "delivered"
  | "invoice_sent"
  | "broker_paid";

export type RouteHistoryEventStatus =
  | "completed"
  | "active"
  | "upcoming";

export type RouteHistoryEvent = {
  id: string;
  type: RouteHistoryEventType;
  title: string;
  occurredAt: string;
  timeLabel: string;
  dateLabel: string;
  location: string;
  driver: string;
  status: RouteHistoryEventStatus;
  provider?: "mock" | "samsara" | "motive" | "geotab" | "eld" | "mobile";
};

export type RouteHistoryTimeline = {
  loadId: string;
  loadReference: string;
  events: RouteHistoryEvent[];
};

export const ROUTE_HISTORY_EVENT_LABELS: Record<RouteHistoryEventType, string> = {
  load_assigned: "Load Assigned",
  driver_assigned: "Driver Assigned",
  dispatch_sent: "Dispatch Sent",
  arrived_pickup: "Arrived Pickup",
  checked_in: "Checked In",
  loaded: "Loaded",
  left_pickup: "Left Pickup",
  fuel_stop: "Fuel Stop",
  rest_break: "Rest Break",
  live_gps_update: "Live GPS Update",
  geofence_enter: "Geofence Enter",
  geofence_exit: "Geofence Exit",
  detention_started: "Detention Started",
  pod_uploaded: "POD Uploaded",
  delivered: "Delivered",
  invoice_sent: "Invoice Sent",
  broker_paid: "Broker Paid",
};

const EVENT_SEQUENCE: RouteHistoryEventType[] = [
  "load_assigned",
  "driver_assigned",
  "dispatch_sent",
  "arrived_pickup",
  "checked_in",
  "loaded",
  "left_pickup",
  "fuel_stop",
  "rest_break",
  "live_gps_update",
  "geofence_enter",
  "geofence_exit",
  "detention_started",
  "pod_uploaded",
  "delivered",
  "invoice_sent",
  "broker_paid",
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

function locationForEvent(
  type: RouteHistoryEventType,
  origin: string,
  destination: string,
  driverLocation?: string,
): string {
  switch (type) {
    case "load_assigned":
    case "driver_assigned":
    case "dispatch_sent":
      return "Dispatch Center";
    case "arrived_pickup":
    case "checked_in":
    case "loaded":
    case "left_pickup":
    case "detention_started":
      return origin;
    case "delivered":
    case "pod_uploaded":
      return destination;
    case "fuel_stop":
      return "Pilot Travel Center · I-44";
    case "rest_break":
      return "Rest Area · Mile 142";
    case "live_gps_update":
    case "geofence_enter":
    case "geofence_exit":
      return driverLocation ?? "En route";
    case "invoice_sent":
    case "broker_paid":
      return "Back office";
    default:
      return driverLocation ?? "In transit";
  }
}

function statusForEvent(
  index: number,
  activeIndex: number,
): RouteHistoryEventStatus {
  if (index < activeIndex) {
    return "completed";
  }

  if (index === activeIndex) {
    return "active";
  }

  return "upcoming";
}

export type BuildRouteHistoryInput = {
  loadId: string;
  loadReference: string;
  originLabel: string;
  destinationLabel: string;
  driverName?: string;
  driverLocation?: string;
  loadStatus?: string;
};

/**
 * Placeholder timeline — replace with ELD / TMS event stream later.
 */
export function buildRouteHistory(input: BuildRouteHistoryInput): RouteHistoryTimeline {
  const driver = input.driverName ?? "Unassigned";
  const now = new Date("2026-07-05T12:00:00Z");
  const activeIndex = Math.min(
    EVENT_SEQUENCE.length - 1,
    input.loadStatus === "delivered" || input.loadStatus === "invoiced"
      ? 13
      : input.loadStatus === "in_transit"
        ? 10
        : input.loadStatus === "picked_up"
          ? 7
          : input.loadStatus === "dispatched"
            ? 3
            : 1,
  );

  const events = EVENT_SEQUENCE.map((type, index) => {
    const minutesAgo =
      (EVENT_SEQUENCE.length - index) * 95 + hashOffset(input.loadId, index);
    const occurredAt = new Date(now.getTime() - minutesAgo * 60_000);

    return {
      id: `${input.loadId}-${type}`,
      type,
      title: ROUTE_HISTORY_EVENT_LABELS[type],
      occurredAt: occurredAt.toISOString(),
      timeLabel: formatEventTime(occurredAt),
      dateLabel: formatEventDate(occurredAt),
      location: locationForEvent(
        type,
        input.originLabel,
        input.destinationLabel,
        input.driverLocation,
      ),
      driver,
      status: statusForEvent(index, activeIndex),
      provider: "mock" as const,
    };
  }).reverse();

  return {
    loadId: input.loadId,
    loadReference: input.loadReference,
    events,
  };
}
