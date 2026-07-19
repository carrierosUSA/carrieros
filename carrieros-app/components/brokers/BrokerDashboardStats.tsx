import type { BrokerDashboardStats as Stats } from "@/lib/brokers/broker-board";
import {
  formatBrokerMoney,
  formatPaymentDays,
} from "@/lib/brokers/broker-board";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type BrokerDashboardStatsProps = {
  stats: Stats;
};

const statCards: {
  key: keyof Stats;
  label: string;
  tone?: keyof typeof CARRIEROS_COLORS;
  format?: "money" | "days";
}[] = [
  { key: "totalBrokers", label: "Total Brokers" },
  { key: "active", label: "Active", tone: "success" },
  { key: "inactive", label: "Inactive", tone: "disabled" },
  { key: "creditHold", label: "Credit Hold", tone: "critical" },
  { key: "avgPaymentDays", label: "Avg Payment Days", format: "days" },
  { key: "totalRevenue", label: "Total Revenue", format: "money", tone: "info" },
  {
    key: "outstandingBalance",
    label: "Outstanding",
    format: "money",
    tone: "warning",
  },
];

function formatValue(
  key: keyof Stats,
  value: number,
  format?: "money" | "days",
): string {
  if (format === "money") {
    return formatBrokerMoney(value);
  }

  if (format === "days") {
    return formatPaymentDays(value);
  }

  return String(value);
}

export default function BrokerDashboardStats({
  stats,
}: BrokerDashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
      {statCards.map((card) => {
        const value = stats[card.key];
        const tone = card.tone ? CARRIEROS_COLORS[card.tone] : null;
        const highlight =
          (card.key === "creditHold" || card.key === "outstandingBalance") &&
          value > 0;

        return (
          <div
            key={card.key}
            className={`rounded-[14px] px-4 py-3 ${
              highlight
                ? `${CARRIEROS_COLORS.warning.bg} ring-1 ${CARRIEROS_COLORS.warning.border}`
                : "bg-[#F8FAFC] ring-1 ring-[#EAEAEA]"
            }`}
          >
            <p className="text-[12px] font-medium text-slate-500">{card.label}</p>
            <p
              className={`mt-1 text-[20px] font-bold tabular-nums tracking-tight ${
                highlight
                  ? CARRIEROS_COLORS.warning.text
                  : tone
                    ? tone.text
                    : "text-slate-950"
              }`}
            >
              {formatValue(card.key, value, card.format)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
