import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import GovernanceClient from "@/components/platform/GovernanceClient";
import PlatformSubNav from "@/components/platform/PlatformSubNav";

export default function PlatformGovernancePage() {
  return (
    <PageShell
      eyebrow="Transpo.ai"
      title="Master Constitution"
      description="Version 1.0 — highest authority for Transpo.ai. Canonical: /constitution/00-master-constitution.md — Constitution always overrides feature requests."
    >
      <PlatformSubNav />
      <FadeIn>
        <GovernanceClient />
      </FadeIn>
    </PageShell>
  );
}
