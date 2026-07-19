"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useDriverMobile } from "@/components/driver-mobile/DriverMobileProvider";
import { BottomSheet, DmPrimaryButton } from "@/components/driver-mobile/ui";

const QUICK_PROMPTS = [
  "Explain my load instructions",
  "What documents am I missing?",
  "Any appointment risks?",
  "Suggest fuel or parking",
  "Am I in detention?",
];

export default function AlphAssistant() {
  const { state } = useDriverMobile();
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState<string | null>(null);

  const ask = (prompt: string) => {
    const load = state.loads.find((l) => l.id === state.todaysLoadId);
    const answers: Record<string, string> = {
      "Explain my load instructions":
        load?.instructions ??
        "No special instructions on file. Check with dispatch if appointment type is unclear.",
      "What documents am I missing?":
        load?.missingDocs?.length
          ? `Missing for ${load.reference}: ${load.missingDocs.join(", ")}. Upload from Documents.`
          : "No missing documents flagged for today's load.",
      "Any appointment risks?":
        "Delivery window is tight this afternoon. Arrive early — FCFS after 2 PM reduces detention risk.",
      "Suggest fuel or parking":
        state.alphSuggestions.find((s) => s.tone === "success")?.body ??
        "Love’s Travel Stop ~12 mi ahead with competitive diesel pricing.",
      "Am I in detention?":
        load?.detentionActive
          ? "Detention is active. Stop detention when you leave the facility."
          : "Detention is not running. Start it if you've waited past free time.",
    };
    setReply(answers[prompt] ?? state.alphSuggestions[0]?.body ?? "I'm here to help.");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-[calc(88px+env(safe-area-inset-bottom))] right-4 z-40 flex h-14 min-w-14 items-center gap-2 rounded-full bg-[var(--color-info)] px-4 text-white shadow-[0_12px_32px_rgba(37,99,235,0.45)]"
        aria-label="Ask Alph"
      >
        <Sparkles className="h-5 w-5" />
        <span className="pr-1 text-[14px] font-semibold">Alph</span>
      </button>

      {open && (
        <BottomSheet title="Alph · Transpo Driver App™" onClose={() => setOpen(false)}>
          <div className="space-y-3 pb-2">
            <p className="text-[14px] text-[var(--dm-muted)]">
              Load help, missing docs, appointments, fuel, and detention — ask anything.
              Full voice commands at Alph.
            </p>
            <a
              href="/driver/alph"
              className="block text-[14px] font-semibold text-[var(--color-info)]"
            >
              Open Alph voice →
            </a>

            {state.alphSuggestions.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl bg-[var(--dm-elevated)] px-4 py-3"
              >
                <p className="text-[14px] font-semibold">{s.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-[var(--dm-muted)]">
                  {s.body}
                </p>
              </div>
            ))}

            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => ask(p)}
                  className="rounded-full bg-[var(--dm-elevated)] px-3 py-2 text-[12px] font-semibold"
                >
                  {p}
                </button>
              ))}
            </div>

            {reply && (
              <div className="relative rounded-2xl bg-blue-500/10 px-4 py-3 text-[14px] leading-relaxed">
                <button
                  type="button"
                  className="absolute right-2 top-2 rounded-lg p-1 text-[var(--dm-muted)]"
                  onClick={() => setReply(null)}
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
                <p className="pr-6 font-medium text-[var(--color-info)]">Alph</p>
                <p className="mt-1">{reply}</p>
              </div>
            )}

            <DmPrimaryButton onClick={() => ask("Explain my load instructions")}>
              Explain today&apos;s load
            </DmPrimaryButton>
          </div>
        </BottomSheet>
      )}
    </>
  );
}
