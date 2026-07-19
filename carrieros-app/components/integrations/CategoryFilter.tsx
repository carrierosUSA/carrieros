"use client";

import {
  INTEGRATION_CATEGORY_LABELS,
  INTEGRATION_CATEGORY_ORDER,
  type IntegrationCategory,
} from "@/lib/integrations";

type CategoryFilterProps = {
  value: IntegrationCategory | "all";
  onChange: (value: IntegrationCategory | "all") => void;
  counts: Partial<Record<IntegrationCategory | "all", number>>;
};

const FILTERS: Array<IntegrationCategory | "all"> = [
  "all",
  ...INTEGRATION_CATEGORY_ORDER,
  "marketplace",
];

export default function CategoryFilter({
  value,
  onChange,
  counts,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((id) => {
        const label =
          id === "all" ? "All" : INTEGRATION_CATEGORY_LABELS[id];
        const active = value === id;
        const count = counts[id];

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition ${
              active
                ? "bg-[#2563EB] text-white shadow-[0_6px_16px_rgba(37,99,235,0.25)]"
                : "bg-[#F8FAFC] text-slate-600 ring-1 ring-[#E2E8F0] hover:bg-[#F1F5F9] hover:text-slate-900"
            }`}
          >
            {label}
            {typeof count === "number" ? (
              <span
                className={`tabular-nums ${
                  active ? "text-white/80" : "text-slate-400"
                }`}
              >
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
