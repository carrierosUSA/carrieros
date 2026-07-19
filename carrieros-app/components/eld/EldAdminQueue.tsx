"use client";

import { useMemo, useState } from "react";
import {
  ELD_NEGOTIATION_STATUS_LABELS,
  ELD_REJECTION_REASON_LABELS,
  ELD_REQUEST_STATUS_LABELS,
  ELD_STATUS_LABELS,
  buildEldAdminQueue,
  mostRequestedElds,
  updateEldRequestStatus,
  type EldIntegrationRequest,
  type EldRejectionReason,
  type EldRequestStatus,
} from "@/lib/eld";

const TEAMMATES = ["Alex Rivera", "Morgan Chen", "Sam Okonkwo", "Jordan Lee"];

const NEXT_STATUSES: EldRequestStatus[] = [
  "submitted",
  "carrier_contacted_eld",
  "waiting_for_response",
  "eld_responded",
  "documents_received",
  "technical_review",
  "development_started",
  "testing",
  "connected",
  "rejected",
];

type EldAdminQueueProps = {
  requests: EldIntegrationRequest[];
};

export default function EldAdminQueue({ requests }: EldAdminQueueProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const queue = useMemo(() => buildEldAdminQueue(requests), [requests]);
  const top = useMemo(() => mostRequestedElds(requests, 5), [requests]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[15px] font-semibold text-slate-900">
          Integration Team — ELD queue
        </h2>
        <p className="mt-1 text-[13px] text-slate-500">
          Prioritized by carrier requests × trucks × API availability ×
          difficulty × business value. Never treat unsupported as a dead end.
        </p>
      </div>

      {feedback ? (
        <p className="rounded-[12px] bg-[#ECFDF3] px-3 py-2 text-[13px] font-medium text-[#166534]">
          {feedback}
        </p>
      ) : null}

      <section className="rounded-[16px] bg-[#F5F7FA] p-4 sm:p-5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Most requested ELDs
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {top.map((row) => (
            <div
              key={row.providerId}
              className="rounded-[12px] bg-white px-4 py-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[14px] font-semibold text-slate-900">
                  {row.providerName}
                </p>
                <span className="text-[13px] font-bold text-[#2563EB]">
                  {row.priorityScore}
                </span>
              </div>
              <p className="mt-1 text-[12px] text-slate-500">
                {row.requestCount} requests · {row.trucksAffected} trucks
              </p>
              <p className="mt-0.5 text-[12px] text-slate-400">
                {ELD_STATUS_LABELS[row.catalogStatus]}
              </p>
            </div>
          ))}
          {top.length === 0 ? (
            <p className="text-[13px] text-slate-500">No carrier requests yet.</p>
          ) : null}
        </div>
      </section>

      <div className="space-y-3">
        {queue.map((row) => (
          <article
            key={row.providerId}
            className="rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-[15px] font-semibold text-slate-900">
                  {row.providerName}
                </h3>
                <p className="mt-1 text-[13px] text-slate-500">
                  {row.requestCount} carrier requests · {row.trucksAffected}{" "}
                  trucks affected · Priority{" "}
                  <span className="font-bold text-slate-800">
                    {row.priorityScore}
                  </span>
                </p>
              </div>
              <div className="text-right text-[12px] text-slate-500">
                <p>
                  Negotiation:{" "}
                  <span className="font-semibold text-slate-700">
                    {ELD_NEGOTIATION_STATUS_LABELS[row.negotiationStatus]}
                  </span>
                </p>
                <p className="mt-0.5">
                  Docs:{" "}
                  <span className="font-semibold text-slate-700">
                    {row.hasDocuments ? "Received" : "None yet"}
                  </span>
                </p>
                <p className="mt-0.5">
                  Assigned:{" "}
                  <span className="font-semibold text-slate-700">
                    {row.assignedTeammate ?? "Unassigned"}
                  </span>
                </p>
              </div>
            </div>

            {row.eldContacts.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {row.eldContacts.slice(0, 3).map((c, i) => (
                  <span
                    key={`${c.email}-${i}`}
                    className="rounded-lg bg-[#F5F7FA] px-2.5 py-1 text-[12px] text-slate-600"
                  >
                    {[c.name, c.email, c.phone].filter(Boolean).join(" · ")}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-4 space-y-3">
              {(row.openRequests.length
                ? row.openRequests
                : requests.filter((r) => r.providerId === row.providerId)
              )
                .slice(0, 4)
                .map((req) => (
                  <AdminRequestRow
                    key={req.id}
                    request={req}
                    onUpdated={(msg) => setFeedback(msg)}
                  />
                ))}
            </div>
          </article>
        ))}
        {queue.length === 0 ? (
          <p className="rounded-[16px] bg-[#F5F7FA] px-5 py-8 text-center text-[14px] text-slate-500">
            No ELD requests in the queue.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function AdminRequestRow({
  request,
  onUpdated,
}: {
  request: EldIntegrationRequest;
  onUpdated: (msg: string) => void;
}) {
  const [status, setStatus] = useState<EldRequestStatus>(request.status);
  const [teammate, setTeammate] = useState(request.assignedTeammate ?? "");
  const [rejection, setRejection] = useState<EldRejectionReason>(
    request.rejectionReason ?? "incomplete_documentation",
  );

  return (
    <div className="rounded-[12px] bg-[#F5F7FA] px-3.5 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[13px] font-semibold text-slate-800">
            {request.carrierCompany}
          </p>
          <p className="text-[12px] text-slate-500">
            {request.truckCount} trucks ·{" "}
            {ELD_REQUEST_STATUS_LABELS[request.status]}
          </p>
        </div>
        <p className="text-[12px] text-slate-400">
          {new Date(request.updatedAt).toLocaleDateString()}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-2">
        <label className="text-[11px] font-medium text-slate-500">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as EldRequestStatus)}
            className="mt-1 block h-9 rounded-lg bg-white px-2 text-[13px] text-slate-800"
          >
            {NEXT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ELD_REQUEST_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[11px] font-medium text-slate-500">
          Teammate
          <select
            value={teammate}
            onChange={(e) => setTeammate(e.target.value)}
            className="mt-1 block h-9 rounded-lg bg-white px-2 text-[13px] text-slate-800"
          >
            <option value="">Unassigned</option>
            {TEAMMATES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        {status === "rejected" ? (
          <label className="text-[11px] font-medium text-slate-500">
            Rejection reason
            <select
              value={rejection}
              onChange={(e) =>
                setRejection(e.target.value as EldRejectionReason)
              }
              className="mt-1 block h-9 max-w-[220px] rounded-lg bg-white px-2 text-[13px] text-slate-800"
            >
              {(
                Object.keys(ELD_REJECTION_REASON_LABELS) as EldRejectionReason[]
              ).map((r) => (
                <option key={r} value={r}>
                  {ELD_REJECTION_REASON_LABELS[r]}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <button
          type="button"
          onClick={() => {
            updateEldRequestStatus(request.id, status, {
              assignedTeammate: teammate || undefined,
              rejectionReason: status === "rejected" ? rejection : undefined,
              note: "Updated by Integration Team",
            });
            onUpdated(
              `${request.providerName}: ${ELD_REQUEST_STATUS_LABELS[status]}`,
            );
          }}
          className="inline-flex h-9 items-center rounded-lg bg-[#2563EB] px-3 text-[12px] font-semibold text-white hover:bg-[#1D4ED8]"
        >
          Save
        </button>
      </div>
    </div>
  );
}
