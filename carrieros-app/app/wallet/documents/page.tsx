import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import DocumentsClient from "@/components/wallet/DocumentsClient";
import WalletSubNav from "@/components/wallet/WalletSubNav";
import { listWalletDocuments } from "@/lib/wallet/store";

export default function WalletDocumentsPage() {
  const documents = listWalletDocuments();

  return (
    <PageShell
      eyebrow="Digital Professional Wallet"
      title="Documents"
      description="Licenses, medical, training, employment, and sensitive records — with consent controls."
      action={
        <Link href="/wallet/ai" className="transpo-btn-primary">
          Upload with Alph
        </Link>
      }
    >
      <WalletSubNav />
      <FadeIn>
        <DocumentsClient documents={documents} />
      </FadeIn>
    </PageShell>
  );
}
