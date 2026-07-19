import type { CompanyDashboardStats as Stats } from "@/lib/companies/company-board";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type CompanyDashboardStatsProps = {
  stats: Stats;
};

const statCards: {
  key: keyof Stats;
  label: string;
  tone?: keyof typeof CARRIEROS_COLORS;
}[] = [
  { key: "totalCompanies", label: "Total Companies" },
  { key: "active", label: "Active", tone: "success" },
  { key: "inactive", label: "Inactive", tone: "disabled" },
  { key: "favorites", label: "Favorites", tone: "warning" },
  { key: "recentlyUsed", label: "Recently Used", tone: "info" },
];

export default function CompanyDashboardStats({
  stats,
}: CompanyDashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {statCards.map((card) => {
        const value = stats[card.key];
        const tone = card.tone ? CARRIEROS_COLORS[card.tone] : null;

        return (
          <div
            key={card.key}
            className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]"
          >
            <p className="text-[12px] font-medium text-slate-500">{card.label}</p>
            <p
              className={`mt-1 text-[20px] font-bold tabular-nums tracking-tight ${
                tone ? tone.text : "text-slate-950"
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
