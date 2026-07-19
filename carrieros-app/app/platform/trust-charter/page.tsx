import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import TrustCharterClient from "@/components/platform/TrustCharterClient";
import PlatformSubNav from "@/components/platform/PlatformSubNav";
import { TRUST_SAFETY_CHARTER_TITLE } from "@/lib/trust-safety-charter";

export default function TrustSafetyCharterPage() {
  return (
    <PageShell
      eyebrow="Transpo.ai"
      title={TRUST_SAFETY_CHARTER_TITLE}
      description="The supreme standard for trust, safety, and AI — assist businesses, never operate them."
    >
      <PlatformSubNav />
      <FadeIn>
        <TrustCharterClient />
      </FadeIn>
    </PageShell>
  );
}
