"use client";

import { useDriverApp } from "@/components/driver-app/DriverAppProvider";
import {
  DmCard,
  DmPrimaryButton,
  DmSectionLabel,
  StatusChip,
  formatMoney,
} from "@/components/driver-mobile/ui";

export default function PayrollSettlements() {
  const { state, requestSettlementApproval } = useDriverApp();

  return (
    <div className="space-y-5 animate-[carrieros-fade-in_0.35s_ease]">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight">Payroll</h2>
        <p className="mt-1 text-[14px] text-[var(--dm-muted)]">
          AI settlement from trips & expenses. Manager approval required before payment.
        </p>
      </div>

      {state.payroll.length === 0 ? (
        <DmCard>
          <p className="text-[15px] font-semibold">No settlements yet</p>
        </DmCard>
      ) : (
        state.payroll.map((p) => (
          <DmCard key={p.id} className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[13px] font-medium text-[var(--dm-muted)]">{p.period}</p>
                <p className="mt-1 text-[28px] font-bold tracking-tight">
                  {formatMoney(p.netPay)}
                </p>
                <p className="text-[13px] text-[var(--dm-muted)]">
                  Gross {formatMoney(p.grossPay)}
                </p>
              </div>
              <StatusChip
                label={p.approvalStatus.replace(/_/g, " ")}
                tone={
                  p.approvalStatus === "paid"
                    ? "success"
                    : p.approvalStatus === "pending_manager"
                      ? "warning"
                      : "info"
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[13px]">
              <Stat label="Loaded mi" value={String(p.loadedMiles)} />
              <Stat label="Empty mi" value={String(p.emptyMiles)} />
              <Stat label="Stop pay" value={formatMoney(p.stopPay)} />
              <Stat label="Detention" value={formatMoney(p.detentionPay)} />
              <Stat label="Bonuses" value={formatMoney(p.bonuses)} />
              <Stat label="Per diem" value={formatMoney(p.perDiem)} />
              <Stat label="Reimburse" value={formatMoney(p.reimbursements)} />
              <Stat label="Advances" value={formatMoney(p.advances)} />
              <Stat label="Deductions" value={formatMoney(p.deductions)} />
              <Stat label="Layover" value={formatMoney(p.layoverPay)} />
            </div>

            <DmSectionLabel>Line items</DmSectionLabel>
            <div className="space-y-2">
              {p.lines.map((line) => (
                <div
                  key={line.id}
                  className="flex items-center justify-between text-[14px]"
                >
                  <span className="text-[var(--dm-muted)]">{line.label}</span>
                  <span className="font-semibold">{formatMoney(line.amount)}</span>
                </div>
              ))}
            </div>

            {p.managerNote && (
              <p className="rounded-2xl bg-orange-500/12 px-3 py-2.5 text-[13px] font-medium text-[var(--color-warning)]">
                {p.managerNote}
              </p>
            )}

            {p.approvalStatus === "draft" && (
              <DmPrimaryButton onClick={() => requestSettlementApproval(p.id)}>
                Submit for manager approval
              </DmPrimaryButton>
            )}

            <p className="text-[12px] text-[var(--dm-muted)]">
              Settlement summary UI — PDF export architecture-ready (demo).
            </p>
          </DmCard>
        ))
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--dm-elevated)] px-3 py-2">
      <p className="text-[11px] font-medium text-[var(--dm-muted)]">{label}</p>
      <p className="text-[14px] font-semibold">{value}</p>
    </div>
  );
}
