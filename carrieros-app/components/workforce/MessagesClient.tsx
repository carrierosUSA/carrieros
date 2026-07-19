"use client";

import { useMemo, useState, useTransition } from "react";
import { MessageSquare } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import type {
  HiringCompany,
  Message,
  MessageThread,
  ProfessionalProfile,
} from "@/lib/types/workforce";
import { candidateFullName } from "@/lib/workforce/board";
import { sendMessageAction } from "@/app/workforce/actions";

type Props = {
  threads: MessageThread[];
  messages: Message[];
  candidates: ProfessionalProfile[];
  companies: HiringCompany[];
};

export default function MessagesClient({
  threads: initialThreads,
  messages: initialMessages,
  candidates,
  companies,
}: Props) {
  const [threads, setThreads] = useState(initialThreads);
  const [messages, setMessages] = useState(initialMessages);
  const [activeId, setActiveId] = useState(initialThreads[0]?.id ?? null);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();

  const activeMessages = useMemo(
    () => messages.filter((m) => m.threadId === activeId),
    [messages, activeId],
  );
  const activeThread = threads.find((t) => t.id === activeId);

  function send() {
    if (!activeId || !draft.trim()) return;
    startTransition(async () => {
      const result = await sendMessageAction(activeId, draft);
      if (result.ok) {
        setMessages((prev) => [...prev, result.message]);
        setThreads((prev) =>
          prev.map((t) =>
            t.id === activeId
              ? {
                  ...t,
                  preview: result.message.body,
                  lastMessageAt: result.message.sentAt,
                  unread: 0,
                }
              : t,
          ),
        );
        setDraft("");
      }
    });
  }

  if (!threads.length) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No messages yet"
        description="Message candidates from a profile or AI Recruiting result."
        actionLabel="Browse candidates"
        actionHref="/workforce/candidates"
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-2">
        {threads.map((t) => {
          const candidate = candidates.find((c) => c.id === t.candidateId);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveId(t.id)}
              className={`w-full rounded-[12px] px-3 py-3 text-left ${
                activeId === t.id ? "bg-[#EFF6FF]" : "bg-[#F8F9FB] hover:bg-[#F1F5F9]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[14px] font-semibold text-[#111827]">
                  {t.subject}
                </p>
                {t.unread > 0 ? (
                  <span className="rounded-full bg-[#2563EB] px-1.5 text-[11px] font-bold text-white">
                    {t.unread}
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 truncate text-[12px] text-[#6B7280]">
                {candidate ? candidateFullName(candidate) : "Candidate"}
              </p>
              <p className="mt-1 line-clamp-1 text-[12px] text-[#334155]">{t.preview}</p>
            </button>
          );
        })}
      </aside>

      <section className="flex min-h-[420px] flex-col rounded-[16px] bg-[#F8F9FB] p-4">
        {activeThread ? (
          <>
            <header className="border-b border-[#EAEAEA] pb-3">
              <h3 className="text-[15px] font-semibold text-[#111827]">
                {activeThread.subject}
              </h3>
              <p className="text-[13px] text-[#6B7280]">
                {companies.find((c) => c.id === activeThread.companyId)?.name} ↔{" "}
                {(() => {
                  const c = candidates.find((x) => x.id === activeThread.candidateId);
                  return c ? candidateFullName(c) : "Candidate";
                })()}
              </p>
            </header>
            <div className="flex-1 space-y-3 overflow-y-auto py-4">
              {activeMessages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[85%] rounded-[12px] px-3 py-2 ${
                    m.sender === "employer"
                      ? "ml-auto bg-[#2563EB] text-white"
                      : "bg-white text-[#111827] shadow-[inset_0_0_0_1px_#EAEAEA]"
                  }`}
                >
                  <p className="text-[12px] opacity-80">{m.senderName}</p>
                  <p className="text-[14px]">{m.body}</p>
                  <p className="mt-1 text-[11px] opacity-70">
                    {new Date(m.sentAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t border-[#EAEAEA] pt-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write a message"
                className="h-10 flex-1 rounded-[10px] bg-white px-3 text-[14px] outline-none ring-1 ring-[#EAEAEA] focus:ring-[#2563EB]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <button
                type="button"
                onClick={send}
                disabled={pending || !draft.trim()}
                title={!draft.trim() ? "Type a message first" : "Send message"}
                className="transpo-btn-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
