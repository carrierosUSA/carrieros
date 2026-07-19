import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import PlatformSubNav from "@/components/platform/PlatformSubNav";
import MigrationDocumentsClient from "@/components/migration/MigrationDocumentsClient";

export default function MigrationDocumentsPage() {
  return (
    <PageShell
      eyebrow="Transpo.ai · AI Migration Center"
      title="Document import"
      description="Alph classifies PODs, rate cons, invoices, and more — you confirm before filing."
      action={
        <Link href="/platform/migration" className="transpo-btn-secondary">
          Migration Center
        </Link>
      }
    >
      <PlatformSubNav />
      <FadeIn>
        <MigrationDocumentsClient />
      </FadeIn>
    </PageShell>
  );
}
