import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import PassportClient from "@/components/wallet/PassportClient";
import WalletSubNav from "@/components/wallet/WalletSubNav";
import { getCareerPassport, listWalletBadges } from "@/lib/wallet/store";

export default function WalletPassportPage() {
  const passport = getCareerPassport();
  const badges = listWalletBadges();

  return (
    <PageShell
      eyebrow="Digital Professional Wallet"
      title="Career Passport"
      description="One lifelong timeline of verified employment, training, awards, and growth."
    >
      <WalletSubNav />
      <FadeIn>
        <PassportClient passport={passport} badges={badges} />
      </FadeIn>
    </PageShell>
  );
}
