"use client";

import Link from "next/link";
import DocumentStatusBadge from "@/components/documents/center/DocumentStatusBadge";
import {
  formatDocumentDate,
  formatFileSize,
  getLinkSummary,
} from "@/lib/documents/document-board";
import { DOCUMENT_CATEGORY_LABELS } from "@/lib/types/documents";
import type { CarrierDocument } from "@/lib/types/documents";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type DocumentCardProps = {
  document: CarrierDocument;
  onPreview?: (document: CarrierDocument) => void;
};

function categoryIcon(category: CarrierDocument["category"]): string {
  if (category === "rate_confirmation" || category === "invoice") return "RC";
  if (category === "pod") return "PD";
  if (category === "bol") return "BL";
  if (category.includes("fuel") || category.includes("lumper")) return "RX";
  if (category.includes("driver")) return "DR";
  if (category.includes("truck") || category.includes("trailer")) return "FL";
  if (category === "insurance" || category === "permit") return "IN";
  return "DC";
}

export default function DocumentCard({ document, onPreview }: DocumentCardProps) {
  const isImage = document.mimeType.startsWith("image/");
  const callout =
    document.status === "missing"
      ? CARRIEROS_COLORS.warning
      : document.status === "expiring"
        ? CARRIEROS_COLORS.critical
        : document.status === "pending_review"
          ? CARRIEROS_COLORS.info
          : null;

  return (
    <div
      className={`group rounded-[16px] border bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)] ${
        callout ? `${callout.border}` : "border-[#EAEAEA]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] text-[13px] font-bold ${
            callout
              ? `${callout.bg} ${callout.text}`
              : "bg-[#EFF6FF] text-[#2563EB]"
          }`}
        >
          {categoryIcon(document.category)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/documents/${document.id}`}
              className="truncate text-[16px] font-semibold text-slate-950 transition hover:text-[#2563EB]"
            >
              {document.filename}
            </Link>
            <DocumentStatusBadge status={document.status} />
          </div>
          <p className="mt-0.5 text-[13px] text-slate-500">
            {DOCUMENT_CATEGORY_LABELS[document.category]}
            {isImage ? " · Image" : " · PDF"}
            {" · "}
            {formatFileSize(document.sizeBytes)}
          </p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 text-[12px]">
        <div className="min-w-0">
          <dt className="font-medium text-slate-400">Linked to</dt>
          <dd className="truncate font-semibold text-slate-800">
            {getLinkSummary(document)}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="font-medium text-slate-400">Uploaded</dt>
          <dd className="truncate font-semibold text-slate-800">
            {formatDocumentDate(document.uploadedAt)}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="font-medium text-slate-400">By</dt>
          <dd className="truncate font-semibold text-slate-800">
            {document.uploadedBy}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="font-medium text-slate-400">Tags</dt>
          <dd className="truncate font-semibold text-slate-800">
            {document.tags.length > 0 ? document.tags.slice(0, 3).join(", ") : "—"}
          </dd>
        </div>
      </dl>

      {document.encrypted ? (
        <p className="mt-3 text-[11px] font-medium text-slate-400">
          Encrypted storage · {document.storageProvider.toUpperCase()}
        </p>
      ) : null}

      <div className="mt-4 flex gap-2">
        <Link
          href={`/documents/${document.id}`}
          className="inline-flex h-8 flex-1 items-center justify-center rounded-lg bg-[#2563EB] text-[12px] font-semibold text-white transition hover:bg-[#1D4ED8]"
        >
          Open
        </Link>
        <button
          type="button"
          onClick={() => onPreview?.(document)}
          disabled={document.status === "missing"}
          title={
            document.status === "missing"
              ? "No file to preview"
              : "Preview document"
          }
          className="inline-flex h-8 flex-1 items-center justify-center rounded-lg bg-[#F8FAFC] text-[12px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Preview
        </button>
      </div>
    </div>
  );
}
