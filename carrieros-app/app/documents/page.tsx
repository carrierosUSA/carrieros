import DocumentCenterWorkspace from "./DocumentCenterWorkspace";
import Sidebar from "@/components/Sidebar";
import { SupabaseDocumentIntakeRepository, type PersistedDocumentReview } from "@/lib/alph/document-intake";
import { requireDocumentAuth } from "@/lib/auth/supabase-server";
import { canCreateLoads } from "@/lib/auth/load-permissions";
import { LoadOperationsRepository } from "@/lib/operations/load-repository";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const auth = await requireDocumentAuth();
  let records: PersistedDocumentReview[] = [];
  try { records = await new SupabaseDocumentIntakeRepository().listDocuments({ companyId: auth.companyId, accessToken: auth.accessToken }); } catch { records = []; }
  if (records.length) {
    try {
      const loadIds = await new LoadOperationsRepository().findBySourceDocuments({
        companyId: auth.companyId,
        accessToken: auth.accessToken,
        documentIds: records.map((record) => record.id),
      });
      records = records.map((record) => ({
        ...record,
        operationalLoadId: loadIds.get(record.id),
      }));
    } catch {
      // Document Center remains available before load operations are configured.
    }
  }
  return <main className="min-h-screen bg-[#F5F7FB] text-[#0B1220]"><Sidebar/><DocumentCenterWorkspace initialRecords={records} canApprove={["super_admin","owner","accounting"].includes(auth.businessRole)} canCreateLoad={canCreateLoads(auth.businessRole)}/></main>;
}
