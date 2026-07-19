import Link from "next/link";
import { Suspense } from "react";
import DocumentCenterClient from "@/components/documents/center/DocumentCenterClient";
import DocumentDashboardSkeleton from "@/components/documents/center/DocumentDashboardSkeleton";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import { getCurrentSession } from "@/lib/auth/session";
import { listCarrierDocuments } from "@/lib/data/carrier-document-store";
import { getActiveTenantId } from "@/lib/data/tenant";

export default function DocumentsPage() {
  const tenantId = getActiveTenantId();
  const session = getCurrentSession();
  const documents = listCarrierDocuments(tenantId);

  return (
    <OperationalPageShell
      title="Document Center"
      subtitle="Store, search, link, and review every carrier document — powered by Alph OCR."
      eyebrow="Documents"
      action={
        <Link
          href="/documents/health"
          className="inline-flex h-10 items-center justify-center rounded-full bg-[#2563EB] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
        >
          Document Health
        </Link>
      }
    >
      <Suspense fallback={<DocumentDashboardSkeleton />}>
        <DocumentCenterClient
          initialDocuments={documents}
          role={session.role}
        />
      </Suspense>
    </OperationalPageShell>
  );
}
