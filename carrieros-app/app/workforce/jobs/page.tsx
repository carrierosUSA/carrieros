import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import JobsClient from "@/components/workforce/JobsClient";
import WorkforceSubNav from "@/components/workforce/WorkforceSubNav";
import {
  companyStore,
  jobStore,
  listByTenant,
} from "@/lib/data/workforce-store";
import { getActiveTenantId } from "@/lib/data/tenant";

export default function WorkforceJobsPage() {
  const tenantId = getActiveTenantId();
  const jobs = listByTenant(jobStore, tenantId);
  const companies = listByTenant(companyStore, tenantId);

  return (
    <PageShell
      eyebrow="Workforce"
      title="Jobs"
      description="Create, filter, and manage trucking roles — apply in one click from each posting."
    >
      <WorkforceSubNav />
      <FadeIn>
        <JobsClient jobs={jobs} companies={companies} />
      </FadeIn>
    </PageShell>
  );
}
