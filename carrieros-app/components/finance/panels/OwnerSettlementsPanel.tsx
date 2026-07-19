"use client";

import FinancePanelShell, {
  FinanceEmpty,
} from "@/components/finance/FinancePanelShell";
import FinanceStatusBadge from "@/components/finance/FinanceStatusBadge";
import { formatFinanceMoney } from "@/lib/finance/finance-board";
import type { OwnerSettlement } from "@/lib/types/finance";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type OwnerSettlementsPanelProps = {
  settlements: OwnerSettlement[];
};

export default function OwnerSettlementsPanel({
  settlements,
}: OwnerSettlementsPanelProps) {
  if (settlements.length === 0) {
    return (
      <FinanceEmpty
        title="No owner settlements"
        description="Weekly and monthly truck settlements will appear here."
      />
    );
  }

  const totals = {
    revenue: settlements.reduce((s, o) => s + o.revenue, 0),
    expenses: settlements.reduce((s, o) => s + o.expenses, 0),
    profit: settlements.reduce((s, o) => s + o.profit, 0),
  };

  return (
    <FinancePanelShell
      title="Owner Settlements"
      subtitle="Truck revenue, expenses, and profit — weekly or monthly."
    >
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Revenue", value: totals.revenue, tone: "info" as const },
          {
            label: "Expenses",
            value: totals.expenses,
            tone: "disabled" as const,
          },
          {
            label: "Profit",
            value: totals.profit,
            tone: totals.profit >= 0 ? ("success" as const) : ("critical" as const),
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]"
          >
            <p className="text-[12px] font-medium text-slate-500">{card.label}</p>
            <p
              className={`mt-1 text-[18px] font-bold tabular-nums ${CARRIEROS_COLORS[card.tone].text}`}
            >
              {formatFinanceMoney(card.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {settlements.map((row) => (
          <article
            key={row.id}
            className="flex flex-wrap items-center gap-3 rounded-[14px] bg-white px-4 py-4 ring-1 ring-[#EAEAEA] sm:flex-nowrap"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[15px] font-semibold text-slate-950">
                  Unit {row.truckUnit}
                </p>
                <FinanceStatusBadge
                  label={row.status === "settled" ? "Settled" : "Pending"}
                  tone={row.status === "settled" ? "success" : "warning"}
                />
                <span className="rounded-full bg-[#F8FAFC] px-2.5 py-1 text-[11px] font-semibold capitalize text-slate-600 ring-1 ring-[#EAEAEA]">
                  {row.period}
                </span>
              </div>
              <p className="mt-0.5 text-[13px] text-slate-500">
                {row.ownerName} · {row.periodLabel}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-right">
              <div>
                <p className="text-[11px] font-medium text-slate-500">Revenue</p>
                <p className="text-[14px] font-bold tabular-nums text-slate-950">
                  {formatFinanceMoney(row.revenue)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500">Expenses</p>
                <p className="text-[14px] font-bold tabular-nums text-slate-950">
                  {formatFinanceMoney(row.expenses)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500">Profit</p>
                <p
                  className={`text-[14px] font-bold tabular-nums ${
                    row.profit >= 0
                      ? CARRIEROS_COLORS.success.text
                      : CARRIEROS_COLORS.critical.text
                  }`}
                >
                  {formatFinanceMoney(row.profit)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </FinancePanelShell>
  );
}
