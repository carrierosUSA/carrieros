"use client";

import { CHANNEL_META } from "@/components/communications/channel-meta";
import EntityChips from "@/components/communications/EntityChips";
import type { CommunicationTimelineEvent } from "@/lib/communications/types";

type TimelinePanelProps = {
  events: CommunicationTimelineEvent[];
  onSelectCommunication?: (id: string) => void;
};

export default function TimelinePanel({
  events,
  onSelectCommunication,
}: TimelinePanelProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl bg-[#F8F9FB] px-5 py-10 text-center">
        <p className="text-[15px] font-semibold text-[#111827]">No timeline events</p>
        <p className="mt-1 text-[13px] text-[#64748B]">
          Adjust filters or compose a new communication.
        </p>
      </div>
    );
  }

  return (
    <ol className="space-y-0">
      {events.map((event, index) => {
        const meta = CHANNEL_META[event.channel];
        const when = new Date(event.occurredAt).toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });

        return (
          <li key={event.id} className="relative flex gap-4 pb-6">
            {index < events.length - 1 ? (
              <span className="absolute left-[11px] top-7 bottom-0 w-px bg-[#E2E8F0]" />
            ) : null}
            <span
              className={`relative z-[1] mt-1 h-[22px] w-[22px] shrink-0 rounded-full ${meta.soft} ring-4 ring-white`}
            />
            <button
              type="button"
              onClick={() => onSelectCommunication?.(event.communicationId)}
              className="min-w-0 flex-1 rounded-2xl bg-[#F8F9FB] px-4 py-3 text-left transition hover:bg-[#EFF6FF]"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${meta.bg} ${meta.text}`}
                >
                  {meta.label}
                </span>
                <span className="text-[12px] font-medium text-[#94A3B8]">
                  {when}
                </span>
              </div>
              <p className="mt-1.5 text-[14px] font-semibold text-[#111827]">
                {event.label}
              </p>
              <p className="mt-0.5 text-[13px] leading-snug text-[#64748B]">
                {event.summary}
              </p>
              <EntityChips linkedTo={event.linkedTo} className="mt-2" />
            </button>
          </li>
        );
      })}
    </ol>
  );
}
