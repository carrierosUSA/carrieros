import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import WalletDashboardClient from "@/components/wallet/WalletDashboardClient";
import WalletSubNav from "@/components/wallet/WalletSubNav";
import { getWalletDashboard } from "@/lib/wallet/store";

export default function WalletDashboardPage() {
  const data = getWalletDashboard();

  return (
    <PageShell
      eyebrow="Career Passport"
      title="Digital Professional Wallet"
      description="Your lifelong professional identity — you decide who can access it."
      action={
        <Link href="/wallet/sharing" className="transpo-btn-primary">
          Share securely
        </Link>
      }
    >
      <WalletSubNav />
      <FadeIn>
        <WalletDashboardClient data={data} />
      </FadeIn>
    </PageShell>
  );
}
