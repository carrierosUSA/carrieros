import type { DriverSafetyEvent } from "@/lib/types";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type DriverSafetyTabProps = {
  events: DriverSafetyEvent[];
};

function severityTone(severity: DriverSafetyEvent["severity"]) {
  switch (severity) {
    case "high":
      return CARRIEROS_COLORS.critical;
    case "medium":
      return CARRIEROS_COLORS.warning;
    default:
      return CARRIEROS_COLORS.success;
  }
}

export default function DriverSafetyTab({ events }: DriverSafetyTabProps) {
  if (events.length === 0) {
    return (
      <section className="rounded-[16px] bg-white p-8 text-center ring-1 ring-[#E5E7EB]">
        <p className="text-[15px] font-semibold text-slate-900">No safety events</p>
        <p className="mt-1 text-[14px] text-slate-500">
          Clean safety record — no open or recent events.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {events.map((event) => {
        const tone = severityTone(event.severity);

        return (
          <article
            key={event.id}
            className="rounded-[16px] bg-white p-4 ring-1 ring-[#E5E7EB]"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-[15px] font-semibold text-slate-950">{event.title}</h3>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold capitalize ring-1 ${tone.bg} ${tone.text} ${tone.border}`}
              >
                {event.severity}
              </span>
            </div>
            <p className="mt-2 text-[14px] leading-6 text-slate-700">{event.description}</p>
            <p className="mt-3 text-[12px] text-slate-500">
              {new Date(event.occurredAt).toLocaleDateString()} ·{" "}
              <span className="capitalize">{event.status}</span>
            </p>
          </article>
        );
      })}
    </section>
  );
}
