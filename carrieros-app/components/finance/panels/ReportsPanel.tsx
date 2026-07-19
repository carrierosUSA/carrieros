"use client";

import FinancePanelShell, {
  MetricBar,
} from "@/components/finance/FinancePanelShell";
import {
  costPerMile,
  expenseByCategory,
  fuelAnalysis,
  formatFinanceMoney,
  profitAndLoss,
  revenueByBroker,
  revenueByDriver,
  revenueByTruck,
  revenuePerMile,
} from "@/lib/finance/finance-board";
import type { ExpenseRecord, RevenueRecord } from "@/lib/types/finance";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type ReportsPanelProps = {
  tenantId: string;
  revenue: RevenueRecord[];
  expenses: ExpenseRecord[];
};

export default function ReportsPanel({
  tenantId,
  revenue,
  expenses,
}: ReportsPanelProps) {
  const pl = profitAndLoss(tenantId);
  const byTruck = revenueByTruck(revenue);
  const byDriver = revenueByDriver(revenue);
  const byBroker = revenueByBroker(revenue);
  const byCategory = expenseByCategory(expenses);
  const cpm = costPerMile(revenue, expenses);
  const rpm = revenuePerMile(revenue);
  const fuel = fuelAnalysis(expenses);

  const maxTruck = byTruck[0]?.amount ?? 1;
  const maxDriver = byDriver[0]?.amount ?? 1;
  const maxBroker = byBroker[0]?.amount ?? 1;
  const maxExpense = byCategory[0]?.amount ?? 1;

  return (
    <FinancePanelShell
      title="Reports"
      subtitle="P&L, revenue mix, expense breakdown, and per-mile economics."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Revenue (MTD)", value: pl.revenue, tone: "success" as const },
          { label: "Expenses (MTD)", value: pl.expenses, tone: "warning" as const },
          { label: "Gross Profit", value: pl.grossProfit, tone: "info" as const },
          {
            label: "Net Profit",
            value: pl.netProfit,
            tone: pl.netProfit >= 0 ? ("success" as const) : ("critical" as const),
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]"
          >
            <p className="text-[12px] font-medium text-slate-500">{card.label}</p>
            <p
              className={`mt-1 text-[20px] font-bold tabular-nums ${CARRIEROS_COLORS[card.tone].text}`}
            >
              {formatFinanceMoney(card.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Revenue / Mile", value: `$${rpm.toFixed(2)}` },
          { label: "Cost / Mile", value: `$${cpm.toFixed(2)}` },
          {
            label: "Fuel Analysis",
            value: `${formatFinanceMoney(fuel.total)} · ${fuel.trips} fills`,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-[14px] bg-white px-4 py-3 ring-1 ring-[#EAEAEA]"
          >
            <p className="text-[12px] font-medium text-slate-500">{card.label}</p>
            <p className="mt-1 text-[16px] font-bold tabular-nums text-slate-950">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ReportCard title="Revenue by Truck">
          {byTruck.slice(0, 6).map((row) => (
            <MetricBar
              key={row.label}
              label={row.label}
              valueLabel={formatFinanceMoney(row.amount)}
              percent={(row.amount / maxTruck) * 100}
              tone="info"
            />
          ))}
        </ReportCard>

        <ReportCard title="Revenue by Driver">
          {byDriver.slice(0, 6).map((row) => (
            <MetricBar
              key={row.label}
              label={row.label}
              valueLabel={formatFinanceMoney(row.amount)}
              percent={(row.amount / maxDriver) * 100}
              tone="success"
            />
          ))}
        </ReportCard>

        <ReportCard title="Revenue by Broker">
          {byBroker.slice(0, 6).map((row) => (
            <MetricBar
              key={row.label}
              label={row.label}
              valueLabel={formatFinanceMoney(row.amount)}
              percent={(row.amount / maxBroker) * 100}
              tone="info"
            />
          ))}
        </ReportCard>

        <ReportCard title="Expense by Category">
          {byCategory.slice(0, 8).map((row) => (
            <MetricBar
              key={row.category}
              label={row.label}
              valueLabel={formatFinanceMoney(row.amount)}
              percent={(row.amount / maxExpense) * 100}
              tone="warning"
            />
          ))}
        </ReportCard>
      </div>
    </FinancePanelShell>
  );
}

function ReportCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[16px] bg-[#F8FAFC] p-4 ring-1 ring-[#EAEAEA]">
      <p className="mb-3 text-[14px] font-semibold text-slate-900">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
