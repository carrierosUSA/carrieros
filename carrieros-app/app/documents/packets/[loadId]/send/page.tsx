import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import SendPrepPanel from "@/components/documents/SendPrepPanel";
import { getBrokerById } from "@/lib/data/brokers";
import { getCustomerById } from "@/lib/data/customers";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getDocumentService } from "@/lib/services/documents";
import { formatLoadLane } from "@/lib/services/loads/load-helpers";
import { getLoadService } from "@/lib/services/loads";

type SendPacketPageProps = {
  params: Promise<{ loadId: string }>;
};

export default async function SendPacketPage({ params }: SendPacketPageProps) {
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
      <PageHeader
        title="Email / Upload Preparation"
        subtitle={`${load.reference} · ${formatLoadLane(load)}`}
      />

      <div className="mt-8">
        <SendPrepPanel load={load} summary={summary} billTo={billTo} />
      </div>
    </>
  );
}
