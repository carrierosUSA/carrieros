"use client";

import { Clock3 } from "lucide-react";
import type { AlphCommand } from "@/lib/alph/types";

type AlphHistoryProps = {
  items: AlphCommand[];
  onSelect: (command: string) => void;
  onClear?: () => void;
};

export default function AlphHistory({
  items,
  onSelect,
  onClear,
}: AlphHistoryProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
          Recent
        </p>
        {onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="text-[12px] font-medium text-[#64748B] transition hover:text-[#0F172A]"
          >
            Clear
          </button>
        ) : null}
      </div>
      <ul className="space-y-1">
        {items.slice(0, 8).map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item.text)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[#F8FAFC]"
            >
              <Clock3 className="h-4 w-4 shrink-0 text-[#94A3B8]" strokeWidth={1.9} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium text-[#0F172A]">
                  {item.text}
                </span>
                {item.resultTitle ? (
                  <span className="block truncate text-[12px] text-[#64748B]">
                    {item.resultTitle}
                  </span>
                ) : null}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
