"use client";

import { FormEvent, useState } from "react";
import EntityChips from "@/components/communications/EntityChips";
import type { CommunicationRecord } from "@/lib/communications/types";

type ChatThreadProps = {
  record: CommunicationRecord;
  onSend: (body: string) => void;
};

export default function ChatThread({ record, onSend }: ChatThreadProps) {
  const [draft, setDraft] = useState("");
  const messages = record.messages ?? [];

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    onSend(body);
    setDraft("");
  }

  return (
    <div className="flex h-full min-h-[420px] flex-col">
      <div className="shrink-0">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
          Internal chat
        </p>
        <h2 className="mt-1 text-[20px] font-bold tracking-tight text-[#111827]">
          {record.chatRoom ?? "Team thread"}
        </h2>
        <p className="mt-1 text-[13px] text-[#64748B]">
          {record.participants.map((p) => p.name).join(" · ")}
        </p>
        <EntityChips linkedTo={record.linkedTo} className="mt-3" />
      </div>

      <div className="mt-5 flex-1 space-y-3 overflow-y-auto">
        {messages.map((m) => {
          const mine = m.senderName === "Dispatch" || m.senderSide === "carrier";
          return (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                mine
                  ? "ml-auto bg-[#0F766E] text-white"
                  : "bg-[#F5F7FA] text-[#111827]"
              }`}
            >
              <p className="text-[12px] font-semibold opacity-80">
                {m.senderName}
              </p>
              <p className="mt-1 text-[14px] leading-relaxed">{m.body}</p>
              <p className="mt-1.5 text-[11px] opacity-70">
                {new Date(m.sentAt).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2 shrink-0">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message the team…"
          className="h-11 flex-1 rounded-xl bg-[#F5F7FA] px-3.5 text-[14px] outline-none focus:bg-white focus:ring-2 focus:ring-[#99F6E4]"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="h-11 rounded-xl bg-[#0F766E] px-4 text-[13px] font-semibold text-white transition hover:bg-[#115E59] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
