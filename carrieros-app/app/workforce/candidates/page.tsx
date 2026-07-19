import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import CandidatesClient from "@/components/workforce/CandidatesClient";
import WorkforceSubNav from "@/components/workforce/WorkforceSubNav";
import { candidateStore, listByTenant } from "@/lib/data/workforce-store";
import { getActiveTenantId } from "@/lib/data/tenant";

export default function WorkforceCandidatesPage() {
  const candidates = listByTenant(candidateStore, getActiveTenantId());

  return (
    <PageShell
      eyebrow="Workforce"
      title="Candidates"
      description="Professional profiles with AI Match Score and verification badges."
    >
      <WorkforceSubNav />
      <FadeIn>
        <CandidatesClient candidates={candidates} />
      </FadeIn>
    </PageShell>
  );
}
