import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import PlatformSubNav from "@/components/platform/PlatformSubNav";
import MigrationHistoryClient from "@/components/migration/MigrationHistoryClient";

export default function MigrationHistoryPage() {
  return (
    <PageShell
      eyebrow="Transpo.ai · AI Migration Center"
      title="Import history"
      description="Search by year or file. Roll back when a backup snapshot is available."
      action={
        <Link href="/platform/migration/new" className="transpo-btn-primary">
          New import
        </Link>
      }
    >
      <PlatformSubNav />
      <FadeIn>
        <MigrationHistoryClient />
      </FadeIn>
    </PageShell>
  );
}
