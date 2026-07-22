import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import SendPrepPanel from "@/components/documents/SendPrepPanel";
import { requireDocumentAuth } from "@/lib/auth/supabase-server";
import { getBrokerById } from "@/lib/data/brokers";
import { getCustomerById } from "@/lib/data/customers";
import { getDocumentService } from "@/lib/services/documents";
import { formatLoadLane } from "@/lib/services/loads/load-helpers";
import { getLoadService } from "@/lib/services/loads";

type SendPacketPageProps = {
  params: Promise<{ loadId: string }>;
};

export default async function SendPacketPage({ params }: SendPacketPageProps) {
  const { loadId } = await params;
  const auth = await requireDocumentAuth();
  const load = await getLoadService().getLoad(auth.companyId, loadId);

  if (!load) {
    notFound();
  }

  const summary = await getDocumentService().getPacketSummary(auth.companyId, load.id);
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
