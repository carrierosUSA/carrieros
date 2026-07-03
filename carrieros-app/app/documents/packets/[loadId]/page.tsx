import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import NovaAlert from "@/components/NovaAlert";
import InvoiceDraftPanel from "@/components/documents/InvoiceDraftPanel";
import PacketChecklist from "@/components/documents/PacketChecklist";
import PacketReadyPanel from "@/components/documents/PacketReadyPanel";
import { getBrokerById } from "@/lib/data/brokers";
import { getCustomerById } from "@/lib/data/customers";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getDocumentService } from "@/lib/services/documents";
import { formatLoadLane } from "@/lib/services/loads/load-helpers";
import { getLoadService } from "@/lib/services/loads";

type PacketPageProps = {
  params: Promise<{ loadId: string }>;
};

export default async function PacketPage({ params }: PacketPageProps) {
  const { loadId } = await params;
  const tenantId = getActiveTenantId();
  const load = await getLoadService().getLoad(tenantId, loadId);

  if (!load) {
    notFound();
  }

  const summary = await getDocumentService().getPacketSummary(tenantId, load.id);
  const broker = load.brokerId ? getBrokerById(load.brokerId) : undefined;
  const customer = getCustomerById(load.customerId);
  const billTo = broker?.name ?? customer?.name ?? "Direct customer";

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/documents"
          className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
        >
          ← Back to Documents
        </Link>
        <Link
          href={`/loads/${load.id}/documents`}
          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
        >
          Capture Docs
        </Link>
      </div>

      <PageHeader
        title={`Invoice Packet · ${load.reference}`}
        subtitle={formatLoadLane(load)}
        className="mt-4"
      />

      {summary.nextMissing ? (
        <NovaAlert
          message={`Missing ${summary.nextMissing.label}.`}
          actionHref={`/loads/${load.id}/documents`}
          actionLabel="Show Me"
        />
      ) : (
        <NovaAlert message="Packet sequence is complete. Ready to prepare send/upload." />
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <PacketChecklist checklist={summary.checklist} />
        <PacketReadyPanel loadId={load.id} summary={summary} />
      </div>

      <div className="mt-8">
        <InvoiceDraftPanel
          load={load}
          invoiceDraft={summary.invoiceDraft}
          billTo={billTo}
        />
      </div>
    </>
  );
}
