"use client";

import type { TripReplayEvent } from "@/lib/tracking/trip-replay";

type TripReplayEventListProps = {
  events: TripReplayEvent[];
  activeEventId: string | null;
  currentTimeMs: number;
  onJumpToEvent: (eventId: string) => void;
};

function eventIcon(type: TripReplayEvent["type"]): string {
  switch (type) {
    case "driver_assigned":
      return "👤";
    case "dispatch_sent":
      return "📤";
    case "trip_started":
      return "🚛";
    case "pickup_arrived":
    case "delivery_arrived":
      return "📍";
    case "checked_in":
      return "✅";
    case "loaded":
      return "📦";
    case "left_pickup":
      return "↗";
    case "fuel_stop":
      return "⛽";
    case "rest_break":
      return "☕";
    case "scale_house":
      return "⚖";
    case "traffic_delay":
      return "🚧";
    case "weather_event":
      return "🌧";
    case "geofence_enter":
    case "geofence_exit":
      return "◎";
    case "detention_started":
      return "⏱";
    case "pod_uploaded":
      return "📄";
    case "delivery_completed":
      return "✓";
    case "invoice_sent":
      return "💰";
    default:
      return "•";
  }
}

export default function TripReplayEventList({
  events,
  activeEventId,
  currentTimeMs,
  onJumpToEvent,
}: TripReplayEventListProps) {
  const displayEvents = events.filter((event) => event.type !== "gps_ping");

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#F1F5F9] px-4 py-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
          Trip Events
        </p>
        <p className="mt-0.5 text-[13px] font-semibold text-slate-900">
          {displayEvents.length} events
        </p>
      </div>

      <ul className="flex-1 space-y-2 overflow-y-auto p-3">
        {displayEvents.map((event) => {
          const eventMs = new Date(event.timestamp).getTime();
          const isActive = event.id === activeEventId;
          const isPast = eventMs <= currentTimeMs;

          return (
            <li key={event.id}>
              <button
                type="button"
                onClick={() => onJumpToEvent(event.id)}
                className={`w-full rounded-[14px] border p-3 text-left transition ${
                  isActive
                    ? "border-[#BFDBFE] bg-[#F8FBFF] shadow-sm"
                    : isPast
                      ? "border-[#EAEAEA] bg-white hover:border-[#CBD5E1]"
                      : "border-[#F1F5F9] bg-[#FAFBFC] opacity-70 hover:opacity-100"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-[16px]" aria-hidden>
                    {eventIcon(event.type)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-semibold text-slate-950">
                        {event.title}
                      </p>
                      <span className="shrink-0 text-[11px] font-medium text-slate-500">
                        {event.timeLabel}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[12px] text-slate-600">
                      {event.location}
                    </p>
                    {event.description ? (
                      <p className="mt-1 text-[11px] text-slate-500">
                        {event.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
