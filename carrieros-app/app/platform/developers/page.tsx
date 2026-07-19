import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import DevelopersClient from "@/components/platform/DevelopersClient";
import PlatformSubNav from "@/components/platform/PlatformSubNav";
import { getDeveloperDocs } from "@/lib/platform/store";

export default function PlatformDevelopersPage() {
  const docs = getDeveloperDocs();

  return (
    <PageShell
      eyebrow="Transpo Platform™"
      title="Developer Platform"
      description="Public API overview, webhooks, SDK notes, sandbox keys, docs, rate limits, and monitoring — local sandbox console."
    >
      <PlatformSubNav />
      <FadeIn>
        <DevelopersClient docs={docs} />
      </FadeIn>
    </PageShell>
  );
}
