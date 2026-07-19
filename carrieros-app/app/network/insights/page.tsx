import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import NetworkSubNav from "@/components/network/NetworkSubNav";
import InsightsClient from "@/components/network/InsightsClient";

export default function NetworkInsightsPage() {
  return (
    <PageShell
      eyebrow="Transpo Verified Network™"
      title="Analytics / Insights"
      description="Directory coverage, verification rates, and community engagement at a glance."
    >
      <NetworkSubNav />
      <FadeIn>
        <InsightsClient />
      </FadeIn>
    </PageShell>
  );
}
