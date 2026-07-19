import { formatDocumentDateTime } from "@/lib/documents/document-board";
import type { DocumentTimelineEvent } from "@/lib/types/documents";

type DocumentTimelineProps = {
  events: DocumentTimelineEvent[];
};

export default function DocumentTimeline({ events }: DocumentTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-8 text-center ring-1 ring-[#EAEAEA]">
        <p className="text-[14px] font-medium text-slate-500">No timeline events yet</p>
      </div>
    );
  }

  const sorted = [...events].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );

  return (
    <div className="relative space-y-0 pl-4">
      <div className="absolute bottom-2 left-[7px] top-2 w-px bg-[#E2E8F0]" />
      {sorted.map((event) => (
        <div key={event.id} className="relative pb-4 last:pb-0">
          <span className="absolute -left-4 top-1.5 h-2.5 w-2.5 rounded-full bg-[#2563EB] ring-4 ring-white" />
          <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]">
            <p className="text-[14px] font-semibold text-slate-900">{event.label}</p>
            <p className="mt-0.5 text-[13px] text-slate-500">
              {formatDocumentDateTime(event.occurredAt)}
              {event.actorName ? ` · ${event.actorName}` : ""}
            </p>
          </div>
        </div>
      ))}
      <p className="pt-2 text-[12px] text-slate-400">
        Timeline events can also fan out to load and driver timelines when linked.
      </p>
    </div>
  );
}
