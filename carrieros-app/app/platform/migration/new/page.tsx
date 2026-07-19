import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import PlatformSubNav from "@/components/platform/PlatformSubNav";
import MigrationWizardClient from "@/components/migration/MigrationWizardClient";

export default function MigrationNewPage() {
  return (
    <PageShell
      eyebrow="Transpo.ai · AI Migration Center"
      title="New migration"
      description="Step-by-step import — map columns, review cleanups, confirm backup, then import."
      action={
        <Link href="/platform/migration" className="transpo-btn-secondary">
          Back to center
        </Link>
      }
    >
      <PlatformSubNav />
      <FadeIn>
        <MigrationWizardClient />
      </FadeIn>
    </PageShell>
  );
}
