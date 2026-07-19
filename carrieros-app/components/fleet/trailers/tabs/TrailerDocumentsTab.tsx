"use client";

import { TRAILER_DOCUMENT_TYPE_LABELS } from "@/lib/types";
import type { TrailerDocument, TrailerDocumentType } from "@/lib/types";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type TrailerDocumentsTabProps = {
  documents: TrailerDocument[];
};

const documentTypes = Object.keys(
  TRAILER_DOCUMENT_TYPE_LABELS,
) as TrailerDocumentType[];

function statusStyles(status: TrailerDocument["status"]) {
  switch (status) {
    case "valid":
      return CARRIEROS_COLORS.success;
    case "expiring":
      return CARRIEROS_COLORS.warning;
    case "expired":
    case "missing":
      return CARRIEROS_COLORS.critical;
    default:
      return CARRIEROS_COLORS.disabled;
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TrailerDocumentsTab({ documents }: TrailerDocumentsTabProps) {
  const grouped = documentTypes.map((type) => ({
    type,
    label: TRAILER_DOCUMENT_TYPE_LABELS[type],
    items: documents.filter((doc) => doc.type === type),
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px] text-slate-600">
          {documents.length} document{documents.length === 1 ? "" : "s"} on file
        </p>
        <button
          type="button"
          className="inline-flex h-9 items-center rounded-full bg-[#2563EB] px-4 text-[13px] font-semibold text-white"
          title="Document upload will connect to your document service"
        >
          + Upload Document
        </button>
      </div>

      {grouped.map((group) => (
        <section
          key={group.type}
          className="rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA]"
        >
          <h3 className="text-[14px] font-semibold text-slate-950">{group.label}</h3>
          {group.items.length === 0 ? (
            <p className="mt-2 text-[13px] text-slate-500">Not on file</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {group.items.map((doc) => {
                const tone = statusStyles(doc.status);
                return (
                  <li
                    key={doc.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-[#F8FAFC] px-3 py-3 ring-1 ring-[#EAEAEA]"
                  >
                    <div>
                      <p className="text-[14px] font-semibold text-slate-900">
                        {doc.name}
                      </p>
                      <p className="text-[12px] text-slate-500">
                        Uploaded {formatDate(doc.uploadedAt)}
                        {doc.expiresAt
                          ? ` · Expires ${formatDate(doc.expiresAt)}`
                          : ""}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ring-1 ${tone.bg} ${tone.text} ${tone.border}`}
                    >
                      {doc.status}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
