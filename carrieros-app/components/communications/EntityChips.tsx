import Link from "next/link";
import { resolveLinkedEntityChips } from "@/lib/communications/entities";
import type { LinkedEntities } from "@/lib/communications/types";
import { ENTITY_TYPE_LABELS } from "@/lib/communications/entities";

type EntityChipsProps = {
  linkedTo: LinkedEntities;
  className?: string;
};

export default function EntityChips({
  linkedTo,
  className = "",
}: EntityChipsProps) {
  const chips = resolveLinkedEntityChips(linkedTo);

  if (chips.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {chips.map((chip) => (
        <Link
          key={`${chip.type}-${chip.id}`}
          href={chip.href}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#F5F7FA] px-2.5 py-1 text-[12px] font-medium text-[#334155] transition hover:bg-[#EFF6FF] hover:text-[#2563EB]"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
            {ENTITY_TYPE_LABELS[chip.type]}
          </span>
          <span>{chip.label}</span>
        </Link>
      ))}
    </div>
  );
}
