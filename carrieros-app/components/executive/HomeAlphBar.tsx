"use client";

import { Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { runAlphCommandAction } from "@/app/actions/alph";
import AlphResultCard from "@/components/alph/AlphResultCard";
import AlphVoiceButton from "@/components/alph/AlphVoiceButton";
import {
  alphIntentToActionKind,
  appendAiAudit,
  requiresHumanConfirmation,
  scoreToConfidenceLevel,
} from "@/lib/ai-safety";
import { pushAlphHistory } from "@/lib/alph/history";
import type { AlphResult } from "@/lib/alph/types";

type HomeAlphBarProps = {
  /** Optional prefilled query (e.g. from Ask Alph). */
  initialQuery?: string;
};

/** Single compact Alph control for Home — input + voice, no duplicate search fields. */
export default function HomeAlphBar({ initialQuery = "" }: HomeAlphBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<AlphResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (initialQuery.trim()) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          (e.target as HTMLElement)?.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setResult(null);
        setError(null);
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const runCommand = useCallback(
    (raw: string, options?: { autoNavigate?: boolean }) => {
      const text = raw.trim();
      if (!text) return;
      setQuery(text);
      setError(null);
      startTransition(async () => {
        try {
          const response = await runAlphCommandAction(text);
          setResult(response.result);
          pushAlphHistory({ text, resultTitle: response.result.title });
          const kind = alphIntentToActionKind(response.result.intent);
          appendAiAudit({
            actionKind: kind,
            aiAction: "Home Alph assist",
            suggestion: response.result.title,
            approval: requiresHumanConfirmation(kind)
              ? "pending"
              : "not_required",
            confidence: scoreToConfidenceLevel(response.result.confidence),
            dataUsed: ["Alph command parser", response.result.intent],
            source: "home-command-center",
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
          setError("Alph could not run that just now. Try again.");
        }
      });
    },
    [router],
  );

  const handleVoiceTranscript = useCallback(
    (text: string, isFinal: boolean) => {
      if (!isFinal) {
        setQuery(text);
        return;
      }
      setQuery(text);
      runCommand(text, { autoNavigate: true });
    },
    [runCommand],
  );

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    runCommand(query, { autoNavigate: true });
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      runCommand(query, { autoNavigate: true });
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={onSubmit}>
        <div className="flex items-center gap-2 rounded-[14px] bg-[#F5F7FA] px-3 py-2.5 transition focus-within:bg-[#EFF6FF] focus-within:ring-2 focus-within:ring-[#2563EB]/30">
          <Sparkles
            className="h-4 w-4 shrink-0 text-[#2563EB]"
            strokeWidth={1.9}
            aria-hidden
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask Alph to find a load, call a driver, check revenue…"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-[#111827] outline-none placeholder:text-[#94A3B8]"
            aria-label="Ask Alph"
          />
          <AlphVoiceButton onTranscript={handleVoiceTranscript} />
          {query ? (
            <button
              type="button"
              aria-label="Clear"
              className="grid h-9 w-9 place-items-center rounded-xl text-[#94A3B8] transition hover:bg-white hover:text-[#334155]"
              onClick={() => {
                setQuery("");
                setResult(null);
                setError(null);
                inputRef.current?.focus();
              }}
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
          <button
            type="submit"
            disabled={isPending || !query.trim()}
            className="hidden rounded-full bg-[#2563EB] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:opacity-40 sm:inline-flex"
          >
            {isPending ? "…" : "Ask"}
          </button>
        </div>
      </form>
      {error ? (
        <p className="rounded-[12px] bg-[#FEF2F2] px-3 py-2 text-[13px] font-medium text-[#DC2626]">
          {error}
        </p>
      ) : null}
      {isPending ? (
        <div className="h-16 animate-pulse rounded-[12px] bg-[#F5F7FA]" />
      ) : null}
      {result ? (
        <div className="rounded-[14px] bg-[#F8F9FB] p-3">
          <AlphResultCard result={result} />
        </div>
      ) : null}
    </div>
  );
}
