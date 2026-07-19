"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

export type AlphAssistAction = {
  id: string;
  label: string;
  run: () => string;
};

export default function AlphAssistPanel({
  title = "Alph assist",
  actions,
}: {
  title?: string;
  actions: AlphAssistAction[];
}) {
  const [output, setOutput] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section className="rounded-[16px] bg-[#F8F9FB] p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-white text-[#2563EB] shadow-[inset_0_0_0_1px_#EAEAEA]">
          <Sparkles className="h-4 w-4" strokeWidth={1.9} aria-hidden />
        </span>
        <div>
          <h3 className="text-[15px] font-semibold text-[#111827]">{title}</h3>
          <p className="text-[13px] text-[#6B7280]">
            Local Alph helpers — draft content you can copy into offers, posts, or notes.
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => {
              setActiveId(action.id);
              setOutput(action.run());
            }}
            className={`rounded-full px-3 py-2 text-[13px] font-medium transition ${
              activeId === action.id
                ? "bg-[#2563EB] text-white"
                : "bg-white text-[#334155] shadow-[inset_0_0_0_1px_#E5E7EB] hover:text-[#111827]"
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
      {output ? (
        <pre className="mt-4 max-h-[280px] overflow-auto whitespace-pre-wrap rounded-[12px] bg-white p-4 text-[13px] leading-relaxed text-[#334155] shadow-[inset_0_0_0_1px_#EAEAEA]">
          {output}
        </pre>
      ) : null}
    </section>
  );
}
