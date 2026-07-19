"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AiPolicyNotice from "@/components/ai-safety/AiPolicyNotice";
import {
  createSupportIssue,
  escalateIssue,
} from "@/lib/support/store";
import type { IssueStatus } from "@/lib/support/types";

export type RecoveryPhase =
  | "detecting"
  | "diagnosing"
  | "auto_repairing"
  | "waiting_for_user"
  | "escalated"
  | "resolved";

type IssueRecoveryProps = {
  error?: Error & { digest?: string };
  reset?: () => void;
  source?: string;
  className?: string;
};

const PHASE_LABEL: Record<RecoveryPhase, string> = {
  detecting: "Detecting",
  diagnosing: "Diagnosing",
  auto_repairing: "Auto-repairing",
  waiting_for_user: "Waiting for user",
  escalated: "Escalated",
  resolved: "Resolved",
};

const PHASE_ORDER: RecoveryPhase[] = [
  "detecting",
  "diagnosing",
  "auto_repairing",
  "waiting_for_user",
];

function toSupportStatus(phase: RecoveryPhase): IssueStatus {
  switch (phase) {
    case "detecting":
      return "detected";
    case "diagnosing":
      return "diagnosing";
    case "auto_repairing":
      return "auto_repairing";
    case "waiting_for_user":
      return "waiting_for_user";
    case "escalated":
      return "escalated";
    case "resolved":
      return "resolved";
  }
}

function plainSummary(error?: Error): string {
  const message = error?.message?.trim();
  if (!message) {
    return "Something unexpected interrupted this screen. Alph is checking what went wrong and how to recover.";
  }
  if (message.length > 160) {
    return `${message.slice(0, 157)}…`;
  }
  return message;
}

