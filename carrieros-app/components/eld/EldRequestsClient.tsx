"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import EldRequestStatusTimeline from "@/components/eld/EldRequestStatusTimeline";
import FadeIn from "@/components/ui/FadeIn";
import {
  ELD_DATA_TYPE_LABELS,
  ELD_REQUEST_STATUS_LABELS,
  getEldStore,
  subscribeEldStore,
  updateEldRequestStatus,
  type EldRequestStatus,
} from "@/lib/eld";

function useEldStore() {
  return useSyncExternalStore(subscribeEldStore, getEldStore, getEldStore);
}

export default function EldRequestsClient() {
  const store = useEldStore();
  const searchParams = useSearchParams();
  const focusId = searchParams.get("id");
  const [selectedId, setSelectedId] = useState<string | null>(focusId);

  const selected = useMemo(() => {
    const id = selectedId ?? focusId ?? store.requests[0]?.id;
    return store.requests.find((r) => r.id === id) ?? null;
  }, [store.requests, selectedId, focusId]);

  return (
    <FadeIn className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <Link
          href="/integrations/eld"
          className="inline-flex h-9 items-center rounded-xl bg-[#EFF6FF] px-3 text-[13px] font-semibold text-[#2563EB]"
        >
          ELD Directory
        </Link>
        <Link
          href="/admin?tab=eld"
          className="inline-flex h-9 items-center rounded-xl bg-[#F5F7FA] px-3 text-[13px] font-semibold text-slate-700"
        >
          Integration Team queue
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-2">
          {store.requests.map((req) => {
            const active = selected?.id === req.id;
            return (
              <button
                key={req.id}
                type="button"
                onClick={() => setSelectedId(req.id)}
                className={`w-full rounded-[14px] px-4 py-3 text-left transition ${
                  active
                    ? "bg-[#EFF6FF] ring-1 ring-[#BFDBFE]"
                    : "bg-white ring-1 ring-[#EAEAEA] hover:bg-[#F8FAFC]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[14px] font-semibold text-slate-900">
                    {req.providerName}
                  </p>
                  <span className="text-[12px] font-semibold text-slate-500">
                    {ELD_REQUEST_STATUS_LABELS[req.status]}
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-slate-500">
                  {req.truckCount} trucks · Updated{" "}
                  {new Date(req.updatedAt).toLocaleDateString()}
                </p>
              </button>
            );
          })}
          {store.requests.length === 0 ? (
            <p className="rounded-[14px] bg-[#F5F7FA] px-4 py-8 text-center text-[14px] text-slate-500">
              No requests yet.{" "}
              <Link href="/integrations/eld" className="font-semibold text-[#2563EB]">
                Browse the ELD Directory
              </Link>
            </p>
          ) : null}
        </div>

        {selected ? (
          <div className="space-y-4 rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA] sm:p-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {selected.providerName}
              </h2>
              <p className="mt-1 text-[13px] text-slate-500">
                {selected.carrierCompany} · {selected.mcNumber} ·{" "}
                {selected.dotNumber}
              </p>
            </div>

            <div className="grid gap-2 text-[13px] text-slate-600 sm:grid-cols-2">
              <p>
                Contact:{" "}
                <span className="font-semibold text-slate-800">
                  {selected.contactName}
                </span>
              </p>
              <p>
                Trucks:{" "}
                <span className="font-semibold text-slate-800">
                  {selected.truckCount}
                </span>
              </p>
              <p>
                Account:{" "}
                <span className="font-semibold text-slate-800">
                  {selected.eldAccountNumber || "—"}
                </span>
              </p>
              <p>
                Assigned:{" "}
                <span className="font-semibold text-slate-800">
                  {selected.assignedTeammate || "Unassigned"}
                </span>
              </p>
            </div>

            <div>
              <p className="text-[12px] font-medium text-slate-400">
                Features needed
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {selected.featuresNeeded.map((f) => (
                  <span
                    key={f}
                    className="rounded-lg bg-[#F5F7FA] px-2 py-1 text-[11px] font-medium text-slate-600"
                  >
                    {ELD_DATA_TYPE_LABELS[f]}
                  </span>
                ))}
              </div>
            </div>

            {selected.apiDocuments.length > 0 ? (
              <div>
                <p className="text-[12px] font-medium text-slate-400">
                  Documents
                </p>
                <ul className="mt-1 space-y-1 text-[13px] text-slate-600">
                  {selected.apiDocuments.map((d) => (
                    <li key={d.id}>· {d.fileName}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {selected.notes ? (
              <p className="rounded-[12px] bg-[#F5F7FA] px-3 py-2 text-[13px] text-slate-600">
                {selected.notes}
              </p>
            ) : null}

            <EldRequestStatusTimeline request={selected} />

            {selected.status !== "connected" &&
            selected.status !== "rejected" ? (
              <CarrierAdvanceActions
                requestId={selected.id}
                status={selected.status}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </FadeIn>
  );
}

function CarrierAdvanceActions({
  requestId,
  status,
}: {
  requestId: string;
  status: EldRequestStatus;
}) {
  if (status !== "submitted" && status !== "waiting_for_response") {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 border-t border-[#F1F5F9] pt-4">
      {status === "submitted" ? (
        <button
          type="button"
          onClick={() =>
            updateEldRequestStatus(requestId, "carrier_contacted_eld", {
              note: "Carrier marked ELD as contacted",
              negotiationStatus: "outreach_sent",
            })
          }
          className="inline-flex h-9 items-center rounded-xl bg-[#2563EB] px-3 text-[13px] font-semibold text-white"
        >
          Mark ELD contacted
        </button>
      ) : null}
      {status === "waiting_for_response" ? (
        <button
          type="button"
          onClick={() =>
            updateEldRequestStatus(requestId, "eld_responded", {
              note: "Carrier recorded ELD response",
              negotiationStatus: "in_discussion",
            })
          }
          className="inline-flex h-9 items-center rounded-xl bg-[#2563EB] px-3 text-[13px] font-semibold text-white"
        >
          Mark ELD responded
        </button>
      ) : null}
    </div>
  );
}
