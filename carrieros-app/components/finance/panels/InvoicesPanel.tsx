"use client";

import FinancePanelShell, {
  FinanceEmpty,
} from "@/components/finance/FinancePanelShell";
import { InvoiceStatusBadge } from "@/components/finance/FinanceStatusBadge";
import { formatFinanceMoney } from "@/lib/finance/finance-board";
import type { FinanceInvoice, RevenueRecord } from "@/lib/types/finance";

type InvoicesPanelProps = {
  invoices: FinanceInvoice[];
  missingLoads: RevenueRecord[];
  onCreateInvoice: () => void;
  onAiGenerate: () => void;
  onEmail: (invoice: FinanceInvoice) => void;
  onDownloadPdf: (invoice: FinanceInvoice) => void;
  onSendReminder: (invoice: FinanceInvoice) => void;
};

export default function InvoicesPanel({
  invoices,
  missingLoads,
  onCreateInvoice,
  onAiGenerate,
  onEmail,
  onDownloadPdf,
  onSendReminder,
}: InvoicesPanelProps) {
  return (
    <FinancePanelShell
      title="Invoice Center"
      subtitle="Create, email, and track payment status — with reminder history."
      action={
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onAiGenerate}
            disabled={missingLoads.length === 0}
            title={
              missingLoads.length === 0
                ? "No delivered loads missing invoices"
                : `Generate invoices for ${missingLoads.length} load${missingLoads.length === 1 ? "" : "s"}`
            }
            className="inline-flex h-9 items-center rounded-full bg-[#2563EB] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            ✦ AI Invoice Generator
          </button>
          <button
            type="button"
            onClick={onCreateInvoice}
            className="inline-flex h-9 items-center rounded-full bg-[#F8FAFC] px-4 text-[13px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA] hover:bg-white"
          >
            + Create Invoice
          </button>
        </div>
      }
    >
      {missingLoads.length > 0 ? (
        <div className="rounded-[14px] bg-[#EFF6FF] px-4 py-3 ring-1 ring-[#BFDBFE]">
          <p className="text-[14px] font-semibold text-[#2563EB]">
            {missingLoads.length} delivered load
            {missingLoads.length === 1 ? "" : "s"} ready for invoicing
          </p>
          <p className="mt-0.5 text-[13px] text-slate-600">
            {missingLoads
              .slice(0, 4)
              .map((m) => m.loadReference)
              .join(", ")}
            {missingLoads.length > 4 ? ` +${missingLoads.length - 4} more` : ""}
          </p>
        </div>
      ) : null}

      {invoices.length === 0 ? (
        <FinanceEmpty
          title="No invoices yet"
          description="Create an invoice or run the AI generator on delivered loads."
        />
      ) : (
        <div className="space-y-2">
          {invoices.map((invoice) => (
            <article
              key={invoice.id}
              className="rounded-[14px] bg-white px-4 py-4 ring-1 ring-[#EAEAEA]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[15px] font-semibold text-slate-950">
                      {invoice.invoiceNumber}
                    </p>
                    <InvoiceStatusBadge status={invoice.status} />
                  </div>
                  <p className="mt-0.5 text-[13px] text-slate-500">
                    {invoice.brokerName}
                    {invoice.loadReference ? ` · ${invoice.loadReference}` : ""}
                    {` · Due ${invoice.dueDate}`}
                  </p>
                  {invoice.notes ? (
                    <p className="mt-1 text-[13px] text-slate-500">{invoice.notes}</p>
                  ) : null}
                </div>
                <div className="text-right">
                  <p className="text-[18px] font-bold tabular-nums text-slate-950">
                    {formatFinanceMoney(invoice.amount)}
                  </p>
                  {invoice.amountPaid > 0 && invoice.amountPaid < invoice.amount ? (
                    <p className="text-[12px] font-medium text-slate-500">
                      Paid {formatFinanceMoney(invoice.amountPaid)}
                    </p>
                  ) : null}
                </div>
              </div>

              {invoice.reminders.length > 0 ? (
                <div className="mt-3 space-y-1 border-t border-[#F1F5F9] pt-3">
                  <p className="text-[12px] font-medium uppercase tracking-wide text-slate-400">
                    Reminder history
                  </p>
                  {invoice.reminders.map((rem) => (
                    <p key={rem.id} className="text-[13px] text-slate-600">
                      {rem.sentAt} · {rem.channel} — {rem.note}
                    </p>
                  ))}
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onEmail(invoice)}
                  className="inline-flex h-8 items-center rounded-full bg-[#F8FAFC] px-3 text-[12px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA] hover:bg-white"
                >
                  Email Invoice
                </button>
                <button
                  type="button"
                  onClick={() => onDownloadPdf(invoice)}
                  className="inline-flex h-8 items-center rounded-full bg-[#F8FAFC] px-3 text-[12px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA] hover:bg-white"
                >
                  Download PDF
                </button>
                {(invoice.status === "sent" || invoice.status === "overdue") && (
                  <button
                    type="button"
                    onClick={() => onSendReminder(invoice)}
                    className="inline-flex h-8 items-center rounded-full bg-[#FFF7ED] px-3 text-[12px] font-semibold text-[#EA580C] ring-1 ring-[#FED7AA] hover:bg-white"
                  >
                    Send Reminder
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </FinancePanelShell>
  );
}
