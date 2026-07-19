"use client";

import { FormEvent, useMemo, useState } from "react";
import { X } from "lucide-react";
import { CHANNEL_META } from "@/components/communications/channel-meta";
import {
  applyEntityToLinked,
  listEntityOptions,
  removeEntityFromLinked,
  resolveLinkedEntityChips,
} from "@/lib/communications/entities";
import { hasAnyLinkedEntity } from "@/lib/communications/timeline";
import type {
  CallDirection,
  CommunicationChannel,
  ComposeInput,
  LinkedEntities,
} from "@/lib/communications/types";

type ComposeModalProps = {
  open: boolean;
  initialChannel?: CommunicationChannel;
  initialLinkedTo?: LinkedEntities;
  initialPhone?: string;
  onClose: () => void;
  onCompose: (input: ComposeInput) => Promise<void>;
};

const CHANNELS: CommunicationChannel[] = ["voice", "sms", "email", "chat"];

const CHAT_ROOMS = [
  "Dispatch ↔ Safety",
  "Dispatch ↔ Accounting",
  "Fleet ↔ Dispatch",
  "Support ↔ Dispatch",
];

export default function ComposeModal({
  open,
  initialChannel = "sms",
  initialLinkedTo = {},
  initialPhone,
  onClose,
  onCompose,
}: ComposeModalProps) {
  const [channel, setChannel] = useState<CommunicationChannel>(initialChannel);
  const [linkedTo, setLinkedTo] = useState<LinkedEntities>(initialLinkedTo);
  const [entityQuery, setEntityQuery] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [direction, setDirection] = useState<CallDirection>("outbound");
  const [durationMinutes, setDurationMinutes] = useState("2");
  const [notes, setNotes] = useState("");
  const [chatRoom, setChatRoom] = useState(CHAT_ROOMS[0]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const entityResults = useMemo(
    () => listEntityOptions(entityQuery).slice(0, 8),
    [entityQuery],
  );
  const chips = resolveLinkedEntityChips(linkedTo);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!hasAnyLinkedEntity(linkedTo)) {
      setError("Link at least one load, driver, truck, trailer, broker, or company.");
      return;
    }

    if (!body.trim() && channel !== "voice") {
      setError("Add a message body.");
      return;
    }

    if ((channel === "sms" || channel === "voice") && !phone.trim()) {
      setError("Add a phone number.");
      return;
    }

    if (channel === "email" && !email.trim()) {
      setError("Add an email address.");
      return;
    }

    setSubmitting(true);
    try {
      const durationSeconds =
        channel === "voice"
          ? Math.round(Number(durationMinutes || "0") * 60)
          : undefined;

      await onCompose({
        channel,
        linkedTo,
        participants: [
          {
            name:
              recipientName.trim() ||
              (channel === "chat" ? "Dispatch" : "Contact"),
            phone: phone.trim() || undefined,
            email: email.trim() || undefined,
            role: channel === "chat" ? "Internal" : undefined,
          },
        ],
        subject: channel === "email" ? subject.trim() || undefined : undefined,
        body:
          body.trim() ||
          (channel === "voice" ? notes.trim() || "Call logged" : ""),
        direction: channel === "voice" ? direction : undefined,
        durationSeconds,
        notes: notes.trim() || undefined,
        chatRoom: channel === "chat" ? chatRoom : undefined,
      });
      onClose();
    } catch {
      setError("Could not send. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0F172A]/35 p-3 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close compose"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex max-h-[92vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
      >
        <div className="flex items-center justify-between border-b border-[#F1F5F9] px-5 py-4">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
              Compose
            </p>
            <h2 className="text-[18px] font-bold text-[#111827]">
              New communication
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl text-[#64748B] hover:bg-[#F5F7FA]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-5 py-4">
          <div>
            <p className="mb-2 text-[13px] font-semibold text-[#334155]">Channel</p>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((c) => {
                const meta = CHANNEL_META[c];
                const active = channel === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChannel(c)}
                    className={`rounded-full px-3.5 py-2 text-[13px] font-semibold transition ${
                      active
                        ? `${meta.bg} ${meta.text} ring-1 ring-current/20`
                        : "bg-[#F5F7FA] text-[#64748B]"
                    }`}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-semibold text-[#334155]">
              Linked entities <span className="text-[#DC2626]">*</span>
            </p>
            {chips.length > 0 ? (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {chips.map((chip) => (
                  <button
                    key={`${chip.type}-${chip.id}`}
                    type="button"
                    onClick={() =>
                      setLinkedTo(removeEntityFromLinked(linkedTo, chip.type))
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#EFF6FF] px-2.5 py-1 text-[12px] font-semibold text-[#2563EB]"
                    title="Remove"
                  >
                    {chip.label}
                    <span className="text-[#93C5FD]">×</span>
                  </button>
                ))}
              </div>
            ) : null}
            <input
              value={entityQuery}
              onChange={(e) => setEntityQuery(e.target.value)}
              placeholder="Search loads, drivers, trucks…"
              className="h-11 w-full rounded-xl bg-[#F5F7FA] px-3.5 text-[14px] outline-none focus:bg-white focus:ring-2 focus:ring-[#BFDBFE]"
            />
            {entityQuery.trim() ? (
              <ul className="mt-2 max-h-40 overflow-y-auto rounded-xl bg-[#F8F9FB] p-1">
                {entityResults.map((opt) => (
                  <li key={`${opt.type}-${opt.id}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setLinkedTo(applyEntityToLinked(linkedTo, opt));
                        setEntityQuery("");
                      }}
                      className="flex w-full flex-col rounded-lg px-3 py-2 text-left hover:bg-white"
                    >
                      <span className="text-[13px] font-semibold text-[#111827]">
                        {opt.label}
                      </span>
                      <span className="text-[12px] text-[#64748B]">
                        {opt.type}
                        {opt.sublabel ? ` · ${opt.sublabel}` : ""}
                      </span>
                    </button>
                  </li>
                ))}
                {entityResults.length === 0 ? (
                  <li className="px-3 py-2 text-[13px] text-[#64748B]">
                    No matches
                  </li>
                ) : null}
              </ul>
            ) : null}
          </div>

          {channel === "chat" ? (
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-[#334155]">
                Room
              </span>
              <select
                value={chatRoom}
                onChange={(e) => setChatRoom(e.target.value)}
                className="h-11 w-full rounded-xl bg-[#F5F7FA] px-3.5 text-[14px] outline-none focus:bg-white focus:ring-2 focus:ring-[#99F6E4]"
              >
                {CHAT_ROOMS.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[13px] font-semibold text-[#334155]">
                  Recipient name
                </span>
                <input
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="h-11 w-full rounded-xl bg-[#F5F7FA] px-3.5 text-[14px] outline-none focus:bg-white focus:ring-2 focus:ring-[#BFDBFE]"
                />
              </label>
              {channel === "email" ? (
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-[13px] font-semibold text-[#334155]">
                    Email
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 w-full rounded-xl bg-[#F5F7FA] px-3.5 text-[14px] outline-none focus:bg-white focus:ring-2 focus:ring-[#BFDBFE]"
                  />
                </label>
              ) : (
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-[13px] font-semibold text-[#334155]">
                    Phone
                  </span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="210-555-0001"
                    className="h-11 w-full rounded-xl bg-[#F5F7FA] px-3.5 text-[14px] outline-none focus:bg-white focus:ring-2 focus:ring-[#BFDBFE]"
                  />
                </label>
              )}
            </div>
          )}

          {channel === "voice" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-semibold text-[#334155]">
                  Direction
                </span>
                <select
                  value={direction}
                  onChange={(e) =>
                    setDirection(e.target.value as CallDirection)
                  }
                  className="h-11 w-full rounded-xl bg-[#F5F7FA] px-3.5 text-[14px] outline-none"
                >
                  <option value="outbound">Outbound</option>
                  <option value="inbound">Inbound</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-semibold text-[#334155]">
                  Duration (minutes)
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="h-11 w-full rounded-xl bg-[#F5F7FA] px-3.5 text-[14px] outline-none"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[13px] font-semibold text-[#334155]">
                  Notes
                </span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl bg-[#F5F7FA] px-3.5 py-3 text-[14px] outline-none focus:bg-white focus:ring-2 focus:ring-[#BFDBFE]"
                />
              </label>
            </div>
          ) : null}

          {channel === "email" ? (
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-[#334155]">
                Subject
              </span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-11 w-full rounded-xl bg-[#F5F7FA] px-3.5 text-[14px] outline-none focus:bg-white focus:ring-2 focus:ring-[#BFDBFE]"
              />
            </label>
          ) : null}

          {channel !== "voice" ? (
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-[#334155]">
                Message
              </span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="w-full rounded-xl bg-[#F5F7FA] px-3.5 py-3 text-[14px] outline-none focus:bg-white focus:ring-2 focus:ring-[#BFDBFE]"
              />
            </label>
          ) : null}

          {error ? (
            <p className="text-[13px] font-medium text-[#DC2626]">{error}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#F1F5F9] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl px-4 text-[13px] font-semibold text-[#64748B] hover:bg-[#F5F7FA]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="h-10 rounded-xl bg-[#2563EB] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:opacity-50"
          >
            {submitting
              ? "Sending…"
              : channel === "voice"
                ? "Log call"
                : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
