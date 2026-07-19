import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import CommandCenterClient from "@/components/platform/CommandCenterClient";
import PlatformSubNav from "@/components/platform/PlatformSubNav";
import { getCommandCenterSnapshot } from "@/lib/platform/board";
import { getActiveTenantId } from "@/lib/data/tenant";

export default async function PlatformCommandPage() {
  const snapshot = await getCommandCenterSnapshot(getActiveTenantId());

  return (
    <PageShell
      eyebrow="Transpo Platform™"
      title="Command Center"
      description="Executive one-screen: fleet, revenue, profit, cash flow, compliance, hiring, safety, fuel, maintenance, and Alph insights."
    >
      <PlatformSubNav />
      <FadeIn>
        <CommandCenterClient snapshot={snapshot} />
      </FadeIn>
    </PageShell>
  );
}
