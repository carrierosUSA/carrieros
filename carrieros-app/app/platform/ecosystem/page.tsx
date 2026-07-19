import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import EcosystemMapClient from "@/components/platform/EcosystemMapClient";
import PlatformSubNav from "@/components/platform/PlatformSubNav";
import { getEcosystemMap } from "@/lib/platform/board";

export default function PlatformEcosystemPage() {
  const map = getEcosystemMap();

  return (
    <PageShell
      eyebrow="Transpo Platform™"
      title="Ecosystem map"
      description="Core + Exchange + Network + Workforce + App Store + Partners + Developers + Automation — the entire operation."
    >
      <PlatformSubNav />
      <FadeIn>
        <EcosystemMapClient map={map} />
      </FadeIn>
    </PageShell>
  );
}
