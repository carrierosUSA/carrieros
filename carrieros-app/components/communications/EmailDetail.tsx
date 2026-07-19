"use client";

import { Mail } from "lucide-react";
import EntityChips from "@/components/communications/EntityChips";
import { buildMailtoUrl, openCommunicationUrl } from "@/lib/dispatch/communication";
import type { CommunicationRecord } from "@/lib/communications/types";

type EmailDetailProps = {
  record: CommunicationRecord;
};

export default function EmailDetail({ record }: EmailDetailProps) {
  const email = record.participants[0]?.email;
  const mailto = email
    ? buildMailtoUrl(
        email,
        record.subject ? `Re: ${record.subject}` : "Transpo.ai",
        "",
      )
    : undefined;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
            Email
          </p>
          <h2 className="mt-1 text-[20px] font-bold tracking-tight text-[#111827]">
            {record.subject ?? "No subject"}
          </h2>
          <p className="mt-1 text-[14px] text-[#64748B]">
            {record.status === "received" ? "From" : "To"}{" "}
            <span className="font-semibold text-[#334155]">
              {record.participants[0]?.name}
            </span>
            {email ? (
              <span className="text-[#94A3B8]"> · {email}</span>
            ) : null}
          </p>
        </div>
        {mailto ? (
          <button
            type="button"
            onClick={() => openCommunicationUrl(mailto)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#475569] px-4 text-[13px] font-semibold text-white transition hover:bg-[#334155]"
          >
            <Mail className="h-4 w-4" strokeWidth={2} />
            Reply
          </button>
        ) : null}
      </div>

      <EntityChips linkedTo={record.linkedTo} />

      <div className="rounded-2xl bg-[#F8F9FB] px-5 py-5">
        <pre className="whitespace-pre-wrap font-sans text-[14px] leading-relaxed text-[#334155]">
          {record.body}
        </pre>
      </div>
    </div>
  );
}
