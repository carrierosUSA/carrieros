import type { MaintenanceDashboardStats as Stats } from "@/lib/fleet/maintenance-board";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import { formatCurrency } from "@/lib/services/fleet/fleet-helpers";

type MaintenanceDashboardStatsProps = {
  stats: Stats;
};

function healthTone(score: number) {
  if (score >= 85) return CARRIEROS_COLORS.success;
  if (score >= 70) return CARRIEROS_COLORS.info;
  if (score >= 55) return CARRIEROS_COLORS.warning;
  return CARRIEROS_COLORS.critical;
}

export default function MaintenanceDashboardStats({
  stats,
}: MaintenanceDashboardStatsProps) {
  const health = healthTone(stats.fleetHealthScore);

  const cards: {
    key: string;
    label: string;
    value: string;
    tone?: keyof typeof CARRIEROS_COLORS;
    highlight?: "warning" | "critical" | "info";
  }[] = [
    {
      key: "health",
      label: "Fleet Health Score",
      value: String(stats.fleetHealthScore),
    },
    {
      key: "trucksShop",
      label: "Trucks in Shop",
      value: String(stats.trucksInShop),
      tone: "info",
      highlight: stats.trucksInShop > 0 ? "info" : undefined,
    },
    {
      key: "trailersShop",
      label: "Trailers in Shop",
      value: String(stats.trailersInShop),
      tone: "info",
      highlight: stats.trailersInShop > 0 ? "info" : undefined,
    },
    {
      key: "pmDue",
      label: "PM Due",
      value: String(stats.pmDue),
      tone: "warning",
      highlight: stats.pmDue > 0 ? "warning" : undefined,
    },
    {
      key: "repairsDue",
      label: "Repairs Due",
      value: String(stats.repairsDue),
      tone: "warning",
      highlight: stats.repairsDue > 0 ? "warning" : undefined,
    },
    {
      key: "critical",
      label: "Critical Alerts",
      value: String(stats.criticalAlerts),
      tone: "critical",
      highlight: stats.criticalAlerts > 0 ? "critical" : undefined,
    },
    {
      key: "downtime",
      label: "Downtime Today",
      value: `${stats.downtimeHoursToday}h`,
      tone: "disabled",
    },
    {
      key: "cost",
      label: "Cost This Month",
      value: formatCurrency(stats.maintenanceCostMonth),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
      {cards.map((card) => {
        const isHealth = card.key === "health";
        const highlightTone = card.highlight
          ? CARRIEROS_COLORS[card.highlight]
          : null;
        const tone = card.tone ? CARRIEROS_COLORS[card.tone] : null;

        return (
          <div
            key={card.key}
            className={`rounded-[14px] px-4 py-3 ${
              isHealth
                ? `${health.bg} ring-1 ${health.border}`
                : highlightTone
                  ? `${highlightTone.bg} ring-1 ${highlightTone.border}`
                  : "bg-[#F8FAFC] ring-1 ring-[#EAEAEA]"
            }`}
          >
            <p className="text-[12px] font-medium text-slate-500">{card.label}</p>
            <p
              className={`mt-1 text-[22px] font-bold tabular-nums tracking-tight ${
                isHealth
                  ? health.text
                  : highlightTone
                    ? highlightTone.text
                    : tone
                      ? tone.text
                      : "text-slate-950"
              }`}
            >
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
