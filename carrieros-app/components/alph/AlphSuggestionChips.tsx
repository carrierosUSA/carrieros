"use client";

import { ALPH_SUGGESTION_COMMANDS } from "@/lib/alph/intents";

type AlphSuggestionChipsProps = {
  onSelect: (command: string) => void;
  commands?: readonly string[];
};

export default function AlphSuggestionChips({
  onSelect,
  commands = ALPH_SUGGESTION_COMMANDS,
}: AlphSuggestionChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {commands.map((command) => (
        <button
          key={command}
          type="button"
          onClick={() => onSelect(command)}
          className="rounded-full bg-[#F5F7FA] px-3.5 py-2 text-[13px] font-medium text-[#334155] transition hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
        >
          {command}
        </button>
      ))}
    </div>
  );
}
