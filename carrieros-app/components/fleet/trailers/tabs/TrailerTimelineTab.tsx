import type { TrailerTimelineEvent } from "@/lib/types";

type TrailerTimelineTabProps = {
  events: TrailerTimelineEvent[];
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const categoryLabel: Record<TrailerTimelineEvent["category"], string> = {
  assignment: "Assignment",
  maintenance: "Maintenance",
  document: "Document",
  telematics: "GPS",
  reefer: "Reefer",
  status: "Status",
  load: "Load",
};

export default function TrailerTimelineTab({ events }: TrailerTimelineTabProps) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );

  return (
    <section className="rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA]">
      <h2 className="text-[15px] font-semibold text-slate-950">Timeline</h2>
      <ol className="mt-4 space-y-0">
        {sorted.map((event, index) => (
          <li key={event.id} className="relative flex gap-4 pb-5 last:pb-0">
            {index < sorted.length - 1 ? (
              <span
                className="absolute left-[7px] top-3 h-full w-px bg-[#EAEAEA]"
                aria-hidden
              />
            ) : null}
            <span
              className="relative mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full bg-[#2563EB] ring-4 ring-[#EFF6FF]"
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-slate-400">
                {categoryLabel[event.category]} · {formatTime(event.occurredAt)}
              </p>
              <p className="mt-0.5 text-[14px] font-semibold text-slate-900">
                {event.label}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
