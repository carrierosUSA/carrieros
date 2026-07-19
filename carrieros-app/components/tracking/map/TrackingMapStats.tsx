import type { LiveTrackingStats } from "@/lib/tracking/map-types";

type TrackingMapStatsProps = {
  stats: LiveTrackingStats;
  compact?: boolean;
};

const ITEMS: Array<{ key: keyof LiveTrackingStats; label: string }> = [
  { key: "currentLocation", label: "Current Location" },
  { key: "speedMph", label: "Speed" },
  { key: "milesRemaining", label: "Miles Remaining" },
  { key: "eta", label: "ETA" },
  { key: "lastUpdated", label: "Last Updated" },
];

function formatValue(key: keyof LiveTrackingStats, value: string | number) {
  if (key === "speedMph") {
    return `${value} mph`;
  }

  if (key === "milesRemaining") {
    return `${value} mi`;
  }

  return String(value);
}

export default function TrackingMapStats({
  stats,
  compact = false,
}: TrackingMapStatsProps) {
  return (
    <div
      className={`grid gap-3 border-t border-[#F1F5F9] bg-white ${
        compact
          ? "grid-cols-2 px-4 py-3 sm:grid-cols-3"
          : "grid-cols-2 px-5 py-4 md:grid-cols-5"
      }`}
    >
      {ITEMS.map((item) => (
        <div key={item.key} className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
            {item.label}
          </p>
          <p
            className={`truncate font-semibold text-slate-900 ${
              compact ? "text-[12px]" : "text-[13px]"
            } ${item.key === "eta" ? "text-[#16A34A]" : ""}`}
          >
            {formatValue(item.key, stats[item.key])}
          </p>
        </div>
      ))}
    </div>
  );
}
