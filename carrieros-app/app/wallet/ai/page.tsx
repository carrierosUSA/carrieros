import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import AiAssistantClient from "@/components/wallet/AiAssistantClient";
import WalletSubNav from "@/components/wallet/WalletSubNav";

export default function WalletAiPage() {
  return (
    <PageShell
      eyebrow="Digital Professional Wallet"
      title="AI Assistant"
      description="Document help and career coaching powered by Alph — against your passport data."
    >
      <WalletSubNav />
      <FadeIn>
        <AiAssistantClient />
      </FadeIn>
    </PageShell>
  );
}
