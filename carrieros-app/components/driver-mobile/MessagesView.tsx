"use client";

import { useState } from "react";
import { Camera, Mic, Languages } from "lucide-react";
import { useDriverMobile } from "@/components/driver-mobile/DriverMobileProvider";
import { DmCard, DmPrimaryButton } from "@/components/driver-mobile/ui";
import type { MessageChannel } from "@/lib/driver-mobile/types";

export default function MessagesView() {
  const { state, sendMessage, flash } = useDriverMobile() as ReturnType<
    typeof useDriverMobile
  > & { flash?: (msg: string) => void };
  const [channel, setChannel] = useState<MessageChannel>("dispatch");
  const [draft, setDraft] = useState("");
  const [translated, setTranslated] = useState<string | null>(null);
  const thread = state.threads.find((t) => t.channel === channel) ?? state.threads[0];

  return (
    <div className="flex h-full min-h-[60vh] flex-col animate-[carrieros-fade-in_0.35s_ease]">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight">Messages</h2>
        <p className="mt-1 text-[14px] text-[var(--dm-muted)]">
          Dispatcher, Office, Accounting, Maintenance, Safety, Group — voice, photo, AI translate.
        </p>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {state.threads.map((t) => (
          <button
            key={t.channel}
            type="button"
            onClick={() => setChannel(t.channel)}
            className={`relative shrink-0 rounded-full px-3.5 py-2.5 text-[13px] font-semibold ${
              channel === t.channel
                ? "bg-[var(--color-info)] text-white"
                : "bg-[var(--dm-surface)]"
            }`}
          >
            {t.title}
            {t.unread > 0 && (
              <span className="ml-1.5 inline-grid h-5 min-w-5 place-items-center rounded-full bg-[var(--color-critical)] px-1 text-[10px] text-white">
                {t.unread}
              </span>
            )}
          </button>
        ))}
      </div>

      <DmCard className="mt-4 flex min-h-[360px] flex-1 flex-col">
        <p className="text-[13px] font-medium text-[var(--dm-muted)]">{thread.subtitle}</p>
        <div className="mt-3 flex-1 space-y-3 overflow-y-auto">
          {thread.messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed ${
                m.sender === "driver"
                  ? "ml-auto bg-[var(--color-info)] text-white"
                  : "bg-[var(--dm-elevated)]"
              }`}
            >
              <p className="mb-0.5 text-[11px] font-semibold opacity-80">{m.senderName}</p>
              {m.body}
              {m.sender === "driver" && (
                <p className="mt-1 text-[10px] opacity-70">Read · local</p>
              )}
            </div>
          ))}
        </div>

        {translated && (
          <p className="mt-2 rounded-2xl bg-blue-500/10 px-3 py-2 text-[13px] text-[var(--color-info)]">
            AI translate: {translated}
          </p>
        )}

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--dm-elevated)]"
            aria-label="Voice note"
            onClick={() => flash?.("Voice note affordance — architecture-ready")}
          >
            <Mic className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--dm-elevated)]"
            aria-label="Photo"
            onClick={() => flash?.("Photo attach affordance — architecture-ready")}
          >
            <Camera className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--dm-elevated)]"
            aria-label="Translate"
            onClick={() => {
              const last = [...thread.messages].reverse().find((m) => m.sender === "team");
              setTranslated(
                last
                  ? `ES: ${last.body.slice(0, 80)}${last.body.length > 80 ? "…" : ""}`
                  : "No message to translate",
              );
            }}
          >
            <Languages className="h-5 w-5" />
          </button>
        </div>

        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(channel, draft);
            setDraft("");
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Message…"
            className="min-h-12 flex-1 rounded-2xl bg-[var(--dm-elevated)] px-4 text-[15px] outline-none"
          />
          <div className="w-24">
            <DmPrimaryButton type="submit" disabled={!draft.trim()}>
              Send
            </DmPrimaryButton>
          </div>
        </form>
      </DmCard>
    </div>
  );
}
