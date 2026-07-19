"use client";

import { Search } from "lucide-react";

type WorkflowSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
};

export default function WorkflowSearchBar({
  value,
  onChange,
  resultCount,
}: WorkflowSearchBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="relative min-w-[240px] flex-1">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          strokeWidth={2}
        />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search workflows…"
          className="h-11 w-full rounded-xl border-0 bg-[#F8FAFC] pl-10 pr-4 text-[14px] text-slate-900 outline-none ring-1 ring-[#E2E8F0] transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#2563EB]/35"
        />
      </label>
      <p className="text-[13px] font-medium text-slate-500">
        {resultCount} workflow{resultCount === 1 ? "" : "s"}
      </p>
    </div>
  );
}
