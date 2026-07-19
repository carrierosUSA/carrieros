import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import AiPolicyPageContent from "@/components/ai-safety/AiPolicyPageContent";
import PlatformSubNav from "@/components/platform/PlatformSubNav";
import { AI_POLICY_TAGLINE } from "@/lib/ai-safety";

export default function PlatformAiPolicyPage() {
  return (
    <PageShell
      eyebrow="Transpo.ai"
      title="AI Safety & Legal Policy"
      description={`${AI_POLICY_TAGLINE} Governed by the Engineering Constitution.`}
    >
      <PlatformSubNav />
      <FadeIn>
        <AiPolicyPageContent />
      </FadeIn>
    </PageShell>
  );
}
