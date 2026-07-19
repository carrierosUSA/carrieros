"use client";

import { FormEvent, useState } from "react";
import { usePortal } from "@/components/portal/PortalProvider";
import PermissionButton from "@/components/portal/PermissionButton";
import {
  PortalBadge,
  PortalCard,
  PortalEmpty,
  PortalSectionTitle,
} from "@/components/portal/ui";

const DEPT_LABEL = {
  dispatch: "Dispatch",
  billing: "Billing",
  safety: "Safety",
} as const;

export default function PortalMessages() {
  const { session, threads, sendMessage } = usePortal();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  if (!session) return null;

  const active =
    threads.find((t) => t.id === activeId) ?? threads[0] ?? null;

  function onSend(e: FormEvent) {
    e.preventDefault();
    if (!active || !draft.trim()) return;
    sendMessage(active.id, draft.trim());
    setDraft("");
  }

  return (
    <div className="space-y-6">
      <PortalSectionTitle
        title="Messages"
        subtitle="Secure messaging with Dispatch, Billing, and Safety."
      />

      {threads.length === 0 ? (
        <PortalEmpty
          title="No conversations"
          body="When you message the carrier, threads will appear here."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <PortalCard className="p-3">
            <ul className="space-y-1">
              {threads.map((thread) => (
                <li key={thread.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(thread.id)}
                    className={`w-full rounded-xl px-3 py-3 text-left transition ${
                      active?.id === thread.id
                        ? "bg-[#EFF6FF]"
                        : "hover:bg-[#F8F9FB]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <PortalBadge tone="blue">
                        {DEPT_LABEL[thread.department]}
                      </PortalBadge>
                      {thread.unread > 0 ? (
                        <span className="rounded-full bg-[#DC2626] px-1.5 text-[11px] font-bold text-white">
                          {thread.unread}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1.5 truncate text-sm font-semibold text-[#111827]">
                      {thread.subject}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </PortalCard>

          {active ? (
            <PortalCard className="flex min-h-[420px] flex-col p-0">
              <div className="border-b border-[#F3F4F6] px-5 py-4">
                <p className="font-semibold text-[#111827]">{active.subject}</p>
                <p className="text-sm text-[#6B7280]">
                  {DEPT_LABEL[active.department]} · Lone Star Alpha Carrier
                </p>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                {active.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.sender === "portal"
                        ? "ml-auto bg-[#2563EB] text-white"
                        : "bg-[#F5F7FA] text-[#111827]"
                    }`}
                  >
                    <p className="text-[12px] font-semibold opacity-80">
                      {msg.senderName}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed">{msg.body}</p>
                    <p className="mt-1.5 text-[11px] opacity-70">
                      {new Date(msg.sentAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <form
                onSubmit={onSend}
                className="flex gap-2 border-t border-[#F3F4F6] p-4"
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a secure message…"
                  className="h-11 flex-1 rounded-xl border border-[#DDE2EA] bg-[#F8F9FB] px-3 text-sm outline-none focus:border-[#2563EB] focus:bg-white"
                />
                <PermissionButton
                  role={session.role}
                  permission="send_messages"
                  type="submit"
                  className="h-11 rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
                >
                  Send
                </PermissionButton>
              </form>
            </PortalCard>
          ) : null}
        </div>
      )}
    </div>
  );
}
