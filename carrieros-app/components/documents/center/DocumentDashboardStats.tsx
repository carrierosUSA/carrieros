import type { DocumentDashboardStats as Stats } from "@/lib/documents/document-board";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type DocumentDashboardStatsProps = {
  stats: Stats;
};

const statCards: {
  key: keyof Stats;
  label: string;
  tone?: keyof typeof CARRIEROS_COLORS;
  highlightWhenPositive?: boolean;
}[] = [
  { key: "totalDocuments", label: "Total Documents" },
  { key: "uploadedToday", label: "Uploaded Today", tone: "info" },
  {
    key: "missingDocuments",
    label: "Missing Documents",
    tone: "warning",
    highlightWhenPositive: true,
  },
  {
    key: "pendingReview",
    label: "Pending Review",
    tone: "info",
    highlightWhenPositive: true,
  },
  {
    key: "expiringDocuments",
    label: "Expiring Documents",
    tone: "warning",
    highlightWhenPositive: true,
  },
];

export default function DocumentDashboardStats({
  stats,
}: DocumentDashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {statCards.map((card) => {
        const value = stats[card.key];
        const tone = card.tone ? CARRIEROS_COLORS[card.tone] : null;
        const highlight = Boolean(card.highlightWhenPositive && value > 0);

        return (
          <div
            key={card.key}
            className={`rounded-[14px] px-4 py-3 ${
              highlight && card.key === "missingDocuments"
                ? `${CARRIEROS_COLORS.warning.bg} ring-1 ${CARRIEROS_COLORS.warning.border}`
                : highlight && card.key === "pendingReview"
                  ? `${CARRIEROS_COLORS.info.bg} ring-1 ${CARRIEROS_COLORS.info.border}`
                  : highlight && card.key === "expiringDocuments"
                    ? `${CARRIEROS_COLORS.critical.bg} ring-1 ${CARRIEROS_COLORS.critical.border}`
                    : "bg-[#F8FAFC] ring-1 ring-[#EAEAEA]"
            }`}
          >
            <p className="text-[12px] font-medium text-slate-500">{card.label}</p>
            <p
              className={`mt-1 text-[20px] font-bold tabular-nums tracking-tight ${
                highlight && card.key === "missingDocuments"
                  ? CARRIEROS_COLORS.warning.text
                  : highlight && card.key === "pendingReview"
                    ? CARRIEROS_COLORS.info.text
                    : highlight && card.key === "expiringDocuments"
                      ? CARRIEROS_COLORS.critical.text
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
