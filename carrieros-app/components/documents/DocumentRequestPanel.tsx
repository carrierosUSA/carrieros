"use client";

import Link from "next/link";
import { useState } from "react";
import BrokerUploadStubModal from "@/components/documents/BrokerUploadStubModal";
import { HEALTH_DOCUMENT_LABELS } from "@/lib/documents/required-documents";
import type { DocumentRequest } from "@/lib/documents/types";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type DocumentRequestPanelProps = {
  requests: DocumentRequest[];
};

export default function DocumentRequestPanel({
  requests,
}: DocumentRequestPanelProps) {
  const [brokerOpen, setBrokerOpen] = useState(false);
  const pending = requests.filter((request) => request.status === "pending");

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-950">
            Pending requests
          </h2>
          <p className="mt-0.5 text-[14px] text-slate-500">
            Driver push notifications and broker portal uploads — stubs until
            mobile apps ship.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setBrokerOpen(true)}
          className="inline-flex h-10 items-center justify-center rounded-full bg-[#2563EB] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
        >
          Broker upload
        </button>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-[14px] bg-[#F8FAFC] px-5 py-10 text-center">
          <p className="text-[15px] font-semibold text-slate-900">
            No pending requests
          </p>
          <p className="mt-1 text-[14px] text-slate-500">
            Request documents from load detail or Document Health alerts.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {pending.map((request) => {
            const colors =
              request.target === "driver"
                ? CARRIEROS_COLORS.info
                : CARRIEROS_COLORS.warning;

            return (
              <li
                key={request.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] ring-1 ring-[#EAEAEA]"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${colors.bg} ${colors.text}`}
                    >
                      {request.target === "driver" ? "Driver" : "Broker"}
                    </span>
                    <span className="text-[12px] font-medium uppercase tracking-wide text-slate-400">
                      {request.channel}
                    </span>
                  </div>
                  <p className="mt-1 text-[15px] font-semibold text-slate-900">
                    {HEALTH_DOCUMENT_LABELS[request.documentKind]} ·{" "}
                    {request.loadReference}
                  </p>
                  <p className="text-[13px] text-slate-500">
                    Requested by {request.requestedBy}
                    {request.note ? ` — ${request.note}` : ""}
                  </p>
                </div>
                <Link
                  href={`/loads/${request.loadId}`}
                  className="inline-flex h-9 items-center justify-center rounded-full bg-[#F8FAFC] px-4 text-[13px] font-semibold text-slate-700 transition hover:bg-[#F1F5F9]"
                >
                  Open load
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="rounded-[14px] bg-[#EFF6FF] px-4 py-3">
        <p className="text-[14px] font-semibold text-[#1E40AF]">
          Driver mobile
        </p>
        <p className="mt-0.5 text-[13px] text-[#1D4ED8]">
          Push notification stub: drivers will receive “Upload POD” and similar
          prompts in the Transpo.ai driver app.
        </p>
      </div>

      <BrokerUploadStubModal open={brokerOpen} onClose={() => setBrokerOpen(false)} />
    </section>
  );
}
