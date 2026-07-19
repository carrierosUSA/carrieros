import { Suspense } from "react";
import BrokerDashboardClient from "@/components/brokers/BrokerDashboardClient";
import BrokerDashboardSkeleton from "@/components/brokers/BrokerDashboardSkeleton";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import { listBrokersByTenant } from "@/lib/data/brokers";
import { getActiveTenantId } from "@/lib/data/tenant";
import { detectDashboardBrokerAlphInsights } from "@/lib/brokers/broker-alph-alerts";

export default function BrokersPage() {
  const tenantId = getActiveTenantId();
  const brokers = listBrokersByTenant(tenantId);
  const alphInsights = detectDashboardBrokerAlphInsights(brokers);

  return (
    <OperationalPageShell
      title="Brokers"
      subtitle="Manage broker relationships, credit, contacts, and payments."
      eyebrow="Broker Management"
    >
      <Suspense fallback={<BrokerDashboardSkeleton />}>
        <BrokerDashboardClient brokers={brokers} alphInsights={alphInsights} />
      </Suspense>
    </OperationalPageShell>
  );
}
