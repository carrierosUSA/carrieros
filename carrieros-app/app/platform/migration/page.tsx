import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import PlatformSubNav from "@/components/platform/PlatformSubNav";
import MigrationDashboardClient from "@/components/migration/MigrationDashboardClient";

export default function MigrationCenterPage() {
  return (
    <PageShell
      eyebrow="Transpo.ai · AI Migration Center"
      title="AI Migration Center"
      description="Bring years of trucking data into Transpo.ai safely — Alph assists, you approve every import."
      action={
        <Link href="/platform/migration/new" className="transpo-btn-primary">
          Start migration
        </Link>
      }
    >
      <PlatformSubNav />
      <FadeIn>
        <MigrationDashboardClient />
      </FadeIn>
    </PageShell>
  );
}
