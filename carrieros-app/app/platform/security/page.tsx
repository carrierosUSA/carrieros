import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import PlatformSubNav from "@/components/platform/PlatformSubNav";
import SecurityClient from "@/components/platform/SecurityClient";
import { getAuditLog } from "@/lib/permissions/audit";
import { listFraudFlags, listPlatformAudit } from "@/lib/platform/store";

export default function PlatformSecurityPage() {
  return (
    <PageShell
      eyebrow="Transpo Platform™"
      title="Enterprise Security"
      description="SSO, MFA, and RBAC link to Settings. Audit logs and DR status are product-honest — local viewer, not fake payment infra."
    >
      <PlatformSubNav />
      <FadeIn>
        <SecurityClient
          platformAudit={listPlatformAudit()}
          permissionAudit={getAuditLog()}
          fraudFlags={listFraudFlags()}
        />
      </FadeIn>
    </PageShell>
  );
}
