import WorkforceStatusBadge from "@/components/workforce/WorkforceStatusBadge";
import type { WorkforceDocument } from "@/lib/types/workforce";

export default function DocumentsClient({ documents }: { documents: WorkforceDocument[] }) {
  return (
    <div className="space-y-4">
      <p className="text-[14px] text-[#6B7280]">
        Workforce documents for candidates, companies, and applications. Upload actions use the
        same patterns as company Documents when connected.
      </p>
      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-[#F8F9FB] px-4 py-3"
          >
            <div>
              <p className="text-[14px] font-semibold text-[#111827]">{doc.name}</p>
              <p className="text-[13px] text-[#6B7280]">
                {doc.category} · {doc.ownerType} ·{" "}
                {doc.uploadedAt
                  ? `Uploaded ${new Date(doc.uploadedAt).toLocaleDateString()}`
                  : "Awaiting upload"}
                {doc.expiresAt ? ` · Expires ${doc.expiresAt}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <WorkforceStatusBadge status={doc.status} />
              <button
                type="button"
                disabled={!doc.uploadedAt}
                title={
                  doc.uploadedAt
                    ? "Open document (demo placeholder)"
                    : "Document not uploaded yet"
                }
                className="rounded-full px-3 py-1.5 text-[13px] font-medium text-[#2563EB] shadow-[inset_0_0_0_1px_#BFDBFE] disabled:cursor-not-allowed disabled:text-[#94A3B8] disabled:shadow-[inset_0_0_0_1px_#E2E8F0]"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
