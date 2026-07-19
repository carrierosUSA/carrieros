"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Pin,
  PinOff,
  Sparkles,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { runAlphCommandAction } from "@/app/actions/alph";
import AlphResultCard from "@/components/alph/AlphResultCard";
import AlphVoiceButton from "@/components/alph/AlphVoiceButton";
import AiPolicyNotice from "@/components/ai-safety/AiPolicyNotice";
import FadeIn from "@/components/ui/FadeIn";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import {
  alphIntentToActionKind,
  appendAiAudit,
  requiresHumanConfirmation,
  scoreToConfidenceLevel,
} from "@/lib/ai-safety";
import { pushAlphHistory } from "@/lib/alph/history";
import type { AlphResult } from "@/lib/alph/types";
import type { AlphExecutiveSummary } from "@/lib/executive/executive-alph";
import type { ExecutiveBoard, ExecutiveKpi } from "@/lib/executive/executive-board";
import {
  ALPH_QUICK_ACTIONS,
  ALPH_WORKSPACE_EXAMPLES,
  WORKSPACE_CONTEXT_LABELS,
  buildWorkspaceActivity,
  buildWorkspaceBriefing,
  buildWorkspaceRecommendations,
  buildWorkspaceSnapshot,
  greetingForNow,
  listAlphFavorites,
  toggleAlphFavorite,
  type AlphFavorite,
} from "@/lib/alph/workspace";

type AlphWorkspaceProps = {
  board: ExecutiveBoard;
  summary: AlphExecutiveSummary;
  userName: string;
  /** Server-computed greeting — prefer over client `greetingForNow` to avoid hydration mismatch. */
  greeting?: string;
  /** Active department workspace Alph should understand (from shell / query). */
  workspaceId?: string;
};

function priorityTone(priority: string) {
  if (priority === "critical") return CARRIEROS_COLORS.critical;
  if (priority === "high") return CARRIEROS_COLORS.warning;
  if (priority === "medium") return CARRIEROS_COLORS.info;
  if (priority === "low") return CARRIEROS_COLORS.success;
  return CARRIEROS_COLORS.disabled;
}

