"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  buildSupportStats,
  getSupportStore,
  markIssueResolved,
  subscribeSupportStore,
  ISSUE_STATUS_LABELS,
  SEVERITY_LABELS,
  type SupportIssue,
} from "@/lib/support";

export default function AdminSupportQueue() {
  const store = useSyncExternalStore(
    subscribeSupportStore,
    getSupportStore,
    getSupportStore,
  );
  const stats = useMemo(() => buildSupportStats(store), [store]);
  const [selectedId, setSelectedId] = useState(store.issues[0]?.id);
  const [form, setForm] = useState({
    resolutionSummary: "",
    rootCause: "",
    changesMade: "",
    testingCompleted: "",
    prevention: "",
  });
  const [toast, setToast] = useState<string | null>(null);

  const issue = store.issues.find((i) => i.id === selectedId) ?? store.issues[0];

  return (
    <div className="space-y-4">
      {toast ? (
        <div className="rounded-[12px] bg-[#ECFDF3] px-3 py-2 text-[13px] font-medium text-[#166534]">
          {toast}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
        {[
          ["Open", stats.openIssues],
          ["Critical", stats.criticalIssues],
          ["Auto-resolved", stats.autoResolved],
          ["Waiting carrier", stats.waitingForCarrier],
          ["Resolved today", stats.resolvedToday],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-[12px] bg-[#F8FAFC] px-3 py-2 ring-1 ring-[#EAEAEA]"
          >
            <p className="text-[11px] text-slate-500">{label}</p>
            <p className="text-[18px] font-bold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.2fr]">
        <div className="space-y-2">
          {store.issues.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={`w-full rounded-[12px] border px-3 py-2.5 text-left ${
                item.id === issue?.id
                  ? "border-[#BFDBFE] bg-[#F8FBFF]"
                  : "border-[#EAEAEA] bg-white"
              }`}
            >
              <p className="text-[13px] font-semibold">{item.ticketNumber}</p>
              <p className="text-[12px] text-slate-600">{item.title}</p>
              <p className="mt-1 text-[11px] text-slate-500">
                {SEVERITY_LABELS[item.severity]} · {ISSUE_STATUS_LABELS[item.status]}
              </p>
            </button>
          ))}
        </div>

        {issue ? (
          <AdminIssueDetail
            issue={issue}
            form={form}
            setForm={setForm}
            onResolve={() => {
              if (
                !form.resolutionSummary ||
                !form.rootCause ||
                !form.changesMade ||
                !form.testingCompleted ||
                !form.prevention
              ) {
                setToast("Fill all resolution fields before marking resolved.");
                return;
              }
              markIssueResolved(issue.id, { ...form, notifyCarrier: true });
              setToast(`Marked ${issue.ticketNumber} resolved. Carrier notified.`);
              setForm({
                resolutionSummary: "",
                rootCause: "",
                changesMade: "",
                testingCompleted: "",
                prevention: "",
              });
            }}
          />
        ) : null}
      </div>

      <section className="rounded-[14px] border border-[#EAEAEA] bg-white p-4">
        <p className="text-[13px] font-semibold">Product improvements</p>
        <ul className="mt-2 space-y-2">
          {store.productImprovements.map((pi) => (
            <li
              key={pi.id}
              className="rounded-[12px] bg-[#F8FAFC] px-3 py-2 text-[13px]"
            >
              <p className="font-semibold text-slate-900">{pi.title}</p>
              <p className="text-slate-600">
                Affected ~{pi.companiesAffected} companies · {pi.recommendedFix}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[14px] border border-[#EAEAEA] bg-white p-4">
        <p className="text-[13px] font-semibold">Self-heal audit log</p>
        <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-[12px] text-slate-600">
          {store.auditLog.map((row) => (
            <li key={row.id}>
              {new Date(row.at).toLocaleString()} · {row.action} — {row.detail}{" "}
              {row.safe ? "(safe)" : "(needs approval)"}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function AdminIssueDetail({
  issue,
  form,
  setForm,
  onResolve,
}: {
  issue: SupportIssue;
  form: {
    resolutionSummary: string;
    rootCause: string;
    changesMade: string;
    testingCompleted: string;
    prevention: string;
  };
  setForm: (next: typeof form) => void;
  onResolve: () => void;
}) {
  return (
    <div className="rounded-[14px] border border-[#EAEAEA] bg-white p-4">
      <p className="text-[12px] font-semibold text-slate-400">{issue.ticketNumber}</p>
      <h3 className="text-[18px] font-bold">{issue.title}</h3>
      <p className="mt-1 text-[13px] text-slate-600">{issue.summary}</p>
      <p className="mt-3 text-[12px]">
        <span className="font-semibold">Queue:</span> {issue.queue} ·{" "}
        <span className="font-semibold">Status:</span>{" "}
        {ISSUE_STATUS_LABELS[issue.status]}
      </p>
      <p className="mt-2 text-[13px]">
        <span className="font-semibold">Alph diagnosis:</span> {issue.alphDiagnosis}
      </p>

      <div className="mt-3 space-y-1 text-[12px] text-slate-600">
        {issue.repairAttempts.map((a) => (
          <p key={a.id}>
            Repair: {a.action} → {a.result}
          </p>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {(
          [
            ["resolutionSummary", "Resolution summary"],
            ["rootCause", "Root cause"],
            ["changesMade", "Changes made"],
            ["testingCompleted", "Testing completed"],
            ["prevention", "Prevention added"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-[12px] font-medium text-slate-600">
            {label}
            <input
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="mt-1 h-9 w-full rounded-lg border border-[#EAEAEA] px-2 text-[13px]"
            />
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={onResolve}
        className="mt-4 rounded-full bg-[#16A34A] px-4 py-2 text-[12px] font-semibold text-white"
      >
        Mark Resolved
      </button>

      <div className="mt-4 rounded-[12px] bg-[#F8FAFC] p-3 text-[12px] text-slate-600">
        <p className="font-semibold text-slate-800">Incident package</p>
        <p>Page: {issue.page ?? "—"}</p>
        <p>Device: {issue.device ?? "—"}</p>
        <p>Browser: {issue.browser ?? "—"}</p>
        <p>Error: {issue.errorMessage ?? "—"}</p>
        <p>Data affected: {issue.dataAffected ?? "—"}</p>
      </div>
    </div>
  );
}
