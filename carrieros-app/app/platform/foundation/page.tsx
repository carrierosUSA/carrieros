import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import FoundationClient from "@/components/platform/FoundationClient";
import PlatformSubNav from "@/components/platform/PlatformSubNav";
import { FOUNDATION_TITLE } from "@/lib/foundation";

export default function FoundationPage() {
  return (
    <PageShell
      eyebrow="Transpo.ai"
      title={FOUNDATION_TITLE}
      description="Operating mandate for every agent and engineer — trust, quality, and long-term architecture."
    >
      <PlatformSubNav />
      <FadeIn>
        <FoundationClient />
      </FadeIn>
    </PageShell>
  );
}
