"use client";

import { Search, X } from "lucide-react";

type NotificationSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function NotificationSearch({
  value,
  onChange,
  placeholder = "Search notifications…",
}: NotificationSearchProps) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]"
        strokeWidth={1.9}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border-0 bg-[#F5F7FA] pl-9 pr-9 text-sm text-[#111827] outline-none ring-1 ring-[#E8ECF2] transition placeholder:text-[#94A3B8] focus:bg-white focus:ring-[#93C5FD]"
        aria-label="Search notifications"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-[#6B7280] hover:bg-white"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
