import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import NetworkSubNav from "@/components/network/NetworkSubNav";
import ReputationClient from "@/components/network/ReputationClient";
import { listReviews } from "@/lib/network/store";
import { seedReputationSummaries } from "@/lib/network/seed";

export default function NetworkReputationPage() {
  return (
    <PageShell
      eyebrow="Transpo Verified Network™"
      title="Professional reputation"
      description="Multi-dimension scores from verified interactions only — decision support, never auto-reject."
    >
      <NetworkSubNav />
      <FadeIn>
        <ReputationClient
          summaries={seedReputationSummaries}
          reviews={listReviews()}
        />
      </FadeIn>
    </PageShell>
  );
}
