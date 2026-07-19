"use client";

import { useMemo } from "react";
import type { TripReplayEvent } from "@/lib/tracking/trip-replay";

type TripReplayTimelineProps = {
  progress: number;
  events: TripReplayEvent[];
  activeEventId: string | null;
  startLabel: string;
  endLabel: string;
  onSeekProgress: (progress: number) => void;
  onJumpToEvent: (eventId: string) => void;
};

function eventMarkerColor(type: TripReplayEvent["type"]): string {
  switch (type) {
    case "traffic_delay":
      return "#F97316";
    case "weather_event":
      return "#6366F1";
    case "fuel_stop":
      return "#0EA5E9";
    case "rest_break":
      return "#8B5CF6";
    case "geofence_enter":
    case "geofence_exit":
      return "#14B8A6";
    case "pod_uploaded":
    case "invoice_sent":
      return "#16A34A";
    case "detention_started":
      return "#EF4444";
    case "gps_ping":
      return "#94A3B8";
    default:
      return "#2563EB";
  }
}

export default function TripReplayTimeline({
  progress,
  events,
  activeEventId,
  startLabel,
  endLabel,
  onSeekProgress,
  onJumpToEvent,
}: TripReplayTimelineProps) {
  const startMs = useMemo(() => {
    if (events.length === 0) {
      return 0;
    }

    return new Date(events[0].timestamp).getTime();
  }, [events]);

  const endMs = useMemo(() => {
    if (events.length === 0) {
      return 1;
    }

    return new Date(events[events.length - 1].timestamp).getTime();
  }, [events]);

  const span = endMs - startMs || 1;

  return (
    <div className="space-y-2">
      <div className="relative pt-5">
        <div className="relative h-2 rounded-full bg-[#E2E8F0]">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[#2563EB] transition-[width] duration-150"
            style={{ width: `${progress * 100}%` }}
          />

          {events
            .filter((event) => event.type !== "gps_ping")
            .map((event) => {
              const eventProgress =
                (new Date(event.timestamp).getTime() - startMs) / span;
              const isActive = event.id === activeEventId;

              return (
                <button
                  key={event.id}
                  type="button"
                  title={event.title}
                  onClick={() => onJumpToEvent(event.id)}
                  className={`absolute top-1/2 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white transition hover:scale-125 ${
                    isActive ? "scale-125 shadow-[0_0_0_4px_rgba(37,99,235,0.2)]" : ""
                  }`}
                  style={{
                    left: `${Math.min(100, Math.max(0, eventProgress * 100))}%`,
                    backgroundColor: eventMarkerColor(event.type),
                  }}
                  aria-label={`Jump to ${event.title}`}
                />
              );
            })}

          <input
            type="range"
            min={0}
            max={1000}
            value={Math.round(progress * 1000)}
            onChange={(event) =>
              onSeekProgress(Number(event.target.value) / 1000)
            }
            className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
            aria-label="Replay timeline"
          />

          <div
            className="pointer-events-none absolute top-1/2 z-[15] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#2563EB] shadow-md transition-[left] duration-150"
            style={{ left: `${progress * 100}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
        <span>{startLabel}</span>
        <span>{endLabel}</span>
      </div>
    </div>
  );
}
