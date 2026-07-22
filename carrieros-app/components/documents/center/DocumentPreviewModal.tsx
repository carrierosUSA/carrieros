"use client";

import type { CarrierDocument } from "@/lib/types/documents";
import { DOCUMENT_CATEGORY_LABELS } from "@/lib/types/documents";

type DocumentPreviewModalProps = {
  document: CarrierDocument | null;
  onClose: () => void;
};

export default function DocumentPreviewModal({
  document,
  onClose,
}: DocumentPreviewModalProps) {
  if (!document) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close preview"
        className="absolute inset-0 bg-slate-950/40"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_24px_64px_rgba(15,23,42,0.2)]">
        <div className="flex items-start justify-between gap-3 border-b border-[#EAEAEA] px-5 py-4">
          <div className="min-w-0">
            <p className="truncate text-[16px] font-semibold text-slate-950">
              {document.filename}
            </p>
            <p className="mt-0.5 text-[13px] text-slate-500">
              {DOCUMENT_CATEGORY_LABELS[document.category]} · Preview
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 shrink-0 items-center rounded-full bg-[#F8FAFC] px-4 text-[13px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA]"
          >
            Close
          </button>
        </div>

        <div className="flex min-h-[360px] flex-1 items-center justify-center bg-[#F5F7FA] p-6">
          {document.status === "missing" ? (
            <p className="text-[15px] font-medium text-slate-500">
              No file available — upload to preview.
            </p>
          ) : document.previewUrl ? (
            <iframe
              title={`Preview ${document.filename}`}
              src={document.previewUrl}
              className="h-[70vh] min-h-[420px] w-full rounded-[16px] bg-white ring-1 ring-[#EAEAEA]"
            />
          ) : (
            <p className="text-[15px] font-medium text-slate-500">
              The private preview link is unavailable. Refresh and try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
