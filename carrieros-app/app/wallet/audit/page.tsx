import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import AuditLogClient from "@/components/wallet/AuditLogClient";
import WalletSubNav from "@/components/wallet/WalletSubNav";
import { listAuditLog } from "@/lib/wallet/store";

export default function WalletAuditPage() {
  const entries = listAuditLog();

  return (
    <PageShell
      eyebrow="Digital Professional Wallet"
      title="Audit Log"
      description="Who accessed what, when shares were created or revoked, and consent changes."
    >
      <WalletSubNav />
      <FadeIn>
        <AuditLogClient entries={entries} />
      </FadeIn>
    </PageShell>
  );
}
