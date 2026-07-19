"use client";

import FinancePanelShell, {
  FinanceEmpty,
} from "@/components/finance/FinancePanelShell";
import { BrokerPaymentStatusBadge } from "@/components/finance/FinanceStatusBadge";
import { formatFinanceMoney } from "@/lib/finance/finance-board";
import type { BrokerPaymentRecord } from "@/lib/types/finance";

type BrokerPaymentsPanelProps = {
  payments: BrokerPaymentRecord[];
  onRecordPayment: (payment: BrokerPaymentRecord) => void;
};

export default function BrokerPaymentsPanel({
  payments,
  onRecordPayment,
}: BrokerPaymentsPanelProps) {
  if (payments.length === 0) {
    return (
      <FinanceEmpty
        title="No broker payments"
        description="Outstanding and received payments will show here."
      />
    );
  }

  return (
    <FinancePanelShell
      title="Broker Payments"
      subtitle="Invoice amounts, due dates, quick pay, factoring, and late fees."
    >
      <div className="space-y-2">
        {payments.map((payment) => {
          const balance =
            payment.invoiceAmount - payment.amountReceived + payment.lateFees;
          const canRecord =
            payment.status === "outstanding" ||
            payment.status === "overdue" ||
            payment.status === "partial";

          return (
            <article
              key={payment.id}
              className="rounded-[14px] bg-white px-4 py-4 ring-1 ring-[#EAEAEA]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[15px] font-semibold text-slate-950">
                      {payment.brokerName}
                    </p>
                    <BrokerPaymentStatusBadge status={payment.status} />
                  </div>
                  <p className="mt-0.5 text-[13px] text-slate-500">
                    {payment.invoiceNumber} · Due {payment.dueDate} ·{" "}
                    {payment.paymentTerms}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {payment.quickPay ? (
                      <span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-semibold text-[#2563EB]">
                        Quick Pay
                      </span>
                    ) : null}
                    {payment.factoring ? (
                      <span className="rounded-full bg-[#F8FAFC] px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-[#EAEAEA]">
                        Factoring
                      </span>
                    ) : null}
                    {payment.lateFees > 0 ? (
                      <span className="rounded-full bg-[#FEF2F2] px-2.5 py-1 text-[11px] font-semibold text-[#DC2626]">
                        Late fees {formatFinanceMoney(payment.lateFees)}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-medium text-slate-500">
                    Invoice
                  </p>
                  <p className="text-[16px] font-bold tabular-nums text-slate-950">
                    {formatFinanceMoney(payment.invoiceAmount)}
                  </p>
                  <p className="mt-1 text-[12px] font-medium text-slate-500">
                    Received {formatFinanceMoney(payment.amountReceived)}
                  </p>
                  {canRecord ? (
                    <p className="text-[13px] font-semibold text-[#EA580C]">
                      Balance {formatFinanceMoney(balance)}
                    </p>
                  ) : null}
                </div>
              </div>
              {canRecord ? (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => onRecordPayment(payment)}
                    className="inline-flex h-8 items-center rounded-full bg-[#2563EB] px-3 text-[12px] font-semibold text-white hover:bg-[#1D4ED8]"
                  >
                    Record Payment
                  </button>
                </div>
              ) : payment.receivedAt ? (
                <p className="mt-3 text-[12px] font-medium text-slate-500">
                  Received {payment.receivedAt}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </FinancePanelShell>
  );
}
