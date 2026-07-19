"use client";

import { useDriverMobile } from "@/components/driver-mobile/DriverMobileProvider";
import {
  DmCard,
  DmSectionLabel,
  StatusChip,
  formatMoney,
} from "@/components/driver-mobile/ui";

export default function PayrollView({ onBack }: { onBack: () => void }) {
  const { state } = useDriverMobile();

  return (
    <div className="space-y-5 animate-[carrieros-fade-in_0.35s_ease]">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-11 items-center text-[14px] font-medium text-[var(--color-info)]"
      >
        ← Profile
      </button>
      <div>
        <h2 className="text-[22px] font-bold tracking-tight">Payroll</h2>
        <p className="mt-1 text-[14px] text-[var(--dm-muted)]">
          Settlements, CPM, and reimbursements.
        </p>
      </div>

      {state.payroll.length === 0 ? (
        <DmCard>
          <p className="text-[15px]">No settlements yet.</p>
        </DmCard>
      ) : (
        state.payroll.map((pay) => (
          <div key={pay.id} className="space-y-3">
            <DmCard>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[13px] font-medium text-[var(--dm-muted)]">{pay.period}</p>
                  <p className="mt-1 text-[28px] font-bold tracking-tight">
                    {formatMoney(pay.netPay)}
                  </p>
                  <p className="text-[13px] text-[var(--dm-muted)]">
                    Gross {formatMoney(pay.grossPay)}
                  </p>
                </div>
                <StatusChip
                  label={pay.status}
                  tone={pay.status === "paid" ? "success" : "warning"}
                />
              </div>
            </DmCard>
            <DmSectionLabel>Breakdown</DmSectionLabel>
            <div className="space-y-2">
              {pay.lines.map((line) => (
                <div
                  key={line.id}
                  className="flex items-center justify-between rounded-[18px] bg-[var(--dm-surface)] px-4 py-3.5"
                >
                  <span className="text-[14px] font-medium">{line.label}</span>
                  <span
                    className={`text-[15px] font-bold ${
                      line.amount < 0 ? "text-[var(--color-critical)]" : ""
                    }`}
                  >
                    {formatMoney(line.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
