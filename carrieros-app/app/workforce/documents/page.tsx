import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import DocumentsClient from "@/components/workforce/DocumentsClient";
import WorkforceSubNav from "@/components/workforce/WorkforceSubNav";
import { listByTenant, workforceDocumentStore } from "@/lib/data/workforce-store";
import { getActiveTenantId } from "@/lib/data/tenant";

export default function WorkforceDocumentsPage() {
  return (
    <PageShell
      eyebrow="Workforce"
      title="Documents"
      description="Licenses, medicals, offers, and policy packets for hiring workflows."
    >
      <WorkforceSubNav />
      <FadeIn>
        <DocumentsClient
          documents={listByTenant(workforceDocumentStore, getActiveTenantId())}
        />
      </FadeIn>
    </PageShell>
  );
}
