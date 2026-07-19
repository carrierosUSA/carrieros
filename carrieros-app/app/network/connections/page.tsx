import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import NetworkSubNav from "@/components/network/NetworkSubNav";
import ConnectionsClient from "@/components/network/ConnectionsClient";
import { listConnections } from "@/lib/network/store";

export default function NetworkConnectionsPage() {
  return (
    <PageShell
      eyebrow="Transpo Verified Network™"
      title="Verified connections"
      description="Typed, consent-based relationships — request, accept, or revoke in one click."
    >
      <NetworkSubNav />
      <FadeIn>
        <ConnectionsClient initial={listConnections()} />
      </FadeIn>
    </PageShell>
  );
}
