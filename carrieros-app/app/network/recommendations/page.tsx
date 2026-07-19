import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import NetworkSubNav from "@/components/network/NetworkSubNav";
import RecommendationsClient from "@/components/network/RecommendationsClient";
import { listRecommendations } from "@/lib/network/store";

export default function NetworkRecommendationsPage() {
  return (
    <PageShell
      eyebrow="Transpo Verified Network™"
      title="Industry recommendations"
      description="Attributed recommendations for drivers, dispatchers, mechanics, recruiters, and service providers."
    >
      <NetworkSubNav />
      <FadeIn>
        <RecommendationsClient recommendations={listRecommendations()} />
      </FadeIn>
    </PageShell>
  );
}
