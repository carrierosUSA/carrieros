"use client";

import type { TripReplayFilters } from "@/lib/tracking/trip-replay";

type TripReplayFiltersProps = {
  filters: TripReplayFilters;
  onToggle: (key: keyof TripReplayFilters) => void;
};

const FILTER_OPTIONS: Array<{
  key: keyof TripReplayFilters;
  label: string;
}> = [
  { key: "gps", label: "GPS" },
  { key: "fuel_stop", label: "Fuel Stops" },
  { key: "rest_break", label: "Rest Breaks" },
  { key: "weather", label: "Weather" },
  { key: "traffic", label: "Traffic" },
  { key: "geofence", label: "Geofence" },
  { key: "documents", label: "Documents" },
  { key: "notes", label: "Notes" },
];

export default function TripReplayFilters({
  filters,
  onToggle,
}: TripReplayFiltersProps) {
  return (
    <div className="rounded-[16px] border border-[#EAEAEA] bg-white p-4 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
        Event Filters
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((option) => {
          const active = filters[option.key];

          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onToggle(option.key)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition ${
                active
                  ? "border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]"
                  : "border-[#EAEAEA] bg-white text-slate-500 hover:border-[#CBD5E1]"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                  active ? "bg-[#2563EB] text-white" : "bg-[#E2E8F0] text-slate-500"
                }`}
              >
                {active ? "✓" : ""}
              </span>
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
