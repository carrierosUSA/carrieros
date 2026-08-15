import DocumentCenterWorkspace from "./DocumentCenterWorkspace";
import Sidebar from "@/components/Sidebar";
import { SupabaseDocumentIntakeRepository, type PersistedDocumentReview } from "@/lib/alph/document-intake";
import { requireDocumentAuth } from "@/lib/auth/supabase-server";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const auth = await requireDocumentAuth();
  let records: PersistedDocumentReview[] = [];
  try { records = await new SupabaseDocumentIntakeRepository().listDocuments({ companyId: auth.companyId, accessToken: auth.accessToken }); } catch { records = []; }
  return <main className="min-h-screen bg-[#F5F7FB] text-[#0B1220]"><Sidebar/><DocumentCenterWorkspace initialRecords={records} canApprove={["super_admin","owner","accounting"].includes(auth.businessRole)}/></main>;
}
