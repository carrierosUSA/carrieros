import { Suspense } from "react";
import { notFound } from "next/navigation";
import DocumentDetailShell from "@/components/documents/center/DocumentDetailShell";
import DocumentDetailSkeleton from "@/components/documents/center/DocumentDetailSkeleton";
import { getCurrentSession } from "@/lib/auth/session";
import { getCarrierDocumentById } from "@/lib/data/carrier-document-store";
import { getActiveTenantId } from "@/lib/data/tenant";

type DocumentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DocumentDetailPage({
  params,
}: DocumentDetailPageProps) {
  const { id } = await params;
  const tenantId = getActiveTenantId();
  const document = getCarrierDocumentById(tenantId, id);

  if (!document) {
    notFound();
  }

  const session = getCurrentSession();

  return (
    <div className="w-full rounded-[16px] bg-white p-4 text-[#111827] sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1560px]">
        <Suspense fallback={<DocumentDetailSkeleton />}>
          <DocumentDetailShell document={document} role={session.role} />
        </Suspense>
      </div>
    </div>
  );
}
