import { Suspense } from "react";
import BrokerDetailShell from "@/components/brokers/BrokerDetailShell";
import BrokerDetailSkeleton from "@/components/brokers/BrokerDetailSkeleton";
import { parseBrokerTab } from "@/components/brokers/BrokerDetailTabs";
import { detectBrokerAlphAlerts } from "@/lib/brokers/broker-alph-alerts";
import { getBrokerLoads } from "@/lib/brokers/broker-board";
import { requireBroker } from "@/lib/brokers/require-broker";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getLoadService } from "@/lib/services/loads";

type BrokerDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function BrokerDetailPage({
  params,
  searchParams,
}: BrokerDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const broker = requireBroker(id);
  const tenantId = getActiveTenantId();
  const loads = await getLoadService().listLoads(tenantId);
  const brokerLoads = getBrokerLoads(broker.id, loads);
  const activeTab = parseBrokerTab(query.tab);
  const alphAlerts = detectBrokerAlphAlerts(broker);

  return (
    <div className="w-full rounded-[16px] bg-white p-4 text-[#111827] sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1560px]">
        <Suspense fallback={<BrokerDetailSkeleton />}>
          <BrokerDetailShell
            broker={broker}
            loads={brokerLoads}
            activeTab={activeTab}
            alphAlerts={alphAlerts}
          />
        </Suspense>
      </div>
    </div>
  );
}
