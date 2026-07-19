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

  const isImage = document.mimeType.startsWith("image/");

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
          ) : isImage ? (
            <div className="flex h-full min-h-[320px] w-full items-center justify-center rounded-[16px] bg-gradient-to-br from-[#E2E8F0] to-[#F8FAFC] ring-1 ring-[#EAEAEA]">
              <div className="text-center">
                <p className="text-[14px] font-semibold text-slate-700">Image preview</p>
                <p className="mt-1 text-[13px] text-slate-500">{document.filename}</p>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[320px] w-full flex-col items-center justify-center rounded-[16px] bg-white ring-1 ring-[#EAEAEA]">
              <div className="mb-3 flex h-16 w-12 items-center justify-center rounded-md bg-[#FEF2F2] text-[13px] font-bold text-[#DC2626] ring-1 ring-[#FECACA]">
                PDF
              </div>
              <p className="text-[14px] font-semibold text-slate-800">PDF preview frame</p>
              <p className="mt-1 max-w-sm text-center text-[13px] text-slate-500">
                Mock storage — real PDF rendering plugs in when cloud storage is connected.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
