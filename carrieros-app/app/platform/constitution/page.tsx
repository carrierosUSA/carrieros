import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import ConstitutionClient from "@/components/platform/ConstitutionClient";
import PlatformSubNav from "@/components/platform/PlatformSubNav";
import { ENGINEERING_CONSTITUTION_TITLE } from "@/lib/engineering-constitution";

export default function EngineeringConstitutionPage() {
  return (
    <PageShell
      eyebrow="Transpo Platform™"
      title={ENGINEERING_CONSTITUTION_TITLE}
      description="Twelve principles that implement the Trust & Safety Charter — Alph, automation, safety, compliance, and your data."
    >
      <PlatformSubNav />
      <FadeIn>
        <ConstitutionClient />
      </FadeIn>
    </PageShell>
  );
}
