import { generateInvoiceDraftAction } from "@/app/documents/actions";
import { formatCurrency } from "@/lib/services/loads/load-helpers";
import type { InvoiceDraft, Load } from "@/lib/types";

type InvoiceDraftPanelProps = {
  load: Load;
  invoiceDraft?: InvoiceDraft;
  billTo: string;
};

export default function InvoiceDraftPanel({
  load,
  invoiceDraft,
  billTo,
}: InvoiceDraftPanelProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-400">Invoice Draft</p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-100">
            {invoiceDraft?.invoiceNumber ?? `INV-${load.reference}`}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Generated from load rate, customer/broker, lane, and delivery data.
          </p>
        </div>

        <form action={generateInvoiceDraftAction.bind(null, load.id)}>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            {invoiceDraft ? "Regenerate Draft" : "Generate Invoice Draft"}
          </button>
        </form>
      </div>

      <div className="mt-6 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
        <p>
          <strong className="text-zinc-100">Bill To:</strong>{" "}
          {invoiceDraft?.billTo ?? billTo}
        </p>
        <p>
          <strong className="text-zinc-100">Amount:</strong>{" "}
          {formatCurrency(invoiceDraft?.amount ?? load.rate)}
        </p>
        <p>
          <strong className="text-zinc-100">Status:</strong>{" "}
          {invoiceDraft?.status ?? "Not generated"}
        </p>
        <p>
          <strong className="text-zinc-100">Mock PDF:</strong>{" "}
          {invoiceDraft ? `${invoiceDraft.invoiceNumber}.pdf` : "Pending"}
        </p>
      </div>
    </section>
  );
}
