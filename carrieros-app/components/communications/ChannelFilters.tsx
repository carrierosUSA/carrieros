"use client";

import { CHANNEL_META } from "@/components/communications/channel-meta";
import type { CommunicationChannel } from "@/lib/communications/types";

type ChannelFiltersProps = {
  value: CommunicationChannel | "all";
  counts: Record<CommunicationChannel | "all", number>;
  onChange: (value: CommunicationChannel | "all") => void;
};

const OPTIONS: Array<CommunicationChannel | "all"> = [
  "all",
  "voice",
  "sms",
  "email",
  "chat",
];

export default function ChannelFilters({
  value,
  counts,
  onChange,
}: ChannelFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((option) => {
        const active = value === option;
        const label =
          option === "all" ? "All" : CHANNEL_META[option].label;
        const count = counts[option] ?? 0;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold transition ${
              active
                ? "bg-[#2563EB] text-white"
                : "bg-[#F5F7FA] text-[#475569] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
            }`}
          >
            {label}
            <span
              className={`rounded-full px-1.5 text-[11px] font-bold ${
                active ? "bg-white/20 text-white" : "bg-white text-[#64748B]"
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
