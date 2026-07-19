import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import AiRecruitingClient from "@/components/workforce/AiRecruitingClient";
import WorkforceSubNav from "@/components/workforce/WorkforceSubNav";
import {
  candidateStore,
  jobStore,
  listByTenant,
} from "@/lib/data/workforce-store";
import { getActiveTenantId } from "@/lib/data/tenant";

export default function WorkforceAiPage() {
  const tenantId = getActiveTenantId();

  return (
    <PageShell
      eyebrow="Workforce"
      title="AI Recruiting"
      description="Alph ranks candidates by fit — invite, message, or schedule in one click."
    >
      <WorkforceSubNav />
      <FadeIn>
        <AiRecruitingClient
          candidates={listByTenant(candidateStore, tenantId)}
          jobs={listByTenant(jobStore, tenantId).filter((j) => j.status === "open")}
        />
      </FadeIn>
    </PageShell>
  );
}
