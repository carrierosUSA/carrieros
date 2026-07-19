import { formatDocumentDateTime } from "@/lib/documents/document-board";
import type { DocumentAuditEntry } from "@/lib/types/documents";

type DocumentAuditLogProps = {
  entries: DocumentAuditEntry[];
};

const ACTION_LABELS: Record<DocumentAuditEntry["action"], string> = {
  uploaded: "Uploaded",
  viewed: "Viewed",
  downloaded: "Downloaded",
  renamed: "Renamed",
  moved: "Moved",
  linked: "Linked",
  unlinked: "Unlinked",
  ocr_applied: "OCR applied",
  shared: "Shared",
  soft_deleted: "Moved to trash",
  restored: "Restored",
  version_created: "New version",
};

export default function DocumentAuditLog({ entries }: DocumentAuditLogProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-8 text-center ring-1 ring-[#EAEAEA]">
        <p className="text-[14px] font-medium text-slate-500">No audit events yet</p>
      </div>
    );
  }

  const sorted = [...entries].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );

  return (
    <div className="space-y-2">
      {sorted.map((entry) => (
        <div
          key={entry.id}
          className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[14px] font-semibold text-slate-900">
                {ACTION_LABELS[entry.action]}
              </p>
              <p className="mt-0.5 text-[13px] text-slate-500">
                {entry.actorName} · {entry.actorRole.replace("_", " ")}
              </p>
              {entry.detail ? (
                <p className="mt-1 text-[13px] text-slate-600">{entry.detail}</p>
              ) : null}
            </div>
            <p className="text-[12px] font-medium text-slate-400">
              {formatDocumentDateTime(entry.occurredAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
