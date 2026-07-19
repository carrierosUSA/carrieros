import type { TrailerDashboardStats as Stats } from "@/lib/fleet/trailer-board";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type TrailerDashboardStatsProps = {
  stats: Stats;
};

const statCards: {
  key: keyof Stats;
  label: string;
  tone?: keyof typeof CARRIEROS_COLORS;
}[] = [
  { key: "totalTrailers", label: "Total Trailers" },
  { key: "available", label: "Available", tone: "success" },
  { key: "loaded", label: "Loaded", tone: "info" },
  { key: "empty", label: "Empty", tone: "disabled" },
  { key: "inYard", label: "In Yard", tone: "info" },
  { key: "inShop", label: "In Shop", tone: "warning" },
  { key: "outOfService", label: "Out of Service", tone: "critical" },
];

export default function TrailerDashboardStats({ stats }: TrailerDashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
      {statCards.map((card) => {
        const value = stats[card.key];
        const tone = card.tone ? CARRIEROS_COLORS[card.tone] : null;
        const highlight =
          (card.key === "inShop" || card.key === "outOfService") && value > 0;

        return (
          <div
            key={card.key}
            className={`rounded-[14px] px-4 py-3 ${
              highlight && card.key === "outOfService"
                ? `${CARRIEROS_COLORS.critical.bg} ring-1 ${CARRIEROS_COLORS.critical.border}`
                : highlight
                  ? `${CARRIEROS_COLORS.warning.bg} ring-1 ${CARRIEROS_COLORS.warning.border}`
                  : "bg-[#F8FAFC] ring-1 ring-[#EAEAEA]"
            }`}
          >
            <p className="text-[12px] font-medium text-slate-500">{card.label}</p>
            <p
              className={`mt-1 text-[22px] font-bold tabular-nums tracking-tight ${
                highlight && card.key === "outOfService"
                  ? CARRIEROS_COLORS.critical.text
                  : highlight
                    ? CARRIEROS_COLORS.warning.text
                    : tone
                      ? tone.text
                      : "text-slate-950"
              }`}
            >
              {value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
