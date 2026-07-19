"use client";

import { ENTITY_TYPE_LABELS } from "@/lib/communications/entities";
import type { EntityType } from "@/lib/communications/types";

type EntityFilterProps = {
  value: EntityType | "all";
  onChange: (value: EntityType | "all") => void;
};

const OPTIONS: Array<EntityType | "all"> = [
  "all",
  "load",
  "driver",
  "truck",
  "trailer",
  "broker",
  "company",
];

export default function EntityFilter({ value, onChange }: EntityFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {OPTIONS.map((option) => {
        const active = value === option;
        const label =
          option === "all" ? "Any entity" : ENTITY_TYPE_LABELS[option];

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition ${
              active
                ? "bg-[#111827] text-white"
                : "text-[#64748B] hover:bg-[#F5F7FA] hover:text-[#111827]"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
