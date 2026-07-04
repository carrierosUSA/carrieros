import Link from "next/link";
import DetailSlideOver, { DetailGrid, DetailSection } from "@/components/premium/DetailSlideOver";
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

type FinancePageProps = {
  searchParams: Promise<{ details?: string }>;
};

export default async function FinancePage({ searchParams }: FinancePageProps) {
  const params = await searchParams;
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
  const accountingSections = [
    "Invoices",
    "Payments",
    "Factoring",
    "Outstanding AR",
    "Payroll",
    "Settlements",
    "1099",
    "W2",
    "Year-End Reports",
    "Cash Flow",
    "Profit",
    "Expenses",
  ];
  const selectedInvoice = params.details
    ? financeRows.find((row) => row.load.id === params.details)
    : undefined;
  const selectedParty = selectedInvoice
    ? selectedInvoice.load.brokerId
      ? getBrokerById(selectedInvoice.load.brokerId)?.name ?? "Unknown broker"
      : getCustomerById(selectedInvoice.load.customerId)?.name ?? "Direct customer"
    : undefined;

  return (
    <OperationalPageShell
        title="Finance Alpha"
        subtitle="Minimal alpha view for invoice drafts, ready packets, and payment follow-up."
        eyebrow="Accounting Operations"
      >

      <div className="grid gap-3 sm:grid-cols-3">
        <PremiumMetricCard label="Ready Invoices" value={readyInvoices.length.toString()} detail="Drafted invoices" accent="emerald" />
        <PremiumMetricCard label="Ready Packets" value={readyPackets.length.toString()} detail="Accounting handoff" accent="blue" />
        <PremiumMetricCard label="Payment Watch" value={paymentRows.length.toString()} detail="AR follow-up" accent="amber" />
      </div>

      <div className="grid gap-2 rounded-[14px] border border-[#E5E7EB] bg-[#F8F9FB] p-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {accountingSections.map((section) => (
          <div
            key={section}
            className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-semibold text-slate-700"
          >
            {section}
          </div>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
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
          getRowHref={(row) => `/finance?details=${row.load.id}`}
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
              render: () => <span className="font-semibold text-slate-500">Open</span>,
            },
          ]}
        />
        <TablePagination total={financeRows.length} />
      </div>
      {selectedInvoice ? (
        <DetailSlideOver
          title={selectedInvoice.summary.invoiceDraft?.invoiceNumber ?? `INV-${selectedInvoice.load.reference}`}
          subtitle={`${selectedParty} · ${formatCurrency(selectedInvoice.summary.invoiceDraft?.amount ?? selectedInvoice.load.rate)}`}
          closeHref="/finance"
        >
          <DetailSection title="Invoice Details">
            <DetailGrid
              items={[
                { label: "Broker / Customer", value: selectedParty },
                { label: "Amount", value: formatCurrency(selectedInvoice.summary.invoiceDraft?.amount ?? selectedInvoice.load.rate) },
                { label: "Load", value: selectedInvoice.load.reference },
                { label: "Status", value: selectedInvoice.load.status === "invoiced" ? "Pending payment" : "Needs invoice" },
                { label: "Due Date", value: selectedInvoice.load.deliveryDate },
                { label: "Factoring", value: "Not submitted" },
              ]}
            />
          </DetailSection>
          <DetailSection title="Payment History">
            <div className="space-y-2 text-sm text-slate-700">
              <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2">Invoice draft prepared</div>
              <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2">Packet status: {selectedInvoice.summary.readyToSend ? "Ready to send" : "Missing documents"}</div>
              <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2">Payment status: Pending</div>
            </div>
          </DetailSection>
          <DetailSection title="Documents & Notes">
            <p className="text-sm leading-6 text-slate-600">
              Connect invoice, packet, POD, rate confirmation, factoring, and payment notes from one finance detail view.
            </p>
            <Link href={`/documents/packets/${selectedInvoice.load.id}`} className="mt-3 inline-block text-sm font-semibold text-blue-600">
              Open packet
            </Link>
          </DetailSection>
        </DetailSlideOver>
      ) : null}
    </OperationalPageShell>
  );
}
