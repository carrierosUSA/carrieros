import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import TrustScoreClient from "@/components/wallet/TrustScoreClient";
import WalletSubNav from "@/components/wallet/WalletSubNav";
import { getTrustScore } from "@/lib/wallet/store";

export default function WalletTrustPage() {
  const trust = getTrustScore();

  return (
    <PageShell
      eyebrow="Digital Professional Wallet"
      title="Trust Score"
      description="Decision-support only — never used to automatically reject anyone."
    >
      <WalletSubNav />
      <FadeIn>
        <TrustScoreClient trust={trust} />
      </FadeIn>
    </PageShell>
  );
}
