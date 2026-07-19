import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import InterviewsClient from "@/components/workforce/InterviewsClient";
import WorkforceSubNav from "@/components/workforce/WorkforceSubNav";
import {
  applicationStore,
  candidateStore,
  interviewStore,
  jobStore,
  listByTenant,
} from "@/lib/data/workforce-store";
import { getActiveTenantId } from "@/lib/data/tenant";

export default function WorkforceInterviewsPage() {
  const tenantId = getActiveTenantId();

  return (
    <PageShell
      eyebrow="Workforce"
      title="Interviews"
      description="Schedule Meet, Zoom, Teams, phone, or in-person interviews. Calendar sync optional."
    >
      <WorkforceSubNav />
      <FadeIn>
        <InterviewsClient
          interviews={listByTenant(interviewStore, tenantId)}
          applications={listByTenant(applicationStore, tenantId)}
          jobs={listByTenant(jobStore, tenantId)}
          candidates={listByTenant(candidateStore, tenantId)}
        />
      </FadeIn>
    </PageShell>
  );
}
