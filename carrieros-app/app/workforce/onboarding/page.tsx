import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import OnboardingClient from "@/components/workforce/OnboardingClient";
import WorkforceSubNav from "@/components/workforce/WorkforceSubNav";
import { listByTenant, onboardingStore } from "@/lib/data/workforce-store";
import { getActiveTenantId } from "@/lib/data/tenant";

export default function WorkforceOnboardingPage() {
  return (
    <PageShell
      eyebrow="Workforce"
      title="Onboarding"
      description="Offer e-sign, CDL, medical, insurance, tax, policies, and orientation checklists."
    >
      <WorkforceSubNav />
      <FadeIn>
        <OnboardingClient checklists={listByTenant(onboardingStore, getActiveTenantId())} />
      </FadeIn>
    </PageShell>
  );
}
