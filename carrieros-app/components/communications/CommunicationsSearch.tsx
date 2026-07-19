"use client";

import { Search } from "lucide-react";

type CommunicationsSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function CommunicationsSearch({
  value,
  onChange,
}: CommunicationsSearchProps) {
  return (
    <label className="relative block">
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]"
        strokeWidth={1.9}
        aria-hidden
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search body, subject, people…"
        className="h-11 w-full rounded-xl bg-[#F5F7FA] pl-10 pr-3.5 text-[14px] text-[#111827] outline-none transition placeholder:text-[#94A3B8] focus:bg-white focus:ring-2 focus:ring-[#BFDBFE]"
      />
    </label>
  );
}
