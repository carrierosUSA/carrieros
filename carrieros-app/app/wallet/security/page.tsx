import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import SecurityClient from "@/components/wallet/SecurityClient";
import WalletSubNav from "@/components/wallet/WalletSubNav";
import { getPrivacyControls } from "@/lib/wallet/store";

export default function WalletSecurityPage() {
  const privacy = getPrivacyControls();

  return (
    <PageShell
      eyebrow="Digital Professional Wallet"
      title="Security & Privacy"
      description="RBAC, MFA, consent, and accurate encryption language — you stay in control."
    >
      <WalletSubNav />
      <FadeIn>
        <SecurityClient privacy={privacy} />
      </FadeIn>
    </PageShell>
  );
}
