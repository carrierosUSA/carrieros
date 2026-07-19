import { formatCurrency } from "@/lib/services/fleet/fleet-helpers";
import type { TruckExpense } from "@/lib/types";

type TruckExpensesTabProps = {
  expenses: TruckExpense[];
};

export default function TruckExpensesTab({ expenses }: TruckExpensesTabProps) {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]">
        <p className="text-[12px] font-medium text-slate-500">Period total</p>
        <p className="mt-1 text-[22px] font-bold tabular-nums text-slate-950">
          {formatCurrency(total)}
        </p>
      </div>

      <section className="rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA]">
        <h2 className="text-[15px] font-semibold text-slate-950">Expenses</h2>
        {expenses.length === 0 ? (
          <p className="mt-3 text-[14px] text-slate-500">No expenses recorded.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {expenses.map((expense) => (
              <li
                key={expense.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-[#F8FAFC] px-3 py-3 ring-1 ring-[#EAEAEA]"
              >
                <div>
                  <p className="text-[13px] font-medium text-slate-400">
                    {expense.category}
                  </p>
                  <p className="text-[14px] font-semibold text-slate-900">
                    {expense.description}
                  </p>
                  <p className="text-[12px] text-slate-500">{expense.date}</p>
                </div>
                <p className="text-[14px] font-bold text-slate-950">
                  {formatCurrency(expense.amount)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
