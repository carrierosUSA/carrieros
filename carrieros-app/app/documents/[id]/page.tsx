import { Suspense } from "react";
import { notFound } from "next/navigation";
import DocumentDetailShell from "@/components/documents/center/DocumentDetailShell";
import DocumentDetailSkeleton from "@/components/documents/center/DocumentDetailSkeleton";
import { SupabaseDocumentIntakeRepository } from "@/lib/alph/document-intake";
import { requireDocumentAuth } from "@/lib/auth/supabase-server";

type DocumentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DocumentDetailPage({
  params,
}: DocumentDetailPageProps) {
  const { id } = await params;
  const auth = await requireDocumentAuth();
  const record = await new SupabaseDocumentIntakeRepository().getDocument({
    documentId: id,
    companyId: auth.companyId,
    accessToken: auth.accessToken,
  });

  if (!record) {
    notFound();
  }

  return (
    <div className="w-full rounded-[16px] bg-white p-4 text-[#111827] sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1560px]">
        <Suspense fallback={<DocumentDetailSkeleton />}>
          <DocumentDetailShell
            document={record.document}
            role={auth.businessRole}
          />
        </Suspense>
      </div>
    </div>
  );
}
