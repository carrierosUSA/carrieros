import NovaAlert from "@/components/NovaAlert";
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
import { getLoadService } from "@/lib/services/loads";

type DocumentsPageProps = {
  searchParams: Promise<{ details?: string }>;
};

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const params = await searchParams;
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
  const selectedPacket = params.details
    ? summaries.find((entry) => entry.load.id === params.details)
    : undefined;
  const selectedLoad = selectedPacket?.load;
  const selectedBroker = selectedLoad?.brokerId
    ? getBrokerById(selectedLoad.brokerId)?.name ?? "Unknown"
    : "Direct";
  const selectedCustomer = selectedLoad
    ? getCustomerById(selectedLoad.customerId)?.name ?? "Unknown"
    : undefined;
  const checklist = selectedPacket
    ? [
        ...selectedPacket.summary.documents.map((document) => ({
          label: document.label,
          status: document.status,
          fileName: document.fileName ?? "No file",
        })),
        { label: "Scale Ticket", status: "missing", fileName: "Optional" },
        { label: "Fuel Receipt", status: "missing", fileName: "Optional" },
        { label: "Other Documents", status: "missing", fileName: "Optional" },
      ]
    : [];

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

      <div className="mt-4 overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
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
          getRowHref={(row) => `/documents?details=${row.load.id}`}
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
            { key: "actions", label: "Actions", align: "center", render: () => "Open" },
          ]}
        />
        <TablePagination total={summaries.length} />
      </div>
      {selectedPacket && selectedLoad ? (
        <DetailSlideOver
          title={`Packet ${selectedLoad.reference}`}
          subtitle={`${selectedBroker} · ${selectedCustomer}`}
          closeHref="/documents"
        >
          <DetailSection title="Header">
            <DetailGrid
              items={[
                { label: "Load Number", value: selectedLoad.reference },
                { label: "Broker", value: selectedBroker },
                { label: "Customer", value: selectedCustomer },
                { label: "Driver", value: selectedLoad.driverId ?? "Unassigned" },
                { label: "Truck", value: selectedLoad.truckId ?? "Unassigned" },
                { label: "Trailer", value: "Pending" },
                { label: "Pickup", value: `${selectedLoad.origin.city}, ${selectedLoad.origin.state}` },
                { label: "Delivery", value: `${selectedLoad.destination.city}, ${selectedLoad.destination.state}` },
                { label: "Rate", value: `$${selectedLoad.rate.toLocaleString()}` },
                { label: "Status", value: selectedLoad.status.replace("_", " ") },
                { label: "Invoice Status", value: selectedPacket.summary.invoiceDraft?.status ?? "Not generated" },
                { label: "Packet Status", value: selectedPacket.summary.readyToSend ? "Ready to send" : "Missing documents" },
              ]}
            />
          </DetailSection>
          <DetailSection title="Documents Checklist">
            <div className="space-y-2">
              {checklist.map((document) => (
                <div key={document.label} className="rounded-xl border border-[#E5E7EB] bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-950">
                      {document.status === "missing" ? "○" : "✓"} {document.label}
                    </p>
                    <PremiumStatusBadge
                      label={document.status}
                      tone={document.status === "missing" ? "amber" : "green"}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{document.fileName}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-blue-600">
                    {["Preview", "Download", "Replace", "Upload", "Notes"].map((action) => (
                      <span key={action} className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-2 py-1">
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </DetailSection>
          <DetailSection title="Timeline">
            <div className="grid gap-2 text-sm text-slate-700">
              {["Created", "Uploaded", "Modified", "Sent to Broker", "Paid"].map((event) => (
                <div key={event} className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2">
                  {event}
                </div>
              ))}
            </div>
          </DetailSection>
          <DetailSection title="Notes, Comments & Nova Recommendations">
            <p className="text-sm leading-6 text-slate-600">
              Nova recommends completing missing packet documents before sending this packet to broker/accounting.
            </p>
          </DetailSection>
        </DetailSlideOver>
      ) : null}
    </OperationalPageShell>
  );
}
