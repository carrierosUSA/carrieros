import Link from "next/link";
import DocumentInboxClient from "@/components/documents/inbox/DocumentInboxClient";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import { listDocumentInboxItems } from "@/lib/alph/document-inbox";
import { requireDocumentAuth } from "@/lib/auth/supabase-server";

export default async function DocumentInboxPage() {
  const auth = await requireDocumentAuth();
  const items = listDocumentInboxItems({
    tenantId: auth.companyId,
    companyId: auth.companyId,
    limit: 80,
  });

  return (
    <OperationalPageShell
      title="AI Document Inbox"
      subtitle="Upload RC or POD — Alph extracts, matches, and prepares drafts. You approve every write."
      eyebrow="Documents · Alph"
      action={
        <div className="flex flex-wrap gap-2">
          <Link
            href="/documents"
            className="inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-[13px] font-semibold text-[#334155] ring-1 ring-[#E2E8F0] transition hover:ring-[#BFDBFE]"
          >
            Document Center
          </Link>
          <Link
            href="/alph/history"
            className="inline-flex h-10 items-center justify-center rounded-full bg-[#2563EB] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            Action history
          </Link>
        </div>
      }
    >
      <DocumentInboxClient initialItems={items} />
    </OperationalPageShell>
  );
}
