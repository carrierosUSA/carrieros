import type { DriverTimelineEvent } from "@/lib/types";

type DriverTimelineTabProps = {
  events: DriverTimelineEvent[];
};

const categoryLabels: Record<DriverTimelineEvent["category"], string> = {
  hire: "Hiring",
  assignment: "Assignment",
  compliance: "Compliance",
  safety: "Safety",
  payroll: "Payroll",
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

export default function DriverTimelineTab({ events }: DriverTimelineTabProps) {
  if (events.length === 0) {
    return (
      <section
        id="driver-timeline"
        className="rounded-[16px] bg-white p-8 text-center ring-1 ring-[#E5E7EB]"
      >
        <p className="text-[15px] font-semibold text-slate-900">No timeline events</p>
      </section>
    );
  }

  return (
    <section id="driver-timeline" className="rounded-[16px] bg-white p-5 ring-1 ring-[#E5E7EB]">
      <ol className="relative space-y-0">
        {events.map((event, index) => (
          <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
            {index < events.length - 1 ? (
              <span
                className="absolute left-[7px] top-4 h-[calc(100%-8px)] w-px bg-[#E5E7EB]"
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
