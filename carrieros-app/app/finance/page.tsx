import Link from "next/link";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import OperationalTable from "@/components/premium/OperationalTable";
import PremiumMetricCard from "@/components/premium/MetricCard";
import PremiumStatusBadge from "@/components/premium/StatusBadge";
import TablePagination from "@/components/premium/TablePagination";
import TableToolbar from "@/components/premium/TableToolbar";
import { getBrokerById } from "@/lib/data/brokers";
import { getCustomerById } from "@/lib/data/customers";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getDocumentService } from "@/lib/services/documents";
import { formatCurrency } from "@/lib/services/loads/load-helpers";
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
    <OperationalPageShell
        title="Finance Alpha"
        subtitle="Minimal alpha view for invoice drafts, ready packets, and payment follow-up."
        eyebrow="Accounting Operations"
      >

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <PremiumMetricCard label="Ready Invoices" value={readyInvoices.length.toString()} detail="Drafted invoices" accent="emerald" />
        <PremiumMetricCard label="Ready Packets" value={readyPackets.length.toString()} detail="Accounting handoff" accent="blue" />
        <PremiumMetricCard label="Payment Watch" value={paymentRows.length.toString()} detail="AR follow-up" accent="amber" />
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
        <TableToolbar
          title="Invoices & Payments"
          resultCount={financeRows.length}
          searchPlaceholder="Search invoice, load, broker..."
          filters={["All", "Ready", "Pending Payment", "Needs Invoice"]}
          activeFilter="All"
          bulkActionLabel="Export"
        />
        <OperationalTable
          rows={financeRows}
          getRowKey={(row) => row.load.id}
          getRowHref={(row) => `/documents/packets/${row.load.id}`}
          emptyTitle="No finance rows yet"
          emptyDescription="Generate invoice drafts from load packets."
          columns={[
            {
              key: "invoice",
              label: "Invoice #",
              render: ({ load, summary }) => (
                <span className="font-semibold text-slate-950">
                  {summary.invoiceDraft?.invoiceNumber ?? `INV-${load.reference}`}
                </span>
              ),
            },
            { key: "load", label: "Load #", render: ({ load }) => load.reference },
            {
              key: "party",
              label: "Broker / Customer",
              render: ({ load }) =>
                load.brokerId
                  ? getBrokerById(load.brokerId)?.name ?? "Unknown broker"
                  : getCustomerById(load.customerId)?.name ?? "Direct customer",
            },
            { key: "rate", label: "Rate", align: "right", render: ({ load }) => formatCurrency(load.rate) },
            { key: "lumper", label: "Lumper", align: "right", render: () => "$0" },
            { key: "detention", label: "Detention", align: "right", render: () => "$0" },
            {
              key: "total",
              label: "Total",
              align: "right",
              render: ({ load }) => (
                <span className="font-semibold text-slate-950">{formatCurrency(load.rate)}</span>
              ),
            },
            {
              key: "payment",
              label: "Payment Status",
              render: ({ load }) => (
                <PremiumStatusBadge
                  label={load.status === "invoiced" ? "Pending payment" : "Needs invoice"}
                  tone={load.status === "invoiced" ? "amber" : "slate"}
                />
              ),
            },
            { key: "due", label: "Due Date", render: ({ load }) => load.deliveryDate },
            { key: "factoring", label: "Factoring", render: () => "Not submitted" },
            {
              key: "actions",
              label: "Actions",
              align: "center",
              render: ({ load }) => (
                <Link href={`/documents/packets/${load.id}`} className="font-semibold text-slate-500">
                  ⋯
                </Link>
              ),
            },
          ]}
        />
        <TablePagination total={financeRows.length} />
      </div>
    </OperationalPageShell>
  );
}
