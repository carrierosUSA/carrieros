"use client";

import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_LABELS,
  type DocumentCategory,
} from "@/lib/types/documents";

type DocumentFiltersProps = {
  category: DocumentCategory | "all";
  onChange: (category: DocumentCategory | "all") => void;
  counts: Record<DocumentCategory | "all", number>;
};

export default function DocumentFilters({
  category,
  onChange,
  counts,
}: DocumentFiltersProps) {
  const options: Array<{ id: DocumentCategory | "all"; label: string }> = [
    { id: "all", label: "All" },
    ...DOCUMENT_CATEGORIES.map((id) => ({
      id,
      label: DOCUMENT_CATEGORY_LABELS[id],
    })),
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {options.map((option) => {
        const active = category === option.id;
        const count = counts[option.id] ?? 0;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
              active
                ? "bg-[#2563EB] text-white"
                : "bg-[#F8FAFC] text-slate-600 ring-1 ring-[#EAEAEA] hover:bg-white hover:text-slate-900"
            }`}
          >
            {option.label}
            <span
              className={`tabular-nums ${
                active ? "text-blue-100" : "text-slate-400"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
