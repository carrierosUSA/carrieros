"use client";

import { GlowingStarIcon } from "@/components/dispatch/load-detail/LoadDetailAlphIssueActions";
import type { DocumentOcrResult } from "@/lib/documents/document-ocr";
import { DOCUMENT_CATEGORY_LABELS } from "@/lib/types/documents";

type DocumentAlphOcrReviewProps = {
  status: "idle" | "processing" | "ready" | "error";
  result: DocumentOcrResult | null;
  errorMessage?: string;
  onApply: () => void;
  onDismiss: () => void;
};

export default function DocumentAlphOcrReview({
  status,
  result,
  errorMessage,
  onApply,
  onDismiss,
}: DocumentAlphOcrReviewProps) {
  if (status === "idle") {
    return null;
  }

  if (status === "processing") {
    return (
      <div className="rounded-[16px] border border-[#BFDBFE] bg-[#EFF6FF] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[15px] font-semibold text-slate-950">Alph AI OCR</p>
            <p className="mt-0.5 text-[13px] text-slate-600">
              Reading document and suggesting links…
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#BFDBFE] bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[#2563EB]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2563EB]" />
            Processing
          </span>
        </div>
        <div className="mt-4 space-y-2">
          {[1, 2, 3].map((row) => (
            <div
              key={row}
              className="h-10 animate-[carrieros-shimmer_1.4s_ease-in-out_infinite] rounded-xl bg-gradient-to-r from-[#DBEAFE] via-[#EFF6FF] to-[#DBEAFE] bg-[length:200%_100%]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-[16px] border border-[#FECACA] bg-[#FEF2F2] p-5">
        <p className="text-[15px] font-semibold text-[#B91C1C]">Alph could not read this file</p>
        <p className="mt-1 text-[14px] text-[#B91C1C]">
          {errorMessage ?? "Try another PDF or image."}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-3 text-[13px] font-semibold text-[#2563EB]"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-[16px] border border-[#BBF7D0] bg-[#ECFDF3]/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[15px] font-semibold text-slate-950">Alph AI OCR</p>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-white px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
              <GlowingStarIcon />
              Ready to review
            </span>
          </div>
          <p className="mt-1 text-[13px] text-slate-600">
            Extracted from {result?.fileName}
            {result ? ` · ${DOCUMENT_CATEGORY_LABELS[result.category]}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-4 max-h-56 space-y-2 overflow-y-auto pr-1">
        {result?.fields.map((field) => (
          <div
            key={field.key}
            className="flex items-start justify-between gap-3 rounded-xl border border-[#EAEAEA] bg-white px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-slate-500">{field.label}</p>
              <p className="truncate text-[14px] font-semibold text-slate-900">
                {field.value}
              </p>
            </div>
            <span className="shrink-0 text-[11px] font-semibold text-emerald-600">
              {Math.round(field.confidence * 100)}%
            </span>
          </div>
        ))}
      </div>

      {result?.suggestedLinks ? (
        <p className="mt-3 text-[13px] text-slate-600">
          Suggested links:{" "}
          <span className="font-semibold text-slate-900">
            {[
              result.suggestedLinks.loadId,
              result.suggestedLinks.driverId,
              result.suggestedLinks.truckId,
              result.suggestedLinks.trailerId,
              result.suggestedLinks.brokerId,
            ]
              .filter(Boolean)
              .join(" · ") || "Company only"}
          </span>
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onApply}
          className="inline-flex h-10 items-center rounded-full bg-[#2563EB] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
        >
          Confirm & link
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex h-10 items-center rounded-full px-4 text-[13px] font-medium text-slate-500 transition hover:bg-white hover:text-slate-700"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
