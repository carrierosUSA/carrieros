import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import AutomationClient from "@/components/platform/AutomationClient";
import PlatformSubNav from "@/components/platform/PlatformSubNav";

export default function PlatformAutomationPage() {
  return (
    <PageShell
      eyebrow="Transpo Platform™"
      title="AI Automation Center"
      description="No-code recipes: POD → invoice, maintenance due → schedule, insurance expires → notify, and more."
    >
      <PlatformSubNav />
      <FadeIn>
        <AutomationClient />
      </FadeIn>
    </PageShell>
  );
}
