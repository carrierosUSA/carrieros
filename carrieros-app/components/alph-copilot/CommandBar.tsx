"use client";

import { useRouter } from "next/navigation";
import { Sparkles, X } from "lucide-react";
import {
  useCallback,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import AlphVoiceButton from "@/components/alph/AlphVoiceButton";
import AiPolicyNotice from "@/components/ai-safety/AiPolicyNotice";
import { useAiSafety } from "@/components/ai-safety/AiSafetyProvider";
import {
  alphIntentToActionKind,
  CONFIDENCE_LABELS,
} from "@/lib/ai-safety";
import {
  getCopilotCommand,
  listCopilotCommands,
  matchCopilotCommand,
  pushCommandResult,
  runCopilotCommand,
  type CopilotCommandResult,
  type CopilotRole,
} from "@/lib/alph-copilot";

type CommandBarProps = {
  role: CopilotRole;
  chips?: string[];
  onRan?: () => void;
};

export default function CommandBar({
  role,
  chips,
  onRan,
}: CommandBarProps) {
  const router = useRouter();
  const { runAiSuggestedAction } = useAiSafety();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<CopilotCommandResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const defaultChips =
    chips ??
    listCopilotCommands(role)
      .slice(0, 6)
      .map((c) => c.phrase);

  const execute = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text) return;
      setQuery(text);

      startTransition(async () => {
        const matched =
          matchCopilotCommand(text, role) ?? getCopilotCommand(text);

        if (matched?.risk === "confirm") {
          const gate = await runAiSuggestedAction({
            kind: alphIntentToActionKind(matched.id),
            suggestion: matched.label,
            confidence: "review_recommended",
            reason: matched.description,
            dataUsed: ["Alph Copilot™ command catalog", matched.phrase],
            source: "alph-copilot",
            onConfirm: () => {
              const outcome = runCopilotCommand(matched.id, {
                role,
                byId: true,
                confirmed: true,
                skipAudit: true,
              });
              if ("needsConfirm" in outcome) return;
              setResult(outcome);
              pushCommandResult(outcome);
              onRan?.();
              if (outcome.href) router.push(outcome.href);
            },
          });
          if (!gate.executed) {
            setResult({
              commandId: matched.id,
              phrase: matched.phrase,
              title: matched.label,
              body: gate.reason,
              requiresConfirm: true,
              confirmed: false,
              ranAt: new Date().toISOString(),
            });
          }
          return;
        }

        const outcome = runCopilotCommand(text, { role, confirmed: true });
        if ("needsConfirm" in outcome) return;
        setResult(outcome);
        pushCommandResult(outcome);
        onRan?.();
      });
    },
    [onRan, role, router, runAiSuggestedAction],
  );

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    execute(query);
  }

  return (
    <section className="rounded-[20px] bg-white p-4 shadow-[inset_0_0_0_1px_#EAEAEA] sm:p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#2563EB]" strokeWidth={1.9} />
        <h2 className="text-[16px] font-semibold text-[#111827]">One command</h2>
      </div>
      <p className="mt-1 text-[13px] text-[#6B7280]">
        Say it once — Alph navigates or prepares the action. Risky moves ask first.
      </p>
      <div className="mt-2">
        <AiPolicyNotice variant="compact" />
      </div>

      <form onSubmit={onSubmit} className="mt-3">
        <div className="flex items-center gap-3 rounded-[16px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#E2E8F0] transition focus-within:bg-white focus-within:ring-[#2563EB] focus-within:shadow-[0_0_0_4px_rgba(37,99,235,0.12)]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try "Assign best driver." or "Handle payroll."'
            className="min-w-0 flex-1 bg-transparent text-[15px] text-[#111827] outline-none placeholder:text-[#94A3B8]"
            aria-label="Alph Copilot command"
          />
          <AlphVoiceButton
            onTranscript={(text, isFinal) => {
              setQuery(text);
              if (isFinal) execute(text);
            }}
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear"
              className="grid h-8 w-8 place-items-center rounded-full text-[#94A3B8] hover:bg-[#F1F5F9]"
              onClick={() => {
                setQuery("");
                setResult(null);
              }}
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {defaultChips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => execute(chip)}
            className="rounded-full bg-[#F5F7FA] px-3 py-1.5 text-[12px] font-medium text-[#475569] transition hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
          >
            {chip}
          </button>
        ))}
      </div>

      {isPending ? (
        <div className="mt-4 h-16 animate-pulse rounded-[14px] bg-[#F1F5F9]" />
      ) : null}

      {result ? (
        <div className="mt-4 rounded-[14px] bg-[#EFF6FF] px-4 py-3">
          <p className="text-[14px] font-semibold text-[#1D4ED8]">{result.title}</p>
          <p className="mt-1 text-[13px] text-[#1E3A8A]">{result.body}</p>
          {result.href && result.confirmed !== false ? (
            <button
              type="button"
              onClick={() => router.push(result.href!)}
              className="mt-3 rounded-full bg-[#2563EB] px-3 py-1.5 text-[12px] font-semibold text-white"
            >
              Open
            </button>
          ) : null}
          <p className="mt-2 text-[12px] text-[#64748B]">
            Confidence:{" "}
            {result.requiresConfirm
              ? CONFIDENCE_LABELS.review_recommended
              : CONFIDENCE_LABELS.high}
          </p>
        </div>
      ) : null}
    </section>
  );
}
