import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import SharingClient from "@/components/wallet/SharingClient";
import WalletSubNav from "@/components/wallet/WalletSubNav";
import { listShareLinks } from "@/lib/wallet/store";

export default function WalletSharingPage() {
  const links = listShareLinks();

  return (
    <PageShell
      eyebrow="Digital Professional Wallet"
      title="Sharing"
      description="Scoped, expiring share links you can revoke instantly."
    >
      <WalletSubNav />
      <FadeIn>
        <SharingClient links={links} />
      </FadeIn>
    </PageShell>
  );
}
