import type { FinanceDashboardStats } from "@/lib/types/finance";
import { formatFinanceMoney } from "@/lib/finance/finance-board";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";

type FinanceDashboardStatsProps = {
  stats: FinanceDashboardStats;
};

const cards: {
  key: keyof FinanceDashboardStats;
  label: string;
  tone?: keyof typeof TRANSPO_COLORS;
  signed?: boolean;
}[] = [
  { key: "todayRevenue", label: "Today's Revenue", tone: "success" },
  { key: "weekRevenue", label: "This Week", tone: "info" },
  { key: "monthRevenue", label: "This Month", tone: "info" },
  { key: "outstandingInvoices", label: "Outstanding Invoices", tone: "warning" },
  {
    key: "outstandingBrokerPayments",
    label: "Broker Payments Due",
    tone: "warning",
  },
  { key: "driverPayrollDue", label: "Driver Payroll Due", tone: "info" },
  { key: "fuelExpenses", label: "Fuel Expenses", tone: "disabled" },
  { key: "maintenanceExpenses", label: "Maintenance", tone: "disabled" },
  { key: "netProfit", label: "Net Profit", signed: true },
  { key: "cashFlow", label: "Cash Flow", signed: true },
];

export default function FinanceDashboardStats({
  stats,
}: FinanceDashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => {
        const value = stats[card.key];
        const isNegative = value < 0;
        const isPositiveHighlight =
          (card.key === "netProfit" || card.key === "cashFlow") && value > 0;
        const isNegativeHighlight =
          (card.key === "netProfit" || card.key === "cashFlow") && isNegative;
        const outstanding =
          (card.key === "outstandingInvoices" ||
            card.key === "outstandingBrokerPayments") &&
          value > 0;

        let tone = card.tone ? TRANSPO_COLORS[card.tone] : null;
        if (isPositiveHighlight) tone = TRANSPO_COLORS.success;
        if (isNegativeHighlight) tone = TRANSPO_COLORS.critical;

        const surface = isNegativeHighlight
          ? TRANSPO_COLORS.critical.bg
          : outstanding
            ? TRANSPO_COLORS.warning.bg
            : isPositiveHighlight
              ? TRANSPO_COLORS.success.bg
              : "bg-[#F8F9FB]";

        return (
          <div
            key={card.key}
            className={`flex h-full min-h-[96px] flex-col justify-between rounded-[12px] px-4 py-3 ${surface}`}
          >
            <p className="text-[12px] font-medium text-[#6B7280]">{card.label}</p>
            <p
              className={`mt-2 text-[20px] font-bold tabular-nums tracking-tight ${
                tone ? tone.text : "text-[#111827]"
              }`}
            >
              {formatFinanceMoney(value)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
