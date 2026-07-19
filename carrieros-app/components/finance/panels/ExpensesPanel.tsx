"use client";

import FinancePanelShell, {
  FinanceEmpty,
  MetricBar,
} from "@/components/finance/FinancePanelShell";
import {
  expenseByCategory,
  formatFinanceMoney,
} from "@/lib/finance/finance-board";
import type { ExpenseRecord } from "@/lib/types/finance";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/types/finance";

type ExpensesPanelProps = {
  expenses: ExpenseRecord[];
  onAddExpense: () => void;
};

export default function ExpensesPanel({
  expenses,
  onAddExpense,
}: ExpensesPanelProps) {
  if (expenses.length === 0) {
    return (
      <FinanceEmpty
        title="No expenses recorded"
        description="Add fuel, maintenance, and operating costs to track spend."
      />
    );
  }

  const byCategory = expenseByCategory(expenses);
  const max = byCategory[0]?.amount ?? 1;
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <FinancePanelShell
      title="Expenses"
      subtitle="Fuel, maintenance, and operating costs across the fleet."
      action={
        <button
          type="button"
          onClick={onAddExpense}
          className="inline-flex h-9 items-center rounded-full bg-[#2563EB] px-4 text-[13px] font-semibold text-white hover:bg-[#1D4ED8]"
        >
          + Add Expense
        </button>
      }
    >
      <div className="rounded-[16px] bg-[#F8FAFC] p-4 ring-1 ring-[#EAEAEA]">
        <div className="mb-4 flex items-baseline justify-between">
          <p className="text-[13px] font-medium text-slate-500">By category</p>
          <p className="text-[16px] font-bold tabular-nums text-slate-950">
            {formatFinanceMoney(total)}
          </p>
        </div>
        <div className="space-y-3">
          {byCategory.slice(0, 8).map((row) => (
            <MetricBar
              key={row.category}
              label={row.label}
              valueLabel={formatFinanceMoney(row.amount)}
              percent={(row.amount / max) * 100}
              tone={
                row.category === "fuel"
                  ? "warning"
                  : row.category === "maintenance" || row.category === "repairs"
                    ? "critical"
                    : "info"
              }
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {expenses.map((expense) => (
          <article
            key={expense.id}
            className="flex flex-wrap items-center gap-3 rounded-[14px] bg-white px-4 py-3.5 ring-1 ring-[#EAEAEA] sm:flex-nowrap"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-slate-950">
                {expense.description}
              </p>
              <p className="mt-0.5 text-[13px] text-slate-500">
                {EXPENSE_CATEGORY_LABELS[expense.category]}
                {expense.vendor ? ` · ${expense.vendor}` : ""}
                {expense.truckUnit ? ` · Unit ${expense.truckUnit}` : ""}
                {expense.driverName ? ` · ${expense.driverName}` : ""}
                {!expense.receiptOnFile ? " · No receipt" : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[16px] font-bold tabular-nums text-slate-950">
                {formatFinanceMoney(expense.amount)}
              </p>
              <p className="text-[12px] font-medium text-slate-500">
                {expense.occurredAt}
              </p>
            </div>
          </article>
        ))}
      </div>
    </FinancePanelShell>
  );
}
