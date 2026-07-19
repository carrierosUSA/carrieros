import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import NetworkSubNav from "@/components/network/NetworkSubNav";
import ExperienceClient from "@/components/network/ExperienceClient";
import { listExperiences } from "@/lib/network/store";

export default function NetworkExperiencePage() {
  const experiences = listExperiences();

  return (
    <PageShell
      eyebrow="Transpo Verified Network™"
      title="Verified Experience"
      description="Request and confirm employment, safety, miles, and references as permanent verified records."
    >
      <NetworkSubNav />
      <FadeIn>
        <ExperienceClient initial={experiences} />
      </FadeIn>
    </PageShell>
  );
}
