import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import PlatformSubNav from "@/components/platform/PlatformSubNav";
import MigrationSummaryClient from "@/components/migration/MigrationSummaryClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MigrationSummaryPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <PageShell
      eyebrow="Transpo.ai · Alph"
      title="Post-import summary"
      description="Business, fleet, and relationship sketch from imported sandbox data — decision support only."
      action={
        <Link href="/platform/migration" className="transpo-btn-secondary">
          Migration Center
        </Link>
      }
    >
      <PlatformSubNav />
      <FadeIn>
        <MigrationSummaryClient summaryId={id} />
      </FadeIn>
    </PageShell>
  );
}
