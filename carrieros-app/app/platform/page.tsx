import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import PlatformHomeClient from "@/components/platform/PlatformHomeClient";
import PlatformSubNav from "@/components/platform/PlatformSubNav";
import { getPlatformHomeSnapshot } from "@/lib/platform/board";
import { getActiveTenantId } from "@/lib/data/tenant";

export default async function PlatformHomePage() {
  const tenantId = getActiveTenantId();
  const snapshot = await getPlatformHomeSnapshot(tenantId);

  return (
    <PageShell
      eyebrow="Transpo Platform™"
      title="Run your entire operation here"
      description="One secure AI-powered ecosystem — orchestrating Fleet, Dispatch, Workforce, Wallet, App Store, Partners, and Automation."
      action={
        <div className="flex flex-wrap gap-2">
          <Link href="/platform/command" className="transpo-btn-primary">
            Command Center
          </Link>
          <Link href="/alph" className="transpo-btn-secondary">
            Ask Alph
          </Link>
        </div>
      }
    >
      <PlatformSubNav />
      <FadeIn>
        <PlatformHomeClient snapshot={snapshot} />
      </FadeIn>
    </PageShell>
  );
}
