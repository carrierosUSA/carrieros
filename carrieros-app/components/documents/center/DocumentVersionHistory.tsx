import { formatDocumentDateTime, formatFileSize } from "@/lib/documents/document-board";
import type { DocumentVersion } from "@/lib/types/documents";

type DocumentVersionHistoryProps = {
  versions: DocumentVersion[];
};

export default function DocumentVersionHistory({
  versions,
}: DocumentVersionHistoryProps) {
  if (versions.length === 0) {
    return (
      <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-8 text-center ring-1 ring-[#EAEAEA]">
        <p className="text-[14px] font-medium text-slate-500">No versions on file</p>
      </div>
    );
  }

  const sorted = [...versions].sort((a, b) => b.version - a.version);

  return (
    <div className="space-y-2">
      {sorted.map((version) => (
        <div
          key={version.id}
          className="flex flex-wrap items-start justify-between gap-3 rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]"
        >
          <div>
            <p className="text-[14px] font-semibold text-slate-900">
              Version {version.version}
              {version.version === sorted[0]?.version ? (
                <span className="ml-2 text-[12px] font-medium text-[#16A34A]">
                  Current
                </span>
              ) : null}
            </p>
            <p className="mt-0.5 text-[13px] text-slate-600">{version.filename}</p>
            {version.note ? (
              <p className="mt-1 text-[13px] text-slate-500">{version.note}</p>
            ) : null}
          </div>
          <div className="text-right text-[12px] text-slate-500">
            <p className="font-medium">{formatFileSize(version.sizeBytes)}</p>
            <p className="mt-0.5">{formatDocumentDateTime(version.uploadedAt)}</p>
            <p className="mt-0.5">{version.uploadedBy}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
