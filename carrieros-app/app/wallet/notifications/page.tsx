import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import NotificationsClient from "@/components/wallet/NotificationsClient";
import WalletSubNav from "@/components/wallet/WalletSubNav";
import { listNotifications } from "@/lib/wallet/store";

export default function WalletNotificationsPage() {
  const notifications = listNotifications();

  return (
    <PageShell
      eyebrow="Digital Professional Wallet"
      title="Notifications"
      description="Expirations, job matches, interviews, and company document requests."
    >
      <WalletSubNav />
      <FadeIn>
        <NotificationsClient notifications={notifications} />
      </FadeIn>
    </PageShell>
  );
}