export default function AlphWorkspace({
  board,
  summary,
  userName,
  greeting: greetingProp,
  workspaceId,
}: AlphWorkspaceProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<AlphResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [ignored, setIgnored] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<AlphFavorite[]>([]);
  const [mounted, setMounted] = useState(false);

  const greeting = greetingProp ?? greetingForNow(userName);
  const snapshot = useMemo(() => buildWorkspaceSnapshot(board), [board]);
  const briefing = useMemo(() => buildWorkspaceBriefing(summary), [summary]);
  const recommendations = useMemo(
    () =>
      buildWorkspaceRecommendations(summary).filter(
        (r) => !ignored.includes(r.id),
      ),
    [summary, ignored],
  );
  const activity = useMemo(() => buildWorkspaceActivity(), []);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALPH_WORKSPACE_EXAMPLES.slice(0, 6);
    return ALPH_WORKSPACE_EXAMPLES.filter((ex) =>
      ex.toLowerCase().includes(q),
    ).slice(0, 8);
  }, [query]);

  useEffect(() => {
    setMounted(true);
    setFavorites(listAlphFavorites());
  }, []);

  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) {
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
            aiAction: "Alph workspace suggestion",
            suggestion: response.result.title,
            approval: requiresHumanConfirmation(kind)
              ? "pending"
              : "not_required",
            confidence: scoreToConfidenceLevel(response.result.confidence),
            dataUsed: ["Alph command parser", response.result.intent],
            source: "alph-workspace",
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

  const hasData = snapshot.length > 0;

  return (
    <FadeIn className="space-y-6">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Alph
        </p>
        <h1 className="text-[30px] font-bold tracking-[-0.03em] text-slate-950 sm:text-[34px]">
          {greeting}
        </h1>
        <p className="text-[16px] text-slate-600">How can I help you today?</p>
        {workspaceId && workspaceId !== "alph" ? (
          <p className="pt-1 text-[13px] font-medium text-[#2563EB]">
            Context: {WORKSPACE_CONTEXT_LABELS[workspaceId] ?? workspaceId}{" "}
            workspace — Alph assists, you decide.
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="inline-flex items-center rounded-full bg-[#EFF6FF] px-3 py-1 text-[12px] font-medium text-[#1E3A8A]">
            Alph
          </span>
          {workspaceId ? (
            <span className="inline-flex items-center rounded-full bg-[#F1F5F9] px-3 py-1 text-[12px] font-medium text-[#334155]">
              {WORKSPACE_CONTEXT_LABELS[workspaceId] ?? workspaceId}
            </span>
          ) : null}
          <span className="inline-flex items-center rounded-full bg-[#F1F5F9] px-3 py-1 text-[12px] font-medium text-[#334155]">
            Your permissions
          </span>
        </div>
        <div className="pt-1">
          <AiPolicyNotice variant="assist" />
        </div>
      </header>

      {/* Search */}
      <section className="rounded-[20px] border border-[#EAEAEA] bg-white p-4 shadow-sm sm:p-5">
        <form onSubmit={onSubmit} className="relative">
          <div className="flex items-center gap-3 rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 transition focus-within:border-[#2563EB] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(37,99,235,0.12)]">
            <Sparkles className="h-5 w-5 shrink-0 text-[#2563EB]" strokeWidth={1.9} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask Alph anything..."
              className="min-w-0 flex-1 bg-transparent text-[16px] text-slate-900 outline-none placeholder:text-slate-400"
              aria-label="Ask Alph"
            />
            <AlphVoiceButton onTranscript={handleVoiceTranscript} />
            {query ? (
              <button
                type="button"
                aria-label="Clear"
                className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100"
                onClick={() => {
                  setQuery("");
                  setResult(null);
                  inputRef.current?.focus();
                }}
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <kbd className="hidden rounded-md border border-[#EAEAEA] bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 sm:inline">
                /
              </kbd>
            )}
          </div>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => runCommand(ex, { autoNavigate: true })}
              className="rounded-full border border-[#EAEAEA] bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700 transition hover:border-[#BFDBFE] hover:bg-[#F8FBFF] hover:text-[#1D4ED8]"
            >
              {ex}
            </button>
          ))}
        </div>

        {isPending ? (
          <div className="mt-4 h-20 animate-pulse rounded-[14px] bg-[#F1F5F9]" />
        ) : null}
        {error ? (
          <p className="mt-4 rounded-[12px] bg-[#FEF2F2] px-3 py-2 text-[13px] font-medium text-[#DC2626]">
            {error}
          </p>
        ) : null}
        {result ? (
          <div className="mt-4">
            <AlphResultCard result={result} />
          </div>
        ) : null}
      </section>

      {!hasData ? (
        <EmptyAlphState onAction={(cmd) => runCommand(cmd)} />
      ) : (
        <>
          {/* Snapshot */}
          <section>
            <SectionTitle title="Today's Business Snapshot" />
            <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {snapshot.map((kpi) => (
                <SnapshotCard key={kpi.id} kpi={kpi} />
              ))}
            </div>
          </section>

          {/* Briefing */}
          <section>
            <SectionTitle
              title="Alph Morning Briefing"
              subtitle={summary.subtitle}
            />
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {briefing.map((section) => (
                <div
                  key={section.id}
                  className="rounded-[16px] border border-[#EAEAEA] bg-white p-4 shadow-sm"
                >
                  <h3 className="text-[14px] font-semibold text-slate-950">
                    {section.title}
                  </h3>
                  <ul className="mt-3 space-y-3">
                    {section.items.map((item) => {
                      const tone = priorityTone(item.priority);
                      return (
                        <li key={item.id} className="rounded-[12px] bg-[#F8FAFC] p-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[13px] font-medium text-slate-900">
                              {item.text}
                            </p>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${tone.bg} ${tone.text}`}
                            >
                              {item.priority}
                            </span>
                          </div>
                          <p className="mt-1 text-[12px] text-slate-500">
                            {item.reason}
                          </p>
                          <Link
                            href={item.href}
                            className="mt-2 inline-flex text-[12px] font-semibold text-[#2563EB]"
                          >
                            {item.actionLabel} →
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Quick actions */}
          <section>
            <SectionTitle title="Quick Actions" />
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
              {ALPH_QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.id}
                  href={action.href}
                  className="group rounded-[14px] border border-[#EAEAEA] bg-white px-3 py-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-md"
                >
                  <span className="text-[18px]" aria-hidden>
                    {action.emoji}
                  </span>
                  <p className="mt-1.5 text-[12px] font-semibold text-slate-800 group-hover:text-[#1D4ED8]">
                    {action.label}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* Recommendations */}
          <section>
            <SectionTitle title="AI Recommendations" />
            <div className="mt-3 space-y-2">
              {recommendations.map((rec) => {
                const tone = priorityTone(rec.priority);
                return (
                  <div
                    key={rec.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[#EAEAEA] bg-white px-4 py-3 shadow-sm"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[14px] font-semibold text-slate-900">
                          {rec.text}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${tone.bg} ${tone.text}`}
                        >
                          {rec.priority}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[12px] text-slate-500">{rec.reason}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={rec.resolveHref ?? rec.href}
                        className="rounded-full bg-[#2563EB] px-3 py-1.5 text-[12px] font-semibold text-white"
                      >
                        Resolve
                      </Link>
                      <Link
                        href={rec.href}
                        className="rounded-full border border-[#EAEAEA] px-3 py-1.5 text-[12px] font-semibold text-slate-700"
                      >
                        View Details
                      </Link>
                      <button
                        type="button"
                        onClick={() => setIgnored((ids) => [...ids, rec.id])}
                        className="rounded-full border border-[#EAEAEA] px-3 py-1.5 text-[12px] font-semibold text-slate-500"
                      >
                        Ignore
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Activity */}
            <section className="rounded-[16px] border border-[#EAEAEA] bg-white p-4 shadow-sm">
              <SectionTitle title="Recent Activity" />
              <ol className="mt-3 space-y-3">
                {activity.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#2563EB]" />
                    <div className="min-w-0">
                      <Link
                        href={item.href}
                        className="text-[14px] font-semibold text-slate-900 hover:text-[#2563EB]"
                      >
                        {item.title}
                      </Link>
                      <p className="text-[12px] text-slate-500">{item.detail}</p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(item.at).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Favorites */}
            <section className="rounded-[16px] border border-[#EAEAEA] bg-white p-4 shadow-sm">
              <SectionTitle title="Favorites" />
              <div className="mt-3 flex flex-wrap gap-2">
                {(mounted ? favorites : ALPH_QUICK_ACTIONS.slice(0, 0)).length ===
                  0 && !mounted ? (
                  <div className="h-10 w-full animate-pulse rounded-xl bg-[#F1F5F9]" />
                ) : (
                  favorites.map((fav) => (
                    <div
                      key={fav.id}
                      className="inline-flex items-center gap-1 rounded-full border border-[#EAEAEA] bg-[#F8FAFC] pl-3 pr-1.5 py-1"
                    >
                      <Link
                        href={fav.href}
                        className="text-[12px] font-semibold text-slate-800"
                      >
                        {fav.label}
                      </Link>
                      <button
                        type="button"
                        aria-label={`Unpin ${fav.label}`}
                        className="grid h-7 w-7 place-items-center rounded-full text-slate-400 hover:bg-white hover:text-slate-700"
                        onClick={() => setFavorites(toggleAlphFavorite(fav))}
                      >
                        <PinOff className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <p className="mt-3 text-[12px] text-slate-500">
                Pin quick actions you use every day.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ALPH_QUICK_ACTIONS.filter(
                  (a) => !favorites.some((f) => f.id === a.id),
                )
                  .slice(0, 6)
                  .map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() =>
                        setFavorites(
                          toggleAlphFavorite({
                            id: action.id,
                            label: action.label,
                            href: action.href,
                          }),
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#CBD5E1] px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-[#2563EB] hover:text-[#2563EB]"
                    >
                      <Pin className="h-3 w-3" />
                      {action.label}
                    </button>
                  ))}
              </div>
            </section>
          </div>
        </>
      )}
    </FadeIn>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h2 className="text-[16px] font-semibold text-slate-950">{title}</h2>
      {subtitle ? (
        <p className="mt-0.5 text-[13px] text-slate-500">{subtitle}</p>
      ) : null}
    </div>
  );
}

function SnapshotCard({ kpi }: { kpi: ExecutiveKpi }) {
  const tone =
    kpi.tone === "critical"
      ? CARRIEROS_COLORS.critical
      : kpi.tone === "warning"
        ? CARRIEROS_COLORS.warning
        : kpi.tone === "success"
          ? CARRIEROS_COLORS.success
          : kpi.tone === "info"
            ? CARRIEROS_COLORS.info
            : null;

  const trend =
    kpi.trend === "up" ? "↑" : kpi.trend === "down" ? "↓" : kpi.trend ? "→" : null;

  return (
    <Link
      href={kpi.href}
      className="block rounded-[16px] border border-[#EAEAEA] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-md"
    >
      <p className="text-[12px] font-medium text-slate-500">{kpi.label}</p>
      <p className="mt-1 text-[22px] font-bold tabular-nums tracking-tight text-slate-950">
        {kpi.value}
      </p>
      <p className="mt-1 text-[12px] text-slate-500">{kpi.detail}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {trend && kpi.deltaPercent != null ? (
          <span
            className={`text-[12px] font-semibold ${
              kpi.trend === "up"
                ? "text-[#16A34A]"
                : kpi.trend === "down"
                  ? "text-[#DC2626]"
                  : "text-slate-500"
            }`}
          >
            {trend} {Math.abs(kpi.deltaPercent)}% {kpi.deltaLabel ?? ""}
          </span>
        ) : null}
        {kpi.statusLabel ? (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              tone ? `${tone.bg} ${tone.text}` : "bg-slate-100 text-slate-600"
            }`}
          >
            {kpi.statusLabel}
          </span>
        ) : null}
      </div>
      {kpi.insight ? (
        <p className="mt-2 text-[11px] leading-snug text-slate-500">{kpi.insight}</p>
      ) : null}
    </Link>
  );
}

function EmptyAlphState({ onAction }: { onAction: (cmd: string) => void }) {
  return (
    <section className="rounded-[20px] border border-[#EAEAEA] bg-white p-8 text-center shadow-sm">
      <Sparkles className="mx-auto h-8 w-8 text-[#2563EB]" />
      <h2 className="mt-4 text-[22px] font-bold text-slate-950">
        Welcome to Transpo.ai.
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-[15px] leading-relaxed text-slate-600">
        I&apos;m Alph, your AI Operations Assistant. I can help you dispatch
        loads, manage drivers, monitor compliance, generate reports, and answer
        questions about your business.
      </p>
      <p className="mt-3 text-[14px] text-slate-500">
        Start by asking me a question or choose one of the quick actions below.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {ALPH_WORKSPACE_EXAMPLES.slice(0, 6).map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => onAction(ex)}
            className="rounded-full bg-[#2563EB] px-3.5 py-2 text-[12px] font-semibold text-white"
          >
            {ex}
          </button>
        ))}
      </div>
    </section>
  );
}
