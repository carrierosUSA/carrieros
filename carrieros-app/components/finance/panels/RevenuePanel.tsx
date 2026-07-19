"use client";

import FinancePanelShell, {
  FinanceEmpty,
} from "@/components/finance/FinancePanelShell";
import { RevenueStatusBadge } from "@/components/finance/FinanceStatusBadge";
import { formatFinanceMoney } from "@/lib/finance/finance-board";
import type { RevenueRecord } from "@/lib/types/finance";
import { REVENUE_STATUS_LABELS } from "@/lib/types/finance";

type RevenuePanelProps = {
  revenue: RevenueRecord[];
};

export default function RevenuePanel({ revenue }: RevenuePanelProps) {
  if (revenue.length === 0) {
    return (
      <FinanceEmpty
        title="No revenue yet"
        description="Completed loads will appear here automatically."
      />
    );
  }

  const totals = {
    pending: revenue.filter((r) => r.status === "pending").length,
    invoiced: revenue.filter((r) => r.status === "invoiced").length,
    paid: revenue.filter((r) => r.status === "paid").length,
    overdue: revenue.filter((r) => r.status === "overdue").length,
  };

  return (
    <FinancePanelShell
      title="Revenue"
      subtitle="Auto-created from completed loads — pending through paid."
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          Object.keys(totals) as Array<keyof typeof totals>
        ).map((key) => (
          <div
            key={key}
            className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]"
          >
            <p className="text-[12px] font-medium text-slate-500">
              {REVENUE_STATUS_LABELS[key]}
            </p>
            <p className="mt-1 text-[20px] font-bold tabular-nums text-slate-950">
              {totals[key]}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {revenue.map((row) => (
          <article
            key={row.id}
            className="flex flex-wrap items-center gap-3 rounded-[14px] bg-white px-4 py-3.5 ring-1 ring-[#EAEAEA] sm:flex-nowrap"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[15px] font-semibold text-slate-950">
                  {row.loadReference}
                </p>
                <RevenueStatusBadge status={row.status} />
              </div>
              <p className="mt-0.5 text-[13px] text-slate-500">
                {row.brokerName}
                {row.driverName ? ` · ${row.driverName}` : ""}
                {row.truckUnit ? ` · Unit ${row.truckUnit}` : ""}
                {` · ${row.miles.toLocaleString()} mi`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[16px] font-bold tabular-nums text-slate-950">
                {formatFinanceMoney(row.amount)}
              </p>
              <p className="text-[12px] font-medium text-slate-500">
                Delivered {row.deliveredAt}
              </p>
            </div>
          </article>
        ))}
      </div>
    </FinancePanelShell>
  );
}
