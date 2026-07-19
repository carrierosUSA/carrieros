import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import EnterpriseClient from "@/components/wallet/EnterpriseClient";
import WalletSubNav from "@/components/wallet/WalletSubNav";
import { listEnterpriseRequests } from "@/lib/wallet/store";

export default function WalletEnterprisePage() {
  const requests = listEnterpriseRequests();

  return (
    <PageShell
      eyebrow="Digital Professional Wallet"
      title="Enterprise"
      description="Company admins request documents, track approvals, and monitor compliance — with consent."
    >
      <WalletSubNav />
      <FadeIn>
        <EnterpriseClient requests={requests} />
      </FadeIn>
    </PageShell>
  );
}
