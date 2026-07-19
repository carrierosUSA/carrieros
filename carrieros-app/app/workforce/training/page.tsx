import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import TrainingClient from "@/components/workforce/TrainingClient";
import WorkforceSubNav from "@/components/workforce/WorkforceSubNav";
import {
  candidateStore,
  courseStore,
  listByTenant,
  trainingProgressStore,
} from "@/lib/data/workforce-store";
import { getActiveTenantId } from "@/lib/data/tenant";

export default function WorkforceTrainingPage() {
  const tenantId = getActiveTenantId();

  return (
    <PageShell
      eyebrow="Workforce"
      title="Training"
      description="Courses and progress for drivers, dispatch, safety, and back office."
    >
      <WorkforceSubNav />
      <FadeIn>
        <TrainingClient
          courses={listByTenant(courseStore, tenantId)}
          progress={listByTenant(trainingProgressStore, tenantId)}
          candidates={listByTenant(candidateStore, tenantId)}
        />
      </FadeIn>
    </PageShell>
  );
}
