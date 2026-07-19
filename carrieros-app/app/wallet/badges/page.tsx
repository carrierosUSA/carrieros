import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import BadgesClient from "@/components/wallet/BadgesClient";
import WalletSubNav from "@/components/wallet/WalletSubNav";
import { listWalletBadges } from "@/lib/wallet/store";

export default function WalletBadgesPage() {
  const badges = listWalletBadges();

  return (
    <PageShell
      eyebrow="Digital Professional Wallet"
      title="Badges"
      description="Verified professional identity badges for your Career Passport."
    >
      <WalletSubNav />
      <FadeIn>
        <BadgesClient badges={badges} />
      </FadeIn>
    </PageShell>
  );
}
