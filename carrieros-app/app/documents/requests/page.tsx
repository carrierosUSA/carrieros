import Link from "next/link";
import DocumentRequestPanel from "@/components/documents/DocumentRequestPanel";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import { getPendingRequests } from "@/lib/documents/document-health-store";

export default function DocumentRequestsPage() {
  const requests = getPendingRequests();

  return (
    <OperationalPageShell
      title="Document Requests"
      subtitle="Track pending driver and broker document requests."
      eyebrow="Document Operations"
      action={
        <Link
          href="/documents/health"
          className="inline-flex h-10 items-center justify-center rounded-full bg-[#2563EB] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
        >
          Document Health
        </Link>
      }
    >
      <DocumentRequestPanel requests={requests} />
    </OperationalPageShell>
  );
}
