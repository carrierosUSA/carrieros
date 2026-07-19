"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import FadeIn from "@/components/ui/FadeIn";
import {
  alphHelpAnswer,
  attemptAutoResolve,
  buildSupportStats,
  confirmResolved,
  escalateIssue,
  getSupportStore,
  ISSUE_STATUS_LABELS,
  reopenIssue,
  runFollowUpCheck,
  SEVERITY_LABELS,
  subscribeSupportStore,
  type SupportIssue,
} from "@/lib/support";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

function severityTone(severity: SupportIssue["severity"]) {
  if (severity === "critical") return CARRIEROS_COLORS.critical;
  if (severity === "high") return CARRIEROS_COLORS.warning;
  if (severity === "medium") return CARRIEROS_COLORS.info;
  if (severity === "informational") return CARRIEROS_COLORS.disabled;
  return CARRIEROS_COLORS.success;
}

export default function SupportCenterClient() {
  const searchParams = useSearchParams();
  const store = useSyncExternalStore(
    subscribeSupportStore,
    getSupportStore,
    getSupportStore,
  );
  const stats = useMemo(() => buildSupportStats(store), [store]);
  const selectedId = searchParams.get("issue");
  const [selected, setSelected] = useState<string | null>(selectedId);
  const [helpQ, setHelpQ] = useState("");
  const [helpA, setHelpA] = useState<ReturnType<typeof alphHelpAnswer> | null>(
    null,
  );
  const [toast, setToast] = useState<string | null>(null);

  const issue =
    store.issues.find((i) => i.id === (selected ?? selectedId)) ??
    store.issues[0];

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  }

  return (
    <FadeIn className="space-y-5">
      {toast ? (
        <div className="rounded-[14px] bg-[#ECFDF3] px-4 py-3 text-[13px] font-medium text-[#166534] ring-1 ring-[#BBF7D0]">
          {toast}
        </div>
      ) : null}

      <header className="rounded-[16px] border border-[#EAEAEA] bg-white p-5 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Alph Support
        </p>
        <h1 className="mt-1 text-[28px] font-bold tracking-[-0.03em] text-slate-950">
          Self-Healing Support
        </h1>
        <p className="mt-1 max-w-2xl text-[14px] text-slate-600">
          Alph detects problems, repairs safe issues automatically, and escalates
          anything risky to the Transpo.ai team — with a clear next step every time.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/setup"
            className="rounded-full bg-[#2563EB] px-3.5 py-2 text-[12px] font-semibold text-white"
          >
            Continue Company Setup ({store.setup.percent}%)
          </Link>
          <Link
            href="/admin?tab=support"
            className="rounded-full border border-[#EAEAEA] bg-white px-3.5 py-2 text-[12px] font-semibold text-slate-700"
          >
            Admin Support Center
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Open", stats.openIssues],
          ["Critical", stats.criticalIssues],
          ["Waiting on you", stats.waitingForCarrier],
          ["Resolved today", stats.resolvedToday],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#E5E7EB]"
          >
            <p className="text-[12px] font-medium text-slate-500">{label}</p>
            <p className="mt-1 text-[22px] font-bold tabular-nums text-slate-950">
              {value}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-[16px] border border-[#EAEAEA] bg-white p-4 shadow-sm">
        <p className="text-[13px] font-semibold text-slate-900">Ask Alph</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            value={helpQ}
            onChange={(e) => setHelpQ(e.target.value)}
            placeholder="Why is my ELD disconnected?"
            className="h-10 min-w-[240px] flex-1 rounded-xl border border-[#EAEAEA] bg-[#F8FAFC] px-3 text-[14px] outline-none focus:border-[#2563EB]"
          />
          <button
            type="button"
            className="rounded-xl bg-[#111827] px-4 text-[13px] font-semibold text-white"
            onClick={() => setHelpA(alphHelpAnswer(helpQ || "why is this not working", store))}
          >
            Ask
          </button>
        </div>
        {helpA ? (
          <div className="mt-3 rounded-[14px] bg-[#F8FAFC] p-4">
            <p className="text-[15px] font-semibold text-slate-950">{helpA.title}</p>
            <p className="mt-1 text-[14px] text-slate-600">{helpA.body}</p>
            {helpA.href ? (
              <Link
                href={helpA.href}
                className="mt-2 inline-flex text-[13px] font-semibold text-[#2563EB]"
              >
                Open
              </Link>
            ) : null}
            {helpA.technical ? (
              <details className="mt-3">
                <summary className="cursor-pointer text-[12px] font-medium text-slate-500">
                  View Technical Details
                </summary>
                <p className="mt-1 font-mono text-[12px] text-slate-500">
                  {helpA.technical}
                </p>
              </details>
            ) : null}
          </div>
        ) : null}
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]">
        <aside className="space-y-2">
          {store.issues.map((item) => {
            const tone = severityTone(item.severity);
            const active = item.id === issue?.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(item.id)}
                className={`w-full rounded-[14px] border px-4 py-3 text-left transition ${
                  active
                    ? "border-[#BFDBFE] bg-[#F8FBFF] shadow-sm"
                    : "border-[#EAEAEA] bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-slate-900">
                    {item.title}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone.bg} ${tone.text}`}
                  >
                    {SEVERITY_LABELS[item.severity]}
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-slate-500">
                  {item.ticketNumber} · {ISSUE_STATUS_LABELS[item.status]}
                </p>
              </button>
            );
          })}
        </aside>

        {issue ? (
          <IssueDetail
            issue={issue}
            onResolve={() => {
              const action =
                issue.integration?.toLowerCase().includes("samsara") ||
                issue.id.includes("eld")
                  ? "reconnect_integration"
                  : issue.category === "system" && issue.title.includes("email")
                    ? "retry_email"
                    : issue.page === "/setup"
                      ? "guide_missing_fields"
                      : "refresh_stale_data";
              const updated = attemptAutoResolve(issue.id, action);
              flash(
                updated?.status === "resolved"
                  ? "Alph resolved this safely."
                  : "Alph escalated this to Transpo.ai Support.",
              );
            }}
            onEscalate={() => {
              escalateIssue(issue.id, "Carrier requested human help.");
              flash("Escalated to Transpo.ai Support.");
            }}
            onConfirm={() => {
              confirmResolved(issue.id);
              flash("Thanks — ticket closed.");
            }}
            onReopen={() => {
              reopenIssue(issue.id);
              flash("Issue reopened.");
            }}
            onFollowUp={() => {
              const result = runFollowUpCheck(issue.id);
              flash(
                result === "ok"
                  ? "Follow-up check passed."
                  : "Problem returned — ticket reopened.",
              );
            }}
          />
        ) : null}
      </div>

      <section className="rounded-[16px] border border-[#EAEAEA] bg-white p-5 shadow-sm">
        <p className="text-[13px] font-semibold text-slate-900">System health</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {store.health.map((svc) => (
            <div
              key={svc.id}
              className="rounded-[12px] bg-[#F8FAFC] px-3 py-2.5 ring-1 ring-[#EAEAEA]"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-medium text-slate-800">{svc.name}</p>
                <StatusDot status={svc.status} />
              </div>
              {svc.detail ? (
                <p className="mt-1 text-[12px] text-slate-500">{svc.detail}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </FadeIn>
  );
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === "operational"
      ? "bg-[#16A34A]"
      : status === "degraded"
        ? "bg-[#EA580C]"
        : status === "maintenance"
          ? "bg-[#2563EB]"
          : "bg-[#DC2626]";
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold capitalize text-slate-600">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {status.replaceAll("_", " ")}
    </span>
  );
}

function IssueDetail({
  issue,
  onResolve,
  onEscalate,
  onConfirm,
  onReopen,
  onFollowUp,
}: {
  issue: SupportIssue;
  onResolve: () => void;
  onEscalate: () => void;
  onConfirm: () => void;
  onReopen: () => void;
  onFollowUp: () => void;
}) {
  const tone = severityTone(issue.severity);
  const open = !["resolved", "closed"].includes(issue.status);

  return (
    <article className="rounded-[16px] border border-[#EAEAEA] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            {issue.ticketNumber}
          </p>
          <h2 className="mt-1 text-[20px] font-bold text-slate-950">{issue.title}</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-slate-600">
            {issue.humanMessage}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone.bg} ${tone.text}`}
        >
          {SEVERITY_LABELS[issue.severity]}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <Info label="Status" value={ISSUE_STATUS_LABELS[issue.status]} />
        <Info label="Alph diagnosis" value={issue.alphDiagnosis} />
        {issue.workaround ? (
          <Info label="Temporary workaround" value={issue.workaround} />
        ) : null}
        {issue.assignedTeam ? (
          <Info label="Assigned team" value={issue.assignedTeam} />
        ) : null}
        {issue.estimatedUpdate ? (
          <Info label="Estimated update" value={issue.estimatedUpdate} />
        ) : null}
        {issue.integration ? (
          <Info label="Integration" value={issue.integration} />
        ) : null}
      </dl>

      <div className="mt-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          What Alph tried
        </p>
        {issue.repairAttempts.length === 0 ? (
          <p className="mt-2 text-[13px] text-slate-500">No repair attempts yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {issue.repairAttempts.map((attempt) => (
              <li
                key={attempt.id}
                className="rounded-[12px] bg-[#F8FAFC] px-3 py-2 text-[13px] text-slate-700"
              >
                <span className="font-semibold">{attempt.action}</span> ·{" "}
                {attempt.result} — {attempt.detail}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {open && issue.autoResolvable ? (
          <button
            type="button"
            onClick={onResolve}
            className="rounded-full bg-[#2563EB] px-3.5 py-2 text-[12px] font-semibold text-white"
          >
            Resolve Now
          </button>
        ) : null}
        {open ? (
          <button
            type="button"
            onClick={onEscalate}
            className="rounded-full border border-[#EAEAEA] bg-white px-3.5 py-2 text-[12px] font-semibold text-slate-800"
          >
            Contact Support
          </button>
        ) : null}
        {issue.status === "resolved" ? (
          <>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-full bg-[#16A34A] px-3.5 py-2 text-[12px] font-semibold text-white"
            >
              Confirm Resolved
            </button>
            <button
              type="button"
              onClick={onReopen}
              className="rounded-full border border-[#EAEAEA] px-3.5 py-2 text-[12px] font-semibold text-slate-800"
            >
              Reopen Issue
            </button>
            <button
              type="button"
              onClick={onFollowUp}
              className="rounded-full border border-[#EAEAEA] px-3.5 py-2 text-[12px] font-semibold text-slate-800"
            >
              Run Follow-up Check
            </button>
          </>
        ) : null}
        {issue.page ? (
          <Link
            href={issue.page}
            className="rounded-full border border-[#EAEAEA] px-3.5 py-2 text-[12px] font-semibold text-[#2563EB]"
          >
            Open Related Page
          </Link>
        ) : null}
      </div>

      <div className="mt-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          Timeline
        </p>
        <ol className="mt-3 space-y-3">
          {issue.timeline
            .filter((e) => e.visibleToCarrier)
            .map((event) => (
              <li key={event.id} className="flex gap-3 text-[13px]">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#2563EB]" />
                <div>
                  <p className="font-medium text-slate-800">{event.message}</p>
                  <p className="text-[12px] text-slate-500">
                    {new Date(event.at).toLocaleString()} · {event.actor}
                  </p>
                </div>
              </li>
            ))}
        </ol>
      </div>

      <details className="mt-5">
        <summary className="cursor-pointer text-[12px] font-medium text-slate-500">
          View Technical Details
        </summary>
        <pre className="mt-2 overflow-x-auto rounded-[12px] bg-[#0F172A] p-3 text-[11px] text-slate-200">
          {JSON.stringify(
            {
              error: issue.errorMessage,
              browser: issue.browser,
              device: issue.device,
              dataAffected: issue.dataAffected,
              diagnosis: issue.alphDiagnosis,
            },
            null,
            2,
          )}
        </pre>
      </details>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-[13px] text-slate-800">{value}</dd>
    </div>
  );
}
