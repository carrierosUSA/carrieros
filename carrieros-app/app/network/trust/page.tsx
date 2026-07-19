import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import NetworkSubNav from "@/components/network/NetworkSubNav";
import TrustCenterClient from "@/components/network/TrustCenterClient";
import {
  listNetworkAudit,
  listTrustStatus,
  listTrustTimeline,
} from "@/lib/network/store";

export default function NetworkTrustPage() {
  return (
    <PageShell
      eyebrow="Transpo Verified Network™"
      title="Trust Center"
      description="Verification, documents, safety, compliance, timeline, and audit — consent-based access control."
    >
      <NetworkSubNav />
      <FadeIn>
        <TrustCenterClient
          status={listTrustStatus()}
          timeline={listTrustTimeline()}
          audit={listNetworkAudit()}
        />
      </FadeIn>
    </PageShell>
  );
}
