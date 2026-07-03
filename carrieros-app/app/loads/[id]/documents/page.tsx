import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import DocumentCaptureForm from "@/components/documents/DocumentCaptureForm";
import InvoiceDraftPanel from "@/components/documents/InvoiceDraftPanel";
import PacketChecklist from "@/components/documents/PacketChecklist";
import PacketReadyPanel from "@/components/documents/PacketReadyPanel";
import { getBrokerById } from "@/lib/data/brokers";
import { getCustomerById } from "@/lib/data/customers";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getDocumentService } from "@/lib/services/documents";
import { formatLoadLane } from "@/lib/services/loads/load-helpers";
import { getLoadService } from "@/lib/services/loads";

type LoadDocumentsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LoadDocumentsPage({
  params,
}: LoadDocumentsPageProps) {
  const { id } = await params;
  const tenantId = getActiveTenantId();
  const load = await getLoadService().getLoad(tenantId, id);

  if (!load) {
    notFound();
  }

  const documentService = getDocumentService();
  const summary = await documentService.getPacketSummary(tenantId, load.id);
  const broker = load.brokerId ? getBrokerById(load.brokerId) : undefined;
  const customer = getCustomerById(load.customerId);
  const billTo = broker?.name ?? customer?.name ?? "Direct customer";

  return (
    <>
      <Link
        href={`/loads/${load.id}`}
        className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
      >
        ← Back to Load
      </Link>

      <PageHeader
        title="Capture Load Documents"
        subtitle={`${load.reference} · ${formatLoadLane(load)}`}
        className="mt-4"
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <DocumentCaptureForm loadId={load.id} />
        <PacketChecklist checklist={summary.checklist} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <InvoiceDraftPanel
          load={load}
          invoiceDraft={summary.invoiceDraft}
          billTo={billTo}
        />
        <PacketReadyPanel loadId={load.id} summary={summary} />
      </div>
    </>
  );
}
