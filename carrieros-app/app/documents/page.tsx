import PageHeader from "@/components/PageHeader";
import MetricCard from "@/components/MetricCard";
import NovaAlert from "@/components/NovaAlert";
import DocumentPacketCard from "@/components/documents/DocumentPacketCard";
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
    <>
      <PageHeader
        title="Documents"
        subtitle="Capture, scan, sequence, and prepare invoice packets for the carrier business."
      />

      {firstMissing?.summary.nextMissing ? (
        <NovaAlert
          message={`Missing ${firstMissing.summary.nextMissing.label}. Show Me`}
        />
      ) : (
        <NovaAlert message="All visible required packet documents are ready." />
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <MetricCard title="Load Packets" value={summaries.length.toString()} />
        <MetricCard title="Ready Packets" value={readyPackets.length.toString()} />
        <MetricCard title="Missing Docs" value={missingDocs.toString()} />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {summaries.length > 0 ? (
          summaries.map(({ load, summary }) => (
            <DocumentPacketCard key={load.id} load={load} summary={summary} />
          ))
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 lg:col-span-2">
            <p className="text-lg font-semibold text-zinc-100">
              No load packets yet
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Create a load first, then capture documents from the load detail page.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
