import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import AppStoreClient from "@/components/platform/AppStoreClient";
import PlatformSubNav from "@/components/platform/PlatformSubNav";
import { listPlatformApps } from "@/lib/platform/store";

export default function PlatformAppsPage() {
  const apps = listPlatformApps();

  return (
    <PageShell
      eyebrow="Transpo Platform™"
      title="Transpo App Store™"
      description="Partner apps for ELDs, fuel, insurance, accounting, OCR, AI, and more — install with scoped permissions."
    >
      <PlatformSubNav />
      <FadeIn>
        <AppStoreClient apps={apps} />
      </FadeIn>
    </PageShell>
  );
}
