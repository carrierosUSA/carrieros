import { Suspense } from "react";
import IntegrationCenterClient from "@/components/integrations/IntegrationCenterClient";
import IntegrationCenterSkeleton from "@/components/integrations/IntegrationCenterSkeleton";
import OperationalPageShell from "@/components/premium/OperationalPageShell";

export default function IntegrationsPage() {
  return (
    <OperationalPageShell
      title="Integration Center"
      subtitle="Enable partners, monitor health, and review sync logs — maps, ELD, accounting, messaging, payments, and storage."
      eyebrow="Platform"
    >
      <Suspense fallback={<IntegrationCenterSkeleton />}>
        <IntegrationCenterClient />
      </Suspense>
    </OperationalPageShell>
  );
}
