import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import WorkforceDashboardClient from "@/components/workforce/WorkforceDashboardClient";
import WorkforceSubNav from "@/components/workforce/WorkforceSubNav";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getWorkforceDashboard } from "@/lib/workforce/board";

export default function WorkforceDashboardPage() {
  const tenantId = getActiveTenantId();
  const data = getWorkforceDashboard(tenantId);

  return (
    <PageShell
      eyebrow="Workforce"
      title="Hiring command center"
      description="Open jobs, pipeline, interviews, onboarding, and Alph matches in one screen."
      action={
        <Link href="/workforce/jobs" className="transpo-btn-primary">
          Post a job
        </Link>
      }
    >
      <WorkforceSubNav />
      <FadeIn>
        <WorkforceDashboardClient data={data} />
      </FadeIn>
    </PageShell>
  );
}
