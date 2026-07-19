import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import NetworkDashboardClient from "@/components/network/NetworkDashboardClient";
import NetworkSubNav from "@/components/network/NetworkSubNav";
import { getNetworkDashboard } from "@/lib/network/board";

export default function NetworkDashboardPage() {
  const data = getNetworkDashboard();

  return (
    <PageShell
      eyebrow="Transpo Verified Network™"
      title="Network overview"
      description="Your permanent Transpo ID, trust signals, connections, and Alph networking — calm and consent-based."
      action={
        <Link href="/network/directory" className="transpo-btn-primary">
          Browse directory
        </Link>
      }
    >
      <NetworkSubNav />
      <FadeIn>
        <NetworkDashboardClient data={data} />
      </FadeIn>
    </PageShell>
  );
}
