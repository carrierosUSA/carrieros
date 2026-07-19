import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import ApplicationsClient from "@/components/workforce/ApplicationsClient";
import WorkforceSubNav from "@/components/workforce/WorkforceSubNav";
import {
  applicationStore,
  auditLogStore,
  candidateStore,
  companyStore,
  jobStore,
  listByTenant,
} from "@/lib/data/workforce-store";
import { getActiveTenantId } from "@/lib/data/tenant";

export default function WorkforceApplicationsPage() {
  const tenantId = getActiveTenantId();

  return (
    <PageShell
      eyebrow="Workforce"
      title="Applications"
      description="Pipeline from applied to hired — one-click status updates with an audit trail."
    >
      <WorkforceSubNav />
      <FadeIn>
        <ApplicationsClient
          applications={listByTenant(applicationStore, tenantId)}
          jobs={listByTenant(jobStore, tenantId)}
          candidates={listByTenant(candidateStore, tenantId)}
          companies={listByTenant(companyStore, tenantId)}
          auditLog={[...auditLogStore]}
        />
      </FadeIn>
    </PageShell>
  );
}
