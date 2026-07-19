import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import AnalyticsClient from "@/components/workforce/AnalyticsClient";
import WorkforceSubNav from "@/components/workforce/WorkforceSubNav";
import { getAnalytics } from "@/lib/data/workforce-store";

export default function WorkforceAnalyticsPage() {
  return (
    <PageShell
      eyebrow="Workforce"
      title="Hiring analytics"
      description="Applications, time-to-hire, sources, salary benchmarks, and recruiter performance."
    >
      <WorkforceSubNav />
      <FadeIn>
        <AnalyticsClient analytics={getAnalytics()} />
      </FadeIn>
    </PageShell>
  );
}
