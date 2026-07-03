import NovaAlert from "@/components/NovaAlert";
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
import { getLoadService } from "@/lib/services/loads";

export default async function DocumentsPage() {
  const tenantId = getActiveTenantId();
  const loadService = getLoadService();
  const documentService = getDocumentService();
  const loads = await loadService.listLoads(tenantId);
  const summaries = await Promise.all(
    loads.map(async (load) => ({
      load,
      summary: await documentService.getPacketSummary(tenantId, load.id),
    })),
  );
  const readyPackets = summaries.filter((entry) => entry.summary.readyToSend);
  const missingDocs = summaries.reduce(
    (total, entry) => total + entry.summary.missingRequired.length,
    0,
  );
  const firstMissing = summaries.find((entry) => entry.summary.nextMissing);

  return (
    <OperationalPageShell
        title="Documents"
        subtitle="Capture, scan, sequence, and prepare invoice packets for the carrier business."
        eyebrow="Document Operations"
      >

      {firstMissing?.summary.nextMissing ? (
        <NovaAlert
          message={`Missing ${firstMissing.summary.nextMissing.label}.`}
          actionHref={`/loads/${firstMissing.load.id}/documents`}
          actionLabel="Show Me"
        />
      ) : (
        <NovaAlert message="All visible required packet documents are ready." />
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <PremiumMetricCard label="Load Packets" value={summaries.length.toString()} detail="Tracked packets" accent="blue" />
        <PremiumMetricCard label="Ready Packets" value={readyPackets.length.toString()} detail="Ready for handoff" accent="emerald" />
        <PremiumMetricCard label="Missing Docs" value={missingDocs.toString()} detail="Need capture" accent="amber" />
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
        <TableToolbar
          title="Document Packets"
          resultCount={summaries.length}
          searchPlaceholder="Search load, customer, broker..."
          filters={["All", "Missing", "Ready", "Invoiced"]}
          activeFilter="All"
          bulkActionLabel="Prepare handoff"
        />
        <OperationalTable
          rows={summaries}
          getRowKey={(row) => row.load.id}
          getRowHref={(row) => `/documents/packets/${row.load.id}`}
          emptyTitle="No load packets yet"
          emptyDescription="Create a load first, then capture documents from the load detail page."
          columns={[
            {
              key: "load",
              label: "Load #",
              render: ({ load }) => (
                <span className="font-semibold text-slate-950">{load.reference}</span>
              ),
            },
            {
              key: "customer",
              label: "Customer",
              render: ({ load }) => getCustomerById(load.customerId)?.name ?? "Unknown",
            },
            {
              key: "broker",
              label: "Broker",
              render: ({ load }) =>
                load.brokerId ? getBrokerById(load.brokerId)?.name ?? "Unknown" : "Direct",
            },
            {
              key: "missing",
              label: "Missing Docs",
              render: ({ summary }) =>
                summary.missingRequired.length
                  ? summary.missingRequired.map((item) => item.label).join(", ")
                  : "None",
            },
            {
              key: "uploaded",
              label: "Uploaded Docs",
              render: ({ summary }) => summary.documents.length.toString(),
            },
            {
              key: "packet",
              label: "Packet Status",
              render: ({ summary }) => (
                <PremiumStatusBadge
                  label={summary.readyToSend ? "Ready" : "Missing"}
                  tone={summary.readyToSend ? "green" : "amber"}
                />
              ),
            },
            {
              key: "invoice",
              label: "Invoice Status",
              render: ({ summary }) => (
                <PremiumStatusBadge
                  label={summary.invoiceDraft?.status ?? "Not generated"}
                  tone={summary.invoiceDraft ? "green" : "slate"}
                />
              ),
            },
            { key: "updated", label: "Last Updated", render: ({ load }) => load.updatedAt.slice(0, 10) },
            { key: "actions", label: "Actions", align: "center", render: () => "⋯" },
          ]}
        />
        <TablePagination total={summaries.length} />
      </div>
    </OperationalPageShell>
  );
}
