import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import PartnersClient from "@/components/platform/PartnersClient";
import PlatformSubNav from "@/components/platform/PlatformSubNav";
import { listPartners } from "@/lib/platform/store";

export default function PlatformPartnersPage() {
  const partners = listPartners();

  return (
    <PageShell
      eyebrow="Transpo Platform™"
      title="Partner Center"
      description="Registered through Enterprise, Technology, Manufacturer, and Government partners — leads, APIs, and certification."
    >
      <PlatformSubNav />
      <FadeIn>
        <PartnersClient partners={partners} />
      </FadeIn>
    </PageShell>
  );
}
