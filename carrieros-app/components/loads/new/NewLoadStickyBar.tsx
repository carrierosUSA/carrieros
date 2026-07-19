"use client";

import Link from "next/link";

type NewLoadStickyBarProps = {
  draftStatus: "idle" | "saving" | "saved";
  onSaveDraft: () => void;
  isSubmitting?: boolean;
};

export default function NewLoadStickyBar({
  draftStatus,
  onSaveDraft,
  isSubmitting = false,
}: NewLoadStickyBarProps) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 border-t border-[#EAEAEA] bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/loads"
            className="inline-flex h-10 items-center rounded-full px-4 text-[14px] font-medium text-slate-600 transition hover:bg-[#F8FAFC] hover:text-slate-900"
          >
            Cancel
          </Link>
          {draftStatus === "saved" ? (
            <span className="text-[12px] font-medium text-emerald-600">Draft saved</span>
          ) : draftStatus === "saving" ? (
            <span className="text-[12px] font-medium text-slate-400">Saving…</span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSaveDraft}
            className="inline-flex h-10 items-center rounded-full border border-[#EAEAEA] bg-white px-5 text-[14px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-[#FAFBFC]"
          >
            Save draft
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-10 items-center rounded-full bg-[#2563EB] px-6 text-[14px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:opacity-60"
          >
            {isSubmitting ? "Creating…" : "Create load"}
          </button>
        </div>
      </div>
    </div>
  );
}
