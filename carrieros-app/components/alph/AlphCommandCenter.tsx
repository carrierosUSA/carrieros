"use client";

import { ArrowUp, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
  useTransition,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { runAlphCommandAction } from "@/app/actions/alph";
import AlphAgentStatus from "@/components/alph/AlphAgentStatus";
import AlphHistory from "@/components/alph/AlphHistory";
import AlphResultCard from "@/components/alph/AlphResultCard";
import AlphSuggestionChips from "@/components/alph/AlphSuggestionChips";
import AlphVoiceButton from "@/components/alph/AlphVoiceButton";
import AiPolicyNotice from "@/components/ai-safety/AiPolicyNotice";
import {
  alphIntentToActionKind,
  appendAiAudit,
  requiresHumanConfirmation,
  scoreToConfidenceLevel,
} from "@/lib/ai-safety";
import {
  clearAlphHistory,
  listAlphHistory,
  pushAlphHistory,
} from "@/lib/alph/history";
import type { AlphCommand, AlphResult } from "@/lib/alph/types";

type AlphCommandCenterProps = {
  initialQuery?: string;
  compact?: boolean;
};

export default function AlphCommandCenter({
  initialQuery = "",
  compact = false,
}: AlphCommandCenterProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<AlphResult | null>(null);
  const [history, setHistory] = useState<AlphCommand[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setHistory(listAlphHistory());
  }, []);

  const runCommand = useCallback(
    (raw: string, options?: { autoNavigate?: boolean }) => {
      const text = raw.trim();
      if (!text) {
        return;
      }

      setQuery(text);
      setError(null);

      startTransition(async () => {
        try {
          const response = await runAlphCommandAction(text);
          setResult(response.result);
          setHistory(
            pushAlphHistory({
              text,
              resultTitle: response.result.title,
            }),
          );

          const kind = alphIntentToActionKind(response.result.intent);
          appendAiAudit({
            actionKind: kind,
            aiAction: "Alph command suggestion",
            suggestion: response.result.title,
            approval: requiresHumanConfirmation(kind)
              ? "pending"
              : "not_required",
            confidence: scoreToConfidenceLevel(response.result.confidence),
            dataUsed: ["Alph command parser", response.result.intent],
            source: "alph-command-center",
          });

          const gated = requiresHumanConfirmation(kind);
          if (
            options?.autoNavigate &&
            !gated &&
            response.result.type === "navigate" &&
            response.result.href &&
            response.result.confidence >= 0.85
          ) {
            router.push(response.result.href);
          }
        } catch {
          setError("Alph couldn't run that command. Try again.");
        }
      });
    },
    [router],
  );

  useEffect(() => {
    if (initialQuery.trim()) {
      runCommand(initialQuery);
    }
  }, [initialQuery, runCommand]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    runCommand(query);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      runCommand(query);
    }
  };

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  const handleVoice = useCallback(
    (transcript: string, isFinal: boolean) => {
      setQuery(transcript);
      if (isFinal && transcript.trim()) {
        runCommand(transcript);
      }
    },
    [runCommand],
  );

  return (
    <div className={compact ? "space-y-5" : "space-y-8"}>
      <section
        className={
          compact
            ? "space-y-4"
            : "relative overflow-hidden rounded-[24px] bg-gradient-to-b from-white via-white to-[#F8FAFC] px-5 py-8 sm:px-8 sm:py-10"
        }
      >
        {!compact ? (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.08),_transparent_70%)]" />
        ) : null}

        <div className="relative mx-auto max-w-3xl text-center">
          {!compact ? (
            <>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-[#2563EB] ring-1 ring-[#DBEAFE]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
                Alph Command Center
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-[#0F172A] sm:text-[40px]">
                Ask Alph anything
              </h1>
              <p className="mx-auto mt-2 max-w-xl text-[15px] leading-relaxed text-[#64748B]">
                Natural language for dispatch, fleet, finance, and documents —
                voice ready, agent ready.
              </p>
              <div className="mx-auto mt-3 max-w-xl">
                <AiPolicyNotice variant="assist" />
              </div>
            </>
          ) : null}

          <form
            onSubmit={handleSubmit}
            className={`relative mx-auto ${compact ? "" : "mt-8"} max-w-2xl`}
          >
            <div className="flex items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white px-3 py-2 shadow-[0_16px_40px_rgba(15,23,42,0.06)] focus-within:border-[#93C5FD] focus-within:ring-4 focus-within:ring-[#DBEAFE]/70">
              <Sparkles
                className="ml-1 h-5 w-5 shrink-0 text-[#2563EB]"
                strokeWidth={1.9}
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Alph anything... Show today's loads"
                className="min-w-0 flex-1 bg-transparent py-2.5 text-[16px] text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
                autoComplete="off"
                spellCheck={false}
                autoFocus={!compact}
              />
              <AlphVoiceButton onTranscript={handleVoice} disabled={isPending} />
              <button
                type="submit"
                disabled={isPending || !query.trim()}
                className="grid h-11 w-11 place-items-center rounded-xl bg-[#2563EB] text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-[#93C5FD]"
                aria-label="Run command"
              >
                <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2.2} />
              </button>
            </div>
          </form>
        </div>

        {!compact ? (
          <div className="relative mx-auto mt-6 max-w-3xl">
            <AlphSuggestionChips onSelect={(command) => runCommand(command)} />
          </div>
        ) : null}
      </section>

      <div
        className={
          compact
            ? "space-y-5"
            : "mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]"
        }
      >
        <div className="space-y-4">
          {error ? (
            <p className="rounded-2xl bg-[#FEF2F2] px-4 py-3 text-[14px] font-medium text-[#DC2626]">
              {error}
            </p>
          ) : null}

          {isPending && !result ? (
            <div className="rounded-[20px] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
              <div className="h-4 w-40 animate-pulse rounded bg-[#E2E8F0]" />
              <div className="mt-4 h-3 w-full animate-pulse rounded bg-[#F1F5F9]" />
              <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-[#F1F5F9]" />
            </div>
          ) : null}

          {result ? (
            <AlphResultCard result={result} onNavigate={handleNavigate} />
          ) : !isPending && !compact ? (
            <div className="rounded-[20px] bg-[#F8FAFC] px-5 py-8 text-center">
              <p className="text-[15px] font-medium text-[#334155]">
                Alph is ready
              </p>
              <p className="mt-1 text-[13px] text-[#64748B]">
                Pick a suggestion or type a command in plain English.
              </p>
            </div>
          ) : null}

          {compact ? (
            <AlphSuggestionChips
              onSelect={(command) => runCommand(command)}
              commands={[
                "Show today's loads",
                "Generate payroll",
                "Who is my best broker?",
                "Show loads missing POD",
              ]}
            />
          ) : null}
        </div>

        <div className="space-y-6">
          <AlphHistory
            items={history}
            onSelect={(command) => runCommand(command)}
            onClear={() => {
              clearAlphHistory();
              setHistory([]);
            }}
          />
          {!compact ? <AlphAgentStatus /> : null}
        </div>
      </div>
    </div>
  );
}
