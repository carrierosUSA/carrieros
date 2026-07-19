import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import CertificationsClient from "@/components/workforce/CertificationsClient";
import WorkforceSubNav from "@/components/workforce/WorkforceSubNav";
import {
  candidateStore,
  certificationStore,
  listByTenant,
} from "@/lib/data/workforce-store";
import { getActiveTenantId } from "@/lib/data/tenant";

export default function WorkforceCertificationsPage() {
  const tenantId = getActiveTenantId();

  return (
    <PageShell
      eyebrow="Workforce"
      title="Certifications"
      description="TWIC, hazmat, ASE, and other professional credentials with expiry status."
    >
      <WorkforceSubNav />
      <FadeIn>
        <CertificationsClient
          certifications={listByTenant(certificationStore, tenantId)}
          candidates={listByTenant(candidateStore, tenantId)}
        />
      </FadeIn>
    </PageShell>
  );
}
