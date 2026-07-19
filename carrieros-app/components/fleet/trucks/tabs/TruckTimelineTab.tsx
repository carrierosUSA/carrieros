import type { TruckTimelineEvent } from "@/lib/types";

type TruckTimelineTabProps = {
  events: TruckTimelineEvent[];
};

const categoryLabels: Record<TruckTimelineEvent["category"], string> = {
  assignment: "Assignment",
  maintenance: "Maintenance",
  fuel: "Fuel",
  document: "Document",
  telematics: "Telematics",
  expense: "Expense",
  status: "Status",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TruckTimelineTab({ events }: TruckTimelineTabProps) {
  if (events.length === 0) {
    return (
      <section className="rounded-[16px] bg-white p-8 text-center ring-1 ring-[#EAEAEA]">
        <p className="text-[15px] font-semibold text-slate-900">No timeline events</p>
      </section>
    );
  }

  return (
    <section className="rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA]">
      <ol className="relative space-y-0">
        {events.map((event, index) => (
          <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
            {index < events.length - 1 ? (
              <span
                className="absolute left-[7px] top-4 h-[calc(100%-8px)] w-px bg-[#EAEAEA]"
                aria-hidden
              />
            ) : null}
            <span className="relative z-10 mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full bg-[#2563EB] ring-4 ring-white" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <p className="text-[14px] font-semibold text-slate-950">{event.label}</p>
                <span className="text-[12px] font-medium text-slate-400">
                  {categoryLabels[event.category]}
                </span>
              </div>
              <p className="mt-0.5 text-[13px] text-slate-500">
                {formatDate(event.occurredAt)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
