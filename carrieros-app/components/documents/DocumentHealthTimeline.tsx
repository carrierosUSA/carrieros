import type { DocumentHealthTimelineEvent } from "@/lib/documents/types";

type DocumentHealthTimelineProps = {
  events: DocumentHealthTimelineEvent[];
  emptyLabel?: string;
};

const TYPE_LABELS: Record<DocumentHealthTimelineEvent["type"], string> = {
  requested: "Requested",
  uploaded: "Uploaded",
  reviewed: "Reviewed",
  approved: "Approved",
  rejected: "Rejected",
  reuploaded: "Re-uploaded",
  downloaded: "Downloaded",
  shared: "Shared",
  exception: "Exception",
  ignored: "Ignored",
};

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 16);
  }
}

export default function DocumentHealthTimeline({
  events,
  emptyLabel = "No document activity yet",
}: DocumentHealthTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-8 text-center">
        <p className="text-[14px] font-medium text-slate-500">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <ol className="space-y-0">
      {events.map((event, index) => (
        <li key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
          {index < events.length - 1 ? (
            <span
              className="absolute left-[7px] top-4 bottom-0 w-px bg-[#E2E8F0]"
              aria-hidden
            />
          ) : null}
          <span
            className="relative mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#2563EB]"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <p className="text-[14px] font-semibold text-slate-900">
                {event.label}
              </p>
              <span className="text-[12px] font-medium text-slate-400">
                {TYPE_LABELS[event.type]}
              </span>
            </div>
            <p className="mt-0.5 text-[13px] text-slate-500">
              {formatWhen(event.occurredAt)}
              {event.actorName ? ` · ${event.actorName}` : ""}
            </p>
            {event.detail ? (
              <p className="mt-1 text-[13px] text-slate-600">{event.detail}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
