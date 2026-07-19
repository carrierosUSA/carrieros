"use client";

import { Mail, MessageCircle, MessagesSquare, Phone } from "lucide-react";
import { CHANNEL_META } from "@/components/communications/channel-meta";
import EntityChips from "@/components/communications/EntityChips";
import type { CommunicationRecord } from "@/lib/communications/types";

type CommunicationCardProps = {
  record: CommunicationRecord;
  selected?: boolean;
  onSelect: (id: string) => void;
};

const ICONS = {
  voice: Phone,
  sms: MessageCircle,
  email: Mail,
  chat: MessagesSquare,
} as const;

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date("2026-07-17T17:00:00Z");
  const sameDay =
    date.toDateString() === now.toDateString() ||
    Math.abs(now.getTime() - date.getTime()) < 1000 * 60 * 60 * 18;

  if (sameDay && date.getUTCDate() === 17) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function CommunicationCard({
  record,
  selected,
  onSelect,
}: CommunicationCardProps) {
  const meta = CHANNEL_META[record.channel];
  const Icon = ICONS[record.channel];
  const title =
    record.subject ||
    record.chatRoom ||
    record.participants[0]?.name ||
    meta.label;
  const subtitle =
    record.channel === "voice"
      ? `${record.direction === "inbound" ? "Inbound" : "Outbound"}${
          record.status === "missed" ? " · Missed" : ""
        }`
      : record.preview;

  return (
    <button
      type="button"
      onClick={() => onSelect(record.id)}
      className={`w-full rounded-2xl px-3.5 py-3 text-left transition ${
        selected
          ? "bg-[#EFF6FF] shadow-[inset_0_0_0_1px_rgba(37,99,235,0.22)]"
          : "hover:bg-[#F8F9FB]"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${meta.bg} ${meta.text}`}
        >
          <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-[#111827]">
                {title}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-[#64748B]">
                {subtitle}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-[12px] font-medium text-[#94A3B8]">
                {formatTime(record.updatedAt)}
              </span>
              {record.unread ? (
                <span className="h-2 w-2 rounded-full bg-[#2563EB]" title="Unread" />
              ) : null}
            </div>
          </div>
          <EntityChips linkedTo={record.linkedTo} className="mt-2" />
        </div>
      </div>
    </button>
  );
}
