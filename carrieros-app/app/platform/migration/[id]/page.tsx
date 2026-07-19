import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import PlatformSubNav from "@/components/platform/PlatformSubNav";
import MigrationRunDetailClient from "@/components/migration/MigrationRunDetailClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MigrationRunPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <PageShell
      eyebrow="Transpo.ai · AI Migration Center"
      title="Import details"
      description="Audit trail, sandbox records, and rollback when a backup snapshot exists."
      action={
        <Link href="/platform/migration/history" className="transpo-btn-secondary">
          History
        </Link>
      }
    >
      <PlatformSubNav />
      <FadeIn>
        <MigrationRunDetailClient runId={id} />
      </FadeIn>
    </PageShell>
  );
}
