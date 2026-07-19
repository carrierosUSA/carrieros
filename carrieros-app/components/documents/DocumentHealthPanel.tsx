"use client";

import DocumentHealthAlertsStrip from "@/components/documents/DocumentHealthAlertsStrip";
import DocumentHealthScoreBadge from "@/components/documents/DocumentHealthScoreBadge";
import DocumentHealthTimeline from "@/components/documents/DocumentHealthTimeline";
import type { DocumentHealthSnapshot } from "@/lib/documents/types";

type DocumentHealthPanelProps = {
  snapshot: DocumentHealthSnapshot;
  driverPhone?: string;
  brokerEmail?: string;
};

const WAITING_LABELS: Record<DocumentHealthSnapshot["waitingOn"], string> = {
  none: "No blockers",
  driver: "Waiting on driver",
  broker: "Waiting on broker",
  accounting: "Waiting on accounting",
  ready_to_invoice: "Ready to invoice",
};

export default function DocumentHealthPanel({
  snapshot,
  driverPhone,
  brokerEmail,
}: DocumentHealthPanelProps) {
  return (
    <section
      id="load-document-health"
      className="space-y-4 rounded-[14px] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] ring-1 ring-[#EAEAEA]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-950">
            Document Health
          </h2>
          <p className="mt-0.5 text-[13px] text-slate-500">
            {WAITING_LABELS[snapshot.waitingOn]}
          </p>
        </div>
        <DocumentHealthScoreBadge score={snapshot.score} />
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {snapshot.checklist
          .filter((item) => item.required || item.status !== "missing")
          .map((item) => (
            <li
              key={item.kind}
              className="flex items-center justify-between gap-2 rounded-[10px] bg-[#F8FAFC] px-3 py-2"
            >
              <span className="text-[13px] font-medium text-slate-800">
                {item.status === "on_file" ? "✓" : "○"} {item.label}
                {item.required ? (
                  <span className="ml-1 text-[11px] text-slate-400">req</span>
                ) : null}
              </span>
              <span className="text-[12px] font-semibold capitalize text-slate-500">
                {item.status.replace("_", " ")}
              </span>
            </li>
          ))}
      </ul>

      <DocumentHealthAlertsStrip
        snapshot={snapshot}
        driverPhone={driverPhone}
        brokerEmail={brokerEmail}
        title="Alph missing-document alerts"
      />

      <div>
        <h3 className="mb-3 text-[14px] font-semibold text-slate-900">
          Document timeline
        </h3>
        <DocumentHealthTimeline events={snapshot.timeline} />
      </div>
    </section>
  );
}
