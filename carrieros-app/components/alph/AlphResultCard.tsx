"use client";

import {
  ArrowRight,
  HelpCircle,
  MessageSquareText,
  Navigation,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import AiConfidenceBadge from "@/components/ai-safety/AiConfidenceBadge";
import AiPolicyNotice from "@/components/ai-safety/AiPolicyNotice";
import { useAiSafetyOptional } from "@/components/ai-safety/AiSafetyProvider";
import {
  alphIntentToActionKind,
  requiresHumanConfirmation,
  scoreToConfidenceLevel,
} from "@/lib/ai-safety";
import type { AlphResult } from "@/lib/alph/types";

type AlphResultCardProps = {
  result: AlphResult;
  onNavigate?: (href: string) => void;
};

function ResultIcon({ type }: { type: AlphResult["type"] }) {
  if (type === "clarify") {
    return <HelpCircle className="h-5 w-5" strokeWidth={1.9} />;
  }
  if (type === "navigate" || type === "action") {
    return <Navigation className="h-5 w-5" strokeWidth={1.9} />;
  }
  return <MessageSquareText className="h-5 w-5" strokeWidth={1.9} />;
}

export default function AlphResultCard({
  result,
  onNavigate,
}: AlphResultCardProps) {
  const safety = useAiSafetyOptional();
  const kind = alphIntentToActionKind(result.intent);
  const gated = requiresHumanConfirmation(kind);
  const confidence = scoreToConfidenceLevel(result.confidence);

  const actions =
    result.actions && result.actions.length > 0
      ? result.actions
      : result.href
        ? [{ label: "Open", href: result.href, primary: true }]
        : [];

  async function handleAction(href: string, label: string) {
    if (!gated || !safety) {
      onNavigate?.(href);
      return;
    }

    await safety.runAiSuggestedAction({
      kind,
      suggestion: `${label}: ${result.title}`,
      confidence,
      reason: result.body ?? "Alph suggested this from your command.",
      dataUsed: ["Alph command parser", result.intent],
      source: "alph-command-center",
      onConfirm: () => {
        onNavigate?.(href);
      },
    });
  }

  return (
    <article className="rounded-[20px] border border-[#E8EEF5] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.04)] transition-opacity duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={`grid h-10 w-10 place-items-center rounded-xl ${
              result.type === "clarify"
                ? "bg-[#FFF7ED] text-[#EA580C]"
                : "bg-[#EFF6FF] text-[#2563EB]"
            }`}
          >
            <ResultIcon type={result.type} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                Alph
              </p>
              <AiConfidenceBadge level={confidence} />
            </div>
            <h3 className="mt-1.5 text-[18px] font-semibold tracking-[-0.02em] text-[#0F172A]">
              {result.title}
            </h3>
          </div>
        </div>
        <Sparkles className="h-4 w-4 shrink-0 text-[#93C5FD]" strokeWidth={1.9} />
      </div>

      {result.body ? (
        <p className="mt-4 whitespace-pre-line text-[14px] leading-relaxed text-[#475569]">
          {result.body}
        </p>
      ) : null}

      {gated ? (
        <p className="mt-3 text-[13px] font-medium text-[#EA580C]">
          This action needs your approval before Alph continues.
        </p>
      ) : null}

      {actions.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {actions.map((action) => {
            const className = action.primary
              ? "inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
              : "inline-flex items-center gap-2 rounded-xl bg-[#F5F7FA] px-4 py-2.5 text-[13px] font-semibold text-[#334155] transition hover:bg-[#EFF6FF] hover:text-[#1D4ED8]";

            if (onNavigate || gated) {
              return (
                <button
                  key={`${action.label}-${action.href}`}
                  type="button"
                  onClick={() => {
                    void handleAction(action.href, action.label);
                  }}
                  className={className}
                >
                  {action.label}
                  {action.primary ? (
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                  ) : null}
                </button>
              );
            }

            return (
              <Link
                key={`${action.label}-${action.href}`}
                href={action.href}
                className={className}
              >
                {action.label}
                {action.primary ? (
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                ) : null}
              </Link>
            );
          })}
        </div>
      ) : null}

      <div className="mt-4">
        <AiPolicyNotice variant="compact" />
      </div>
    </article>
  );
}
