import DocumentsSubNav from "@/components/documents/DocumentsSubNav";
import { requireDocumentAuth } from "@/lib/auth/supabase-server";

export default async function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireDocumentAuth();
  return (
    <div className="space-y-4">
      <DocumentsSubNav />
      {children}
    </div>
  );
}
