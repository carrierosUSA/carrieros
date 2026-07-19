import Link from "next/link";
import { notFound } from "next/navigation";
import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import DocumentDetailClient from "@/components/wallet/DocumentDetailClient";
import WalletSubNav from "@/components/wallet/WalletSubNav";
import { getWalletDocument } from "@/lib/wallet/store";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function WalletDocumentDetailPage({ params }: Props) {
  const { id } = await params;
  const document = getWalletDocument(id);
  if (!document) notFound();

  return (
    <PageShell
      eyebrow="Digital Professional Wallet"
      title={document.title}
      description="Document detail with sensitivity, consent, and Alph extract."
      action={
        <Link href="/wallet/documents" className="transpo-btn-secondary">
          All documents
        </Link>
      }
    >
      <WalletSubNav />
      <FadeIn>
        <DocumentDetailClient document={document} />
      </FadeIn>
    </PageShell>
  );
}
