import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import BackgroundChecksClient from "@/components/workforce/BackgroundChecksClient";
import WorkforceSubNav from "@/components/workforce/WorkforceSubNav";
import {
  auditLogStore,
  backgroundCheckStore,
  candidateStore,
  listByTenant,
} from "@/lib/data/workforce-store";
import { getActiveTenantId } from "@/lib/data/tenant";

export default function WorkforceBackgroundChecksPage() {
  const tenantId = getActiveTenantId();

  return (
    <PageShell
      eyebrow="Workforce"
      title="Background checks"
      description="PSP, MVR, criminal, and employment verification status for hiring roles."
    >
      <WorkforceSubNav />
      <FadeIn>
        <BackgroundChecksClient
          checks={listByTenant(backgroundCheckStore, tenantId)}
          candidates={listByTenant(candidateStore, tenantId)}
          auditLog={[...auditLogStore]}
        />
      </FadeIn>
    </PageShell>
  );
}
