"use client";

import { Phone } from "lucide-react";
import EntityChips from "@/components/communications/EntityChips";
import { buildTelUrl, openCommunicationUrl } from "@/lib/dispatch/communication";
import type { CommunicationRecord } from "@/lib/communications/types";

type CallLogDetailProps = {
  record: CommunicationRecord;
};

function formatDuration(seconds?: number): string {
  if (seconds == null) return "—";
  if (seconds === 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CallLogDetail({ record }: CallLogDetailProps) {
  const phone = record.participants[0]?.phone;
  const telUrl = phone ? buildTelUrl(phone) : undefined;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
            Voice call
          </p>
          <h2 className="mt-1 text-[20px] font-bold tracking-tight text-[#111827]">
            {record.participants[0]?.name ?? "Unknown"}
          </h2>
          <p className="mt-1 text-[14px] text-[#64748B]">
            {record.direction === "inbound" ? "Inbound" : "Outbound"}
            {record.status === "missed" ? " · Missed" : ""}
            {" · "}
            {formatDuration(record.durationSeconds)}
          </p>
        </div>
        {telUrl ? (
          <button
            type="button"
            onClick={() => openCommunicationUrl(telUrl)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563EB] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            <Phone className="h-4 w-4" strokeWidth={2} />
            Call back
          </button>
        ) : null}
      </div>

      <EntityChips linkedTo={record.linkedTo} />

      <div className="rounded-2xl bg-[#F8F9FB] px-4 py-4">
        <p className="text-[13px] font-semibold text-[#334155]">Summary</p>
        <p className="mt-1.5 text-[14px] leading-relaxed text-[#475569]">
          {record.body}
        </p>
        {record.notes ? (
          <>
            <p className="mt-4 text-[13px] font-semibold text-[#334155]">Notes</p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-[#475569]">
              {record.notes}
            </p>
          </>
        ) : null}
        {phone ? (
          <p className="mt-4 text-[13px] text-[#64748B]">
            Number{" "}
            <a
              href={telUrl}
              className="font-semibold text-[#2563EB] hover:underline"
            >
              {phone}
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}
