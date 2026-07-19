import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import NetworkSubNav from "@/components/network/NetworkSubNav";
import ProfessionalListClient from "@/components/network/ProfessionalListClient";
import { listMembers, listProfessionalPassports } from "@/lib/network/store";

export default function NetworkProfessionalsPage() {
  const people = listMembers().filter((m) => m.kind === "person");
  const passports = listProfessionalPassports();

  return (
    <PageShell
      eyebrow="Transpo Verified Network™"
      title="Professional / Career Passport"
      description="Employment, skills, equipment, training, and verified milestones — synced with Professional Wallet when linked."
    >
      <NetworkSubNav />
      <FadeIn>
        <ProfessionalListClient people={people} passports={passports} />
      </FadeIn>
    </PageShell>
  );
}