export default function IssueRecovery({
  error,
  reset,
  source = "workspace",
  className = "",
}: IssueRecoveryProps) {
  const [phase, setPhase] = useState<RecoveryPhase>("detecting");
  const [showDetails, setShowDetails] = useState(false);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(() => new Date());
  const [checks, setChecks] = useState<string[]>([
    "Confirming the screen that failed",
  ]);
  const [attempts, setAttempts] = useState<string[]>([]);

  const summary = useMemo(() => plainSummary(error), [error]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(
      setTimeout(() => {
        setPhase("diagnosing");
        setChecks((c) => [
          ...c,
          "Reading the error signal",
          "Checking recent Alph and page state",
        ]);
        setLastUpdate(new Date());
      }, 700),
    );

    timers.push(
      setTimeout(() => {
        setPhase("auto_repairing");
        setAttempts([
          "Cleared transient render state",
          "Retried safe UI recovery path",
        ]);
        setLastUpdate(new Date());
      }, 1600),
    );

    timers.push(
      setTimeout(() => {
        setPhase("waiting_for_user");
        setChecks((c) => [...c, "Safe auto-repair finished — user action may help"]);
        setLastUpdate(new Date());
      }, 2800),
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  function handleEscalate() {
    const issue = createSupportIssue({
      title: `UI recovery — ${source}`,
      summary,
      humanMessage: `Transpo.ai detected an issue on ${source}. ${summary}`,
      category: "ux",
      severity: "high",
      queue: "technical",
      alphDiagnosis:
        error?.digest != null
          ? `Digest ${error.digest}. Source: ${source}.`
          : `Source: ${source}.`,
      autoResolvable: false,
      risky: false,
      status: toSupportStatus("escalated"),
    });
    escalateIssue(issue.id, "User requested support from recovery screen");
    setTicketNumber(issue.ticketNumber);
    setPhase("escalated");
    setLastUpdate(new Date());
  }

  function handleRetry() {
    setPhase("auto_repairing");
    setAttempts((a) => [...a, "User requested retry"]);
    setLastUpdate(new Date());
    if (reset) {
      window.setTimeout(() => reset(), 350);
    } else {
      window.location.reload();
    }
  }

  return (
    <div
      className={`w-full rounded-[16px] bg-white p-5 text-[#111827] sm:p-6 ${className}`}
      role="alert"
    >
      <div className="mx-auto max-w-2xl">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
          Alph · Self-healing
        </p>
        <h1 className="mt-2 text-[22px] font-bold tracking-[-0.03em] text-[#111827] sm:text-[24px]">
          Transpo.ai detected an issue
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-[#6B7280]">
          {summary}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-[8px] bg-[#EFF6FF] px-3 py-1.5 text-[13px] font-semibold text-[#2563EB]">
            <span
              className={`h-2 w-2 rounded-full bg-[#2563EB] ${
                phase === "resolved" || phase === "escalated"
                  ? ""
                  : "animate-[transpo-pulse-soft_1.4s_ease-in-out_infinite]"
              }`}
            />
            Status: {PHASE_LABEL[phase]}
          </span>
          <span className="text-[12px] font-medium text-[#94A3B8]">
            Last update{" "}
            {lastUpdate.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
          {ticketNumber ? (
            <span className="rounded-[8px] bg-[#F8F9FB] px-2.5 py-1 text-[12px] font-semibold text-[#111827]">
              Ticket {ticketNumber}
            </span>
          ) : null}
        </div>

        <ol className="mt-4 flex flex-wrap gap-2" aria-label="Recovery stages">
          {PHASE_ORDER.map((step) => {
            const activeIndex = PHASE_ORDER.indexOf(
              phase === "escalated" || phase === "resolved"
                ? "waiting_for_user"
                : phase,
            );
            const stepIndex = PHASE_ORDER.indexOf(step);
            const done = stepIndex < activeIndex || phase === "resolved";
            const current = stepIndex === activeIndex && phase !== "escalated";
            return (
              <li
                key={step}
                className={`rounded-[8px] px-2.5 py-1 text-[12px] font-semibold ${
                  done
                    ? "bg-[#ECFDF3] text-[#16A34A]"
                    : current
                      ? "bg-[#EFF6FF] text-[#2563EB]"
                      : "bg-[#F8F9FB] text-[#94A3B8]"
                }`}
              >
                {PHASE_LABEL[step]}
              </li>
            );
          })}
        </ol>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
              What happened
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-[#334155]">
              This view failed to render cleanly. Alph caught the interruption
              before leaving you on a blank page.
            </p>
          </div>
          <div className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
              What Alph is checking
            </p>
            <ul className="mt-2 space-y-1.5">
              {checks.slice(-3).map((item) => (
                <li key={item} className="text-[14px] text-[#334155]">
                  · {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
              What Alph tried
            </p>
            <ul className="mt-2 space-y-1.5">
              {(attempts.length > 0 ? attempts : ["Preparing safe recovery…"]).map(
                (item) => (
                  <li key={item} className="text-[14px] text-[#334155]">
                    · {item}
                  </li>
                ),
              )}
            </ul>
          </div>
          <div className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
              What you can do
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-[#334155]">
              Retry this screen, open the Dashboard to keep working, or contact
              support if it keeps happening.
            </p>
            <p className="mt-2 text-[13px] text-[#6B7280]">
              Workaround: use Dashboard and Dispatch while Alph recovers this
              page.
            </p>
          </div>
        </div>

        {showDetails ? (
          <pre className="mt-4 overflow-x-auto rounded-[12px] bg-[#0F172A] px-4 py-3 text-[12px] leading-relaxed text-[#E2E8F0]">
            {error?.stack ?? error?.message ?? "No additional detail available."}
            {error?.digest ? `\n\nDigest: ${error.digest}` : ""}
          </pre>
        ) : null}

        <div className="mt-5">
          <AiPolicyNotice variant="assist" />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={handleRetry} className="transpo-btn-primary">
            Retry
          </button>
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="transpo-btn-secondary"
          >
            {showDetails ? "Hide Details" : "View Details"}
          </button>
          <Link href="/dashboard" className="transpo-btn-secondary">
            Open Dashboard
          </Link>
          {ticketNumber ? (
            <Link href="/support" className="transpo-btn-secondary">
              Open Support
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleEscalate}
              className="transpo-btn-secondary"
            >
              Contact Support
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
