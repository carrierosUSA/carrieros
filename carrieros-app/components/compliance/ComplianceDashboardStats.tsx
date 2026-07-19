import type { ComplianceDashboardStats as Stats } from "@/lib/types/compliance";
import { safetyScoreTone } from "@/lib/compliance/compliance-board";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type ComplianceDashboardStatsProps = {
  stats: Stats;
};

const secondaryCards: {
  key: keyof Omit<Stats, "fleetSafetyScore">;
  label: string;
  tone?: keyof typeof CARRIEROS_COLORS;
  warnWhenPositive?: boolean;
}[] = [
  { key: "activeViolations", label: "Active Violations", tone: "critical", warnWhenPositive: true },
  { key: "dotAlerts", label: "DOT Alerts", tone: "warning", warnWhenPositive: true },
  { key: "expiringDocuments", label: "Expiring Documents", tone: "warning", warnWhenPositive: true },
  { key: "failedInspections", label: "Failed Inspections", tone: "critical", warnWhenPositive: true },
  { key: "openAccidents", label: "Open Accidents", tone: "critical", warnWhenPositive: true },
  { key: "openClaims", label: "Open Claims", tone: "warning", warnWhenPositive: true },
];

export default function ComplianceDashboardStats({
  stats,
}: ComplianceDashboardStatsProps) {
  const scoreTone = safetyScoreTone(stats.fleetSafetyScore);
  const scoreColors = CARRIEROS_COLORS[scoreTone];

  return (
    <div className="space-y-3">
      <div
        className={`rounded-[16px] px-5 py-4 ring-1 ${scoreColors.bg} ${scoreColors.border}`}
      >
        <p className="text-[12px] font-medium text-slate-600">
          Fleet Safety Score
        </p>
        <div className="mt-1 flex flex-wrap items-end gap-3">
          <p
            className={`text-[36px] font-bold tabular-nums tracking-tight ${scoreColors.text}`}
          >
            {stats.fleetSafetyScore}
          </p>
          <p className="mb-1.5 text-[14px] font-medium text-slate-600">
            out of 100 ·{" "}
            {scoreTone === "success"
              ? "Fleet looks solid"
              : scoreTone === "warning"
                ? "Needs attention"
                : "Critical gaps"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {secondaryCards.map((card) => {
          const value = stats[card.key];
          const tone = card.tone ? CARRIEROS_COLORS[card.tone] : null;
          const highlight = Boolean(card.warnWhenPositive && value > 0);

          return (
            <div
              key={card.key}
              className={`rounded-[14px] px-4 py-3 ${
                highlight && card.tone
                  ? `${CARRIEROS_COLORS[card.tone].bg} ring-1 ${CARRIEROS_COLORS[card.tone].border}`
                  : "bg-[#F8FAFC] ring-1 ring-[#EAEAEA]"
              }`}
            >
              <p className="text-[12px] font-medium text-slate-500">
                {card.label}
              </p>
              <p
                className={`mt-1 text-[20px] font-bold tabular-nums tracking-tight ${
                  highlight && tone ? tone.text : "text-slate-950"
                }`}
              >
                {value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
