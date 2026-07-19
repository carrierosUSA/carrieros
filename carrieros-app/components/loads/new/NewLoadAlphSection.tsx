"use client";

import { GlowingStarIcon } from "@/components/dispatch/load-detail/LoadDetailAlphIssueActions";
import NewLoadSectionCard from "@/components/loads/new/NewLoadSectionCard";
import type { RateConExtractionResult } from "@/lib/forms/rate-con-extraction";

type NewLoadAlphSectionProps = {
  status: "idle" | "processing" | "ready" | "error";
  extraction: RateConExtractionResult | null;
  errorMessage?: string;
  onApply: () => void;
  onDismiss: () => void;
};

export default function NewLoadAlphSection({
  status,
  extraction,
  errorMessage,
  onApply,
  onDismiss,
}: NewLoadAlphSectionProps) {
  if (status === "idle") {
    return (
      <NewLoadSectionCard
        title="Alph AI"
        description="Upload a rate confirmation and Alph will extract load details for review."
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EAEAEA] bg-[#FAFBFC] px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
            <GlowingStarIcon />
            Waiting for PDF
          </span>
        }
      >
        <p className="sm:col-span-2 text-[13px] leading-relaxed text-slate-500">
          Alph reads rate confirmations and pre-fills rate, stops, temperature, and broker
          requirements. You review and confirm before saving.
        </p>
      </NewLoadSectionCard>
    );
  }

  if (status === "processing") {
    return (
      <NewLoadSectionCard
        title="Alph AI"
        description="Reading your rate confirmation…"
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-0.5 text-[11px] font-semibold text-[#2563EB]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2563EB]" />
            Processing
          </span>
        }
      >
        <div className="sm:col-span-2 space-y-2">
          {[1, 2, 3].map((row) => (
            <div
              key={row}
              className="h-10 animate-pulse rounded-xl bg-gradient-to-r from-[#F1F5F9] via-[#E2E8F0] to-[#F1F5F9] bg-[length:200%_100%] [animation:carrieros-shimmer_1.4s_ease-in-out_infinite]"
            />
          ))}
        </div>
      </NewLoadSectionCard>
    );
  }

  if (status === "error") {
    return (
      <NewLoadSectionCard title="Alph AI" description="Could not read this file.">
        <div className="sm:col-span-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-3">
          <p className="text-[14px] font-medium text-[#B91C1C]">
            {errorMessage ?? "Alph couldn't extract fields from this PDF."}
          </p>
          <button
            type="button"
            onClick={onDismiss}
            className="mt-2 text-[13px] font-semibold text-[#2563EB]"
          >
            Dismiss
          </button>
        </div>
      </NewLoadSectionCard>
    );
  }

  return (
    <NewLoadSectionCard
      title="Alph AI"
      description={`Extracted from ${extraction?.fileName ?? "rate confirmation"}`}
      action={
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/60 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
          <GlowingStarIcon />
          Ready to review
        </span>
      }
    >
      <div className="sm:col-span-2 max-h-52 space-y-2 overflow-y-auto pr-1">
        {extraction?.fields.map((field) => (
          <div
            key={field.key}
            className="flex items-start justify-between gap-3 rounded-xl border border-[#EAEAEA] bg-[#FAFBFC] px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-slate-500">{field.label}</p>
              <p className="truncate text-[14px] font-semibold text-slate-900">{field.value}</p>
            </div>
            <span className="shrink-0 text-[11px] font-semibold text-emerald-600">
              {Math.round(field.confidence * 100)}%
            </span>
          </div>
        ))}
      </div>
      <div className="sm:col-span-2 flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={onApply}
          className="inline-flex h-10 items-center rounded-full bg-[#2563EB] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
        >
          Apply to form
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex h-10 items-center rounded-full px-4 text-[13px] font-medium text-slate-500 transition hover:bg-[#F8FAFC] hover:text-slate-700"
        >
          Dismiss
        </button>
      </div>
    </NewLoadSectionCard>
  );
}
