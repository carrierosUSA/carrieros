"use client";

import Link from "next/link";
import FinancePanelShell, {
  FinanceEmpty,
} from "@/components/finance/FinancePanelShell";
import { PayrollStatusBadge } from "@/components/finance/FinanceStatusBadge";
import { formatFinanceMoney } from "@/lib/finance/finance-board";
import type { DriverPayrollSettlement } from "@/lib/types/finance";
import { DRIVER_PAY_METHOD_LABELS } from "@/lib/types/finance";

type DriverPayrollPanelProps = {
  settlements: DriverPayrollSettlement[];
  onRunPayroll: () => void;
};

export default function DriverPayrollPanel({
  settlements,
  onRunPayroll,
}: DriverPayrollPanelProps) {
  if (settlements.length === 0) {
    return (
      <FinanceEmpty
        title="No payroll settlements"
        description="Driver settlements will appear when payroll is run."
      />
    );
  }

  const due = settlements
    .filter((s) => s.status === "ready" || s.status === "draft")
    .reduce((sum, s) => sum + s.netPay, 0);

  return (
    <FinancePanelShell
      title="Driver Payroll"
      subtitle="CPM, percentage, hourly, salary — plus bonus, detention, advances, and deductions."
      action={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/payroll"
            className="inline-flex h-9 items-center rounded-full bg-[#F8FAFC] px-4 text-[13px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA] hover:bg-white"
          >
            Open Payroll Page
          </Link>
          <button
            type="button"
            onClick={onRunPayroll}
            className="inline-flex h-9 items-center rounded-full bg-[#2563EB] px-4 text-[13px] font-semibold text-white hover:bg-[#1D4ED8]"
          >
            Run Payroll
          </button>
        </div>
      }
    >
      <div className="rounded-[14px] bg-[#EFF6FF] px-4 py-3 ring-1 ring-[#BFDBFE]">
        <p className="text-[13px] font-medium text-slate-600">Payroll due</p>
        <p className="text-[20px] font-bold tabular-nums text-[#2563EB]">
          {formatFinanceMoney(due)}
        </p>
      </div>

      <div className="space-y-2">
        {settlements.map((row) => (
          <article
            key={row.id}
            className="rounded-[14px] bg-white px-4 py-4 ring-1 ring-[#EAEAEA]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[15px] font-semibold text-slate-950">
                    {row.driverName}
                  </p>
                  <PayrollStatusBadge status={row.status} />
                </div>
                <p className="mt-0.5 text-[13px] text-slate-500">
                  {row.period} · {DRIVER_PAY_METHOD_LABELS[row.payMethod]} ·{" "}
                  {row.rateLabel}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[12px] font-medium text-slate-500">Net pay</p>
                <p className="text-[18px] font-bold tabular-nums text-slate-950">
                  {formatFinanceMoney(row.netPay)}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
              {[
                { label: "Miles", value: row.miles.toLocaleString() },
                { label: "Base", value: formatFinanceMoney(row.basePay) },
                { label: "Bonus", value: formatFinanceMoney(row.bonus) },
                { label: "Detention", value: formatFinanceMoney(row.detention) },
                { label: "Layover", value: formatFinanceMoney(row.layover) },
                {
                  label: "Lumper",
                  value: formatFinanceMoney(row.lumperReimbursement),
                },
                {
                  label: "Fuel advance",
                  value: formatFinanceMoney(row.fuelAdvance),
                },
                {
                  label: "Deductions",
                  value: formatFinanceMoney(row.deductions),
                },
                { label: "Gross", value: formatFinanceMoney(row.grossPay) },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[10px] bg-[#F8FAFC] px-3 py-2"
                >
                  <p className="text-[11px] font-medium text-slate-500">
                    {item.label}
                  </p>
                  <p className="text-[13px] font-semibold tabular-nums text-slate-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </FinancePanelShell>
  );
}
