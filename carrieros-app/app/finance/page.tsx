import Link from "next/link";
import Card from "@/components/Card";
import MetricCard from "@/components/MetricCard";
import PageHeader from "@/components/PageHeader";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getDocumentService } from "@/lib/services/documents";
import { formatCurrency, formatLoadLane } from "@/lib/services/loads/load-helpers";
import { getLoadService } from "@/lib/services/loads";

export default async function FinancePage() {
  const tenantId = getActiveTenantId();
  const loadService = getLoadService();
  const documentService = getDocumentService();
  const loads = await loadService.listLoads(tenantId);
  const financeRows = await Promise.all(
    loads.map(async (load) => ({
      load,
      summary: await documentService.getPacketSummary(tenantId, load.id),
    })),
  );
  const readyInvoices = financeRows.filter((row) => row.summary.invoiceDraft);
  const readyPackets = financeRows.filter((row) => row.summary.readyToSend);
  const paymentRows = financeRows.filter((row) =>
    ["delivered", "invoiced"].includes(row.load.status),
  );

  return (
    <>
      <PageHeader
        title="Finance Alpha"
        subtitle="Minimal alpha view for invoice drafts, ready packets, and payment follow-up."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <MetricCard title="Ready Invoices" value={readyInvoices.length.toString()} />
        <MetricCard title="Ready Packets" value={readyPackets.length.toString()} />
        <MetricCard title="Payment Watch" value={paymentRows.length.toString()} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card>
          <h2 className="font-semibold text-zinc-100">Ready Invoices</h2>
          <div className="mt-4 space-y-3">
            {readyInvoices.length ? (
              readyInvoices.map(({ load, summary }) => (
                <Link
                  key={load.id}
                  href={`/documents/packets/${load.id}`}
                  className="block rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-zinc-700"
                >
                  <p className="font-semibold text-zinc-100">
                    {summary.invoiceDraft?.invoiceNumber}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {load.reference} · {formatCurrency(summary.invoiceDraft?.amount ?? load.rate)}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-zinc-400">
                No invoice drafts yet. Generate one from a load packet.
              </p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-zinc-100">Ready Packets</h2>
          <div className="mt-4 space-y-3">
            {readyPackets.length ? (
              readyPackets.map(({ load, summary }) => (
                <Link
                  key={load.id}
                  href={`/documents/packets/${load.id}/send`}
                  className="block rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-zinc-700"
                >
                  <p className="font-semibold text-zinc-100">{load.reference}</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {summary.packet?.generatedPdfName ?? "Packet ready for prep"}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-zinc-400">
                No packets are ready to send yet.
              </p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-zinc-100">Payment Status</h2>
          <div className="mt-4 space-y-3">
            {paymentRows.length ? (
              paymentRows.map(({ load }) => (
                <Link
                  key={load.id}
                  href={`/loads/${load.id}`}
                  className="block rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-zinc-700"
                >
                  <p className="font-semibold text-zinc-100">{load.reference}</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {formatLoadLane(load)}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-blue-400">
                    {load.status === "invoiced" ? "Pending payment" : "Needs invoice"}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-zinc-400">
                No delivered or invoiced loads are ready for payment follow-up.
              </p>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
