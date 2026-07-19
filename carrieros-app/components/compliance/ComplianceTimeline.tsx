import Link from "next/link";
import {
  COMPLIANCE_TIMELINE_CATEGORY_LABELS,
  type ComplianceTimelineEvent,
} from "@/lib/types/compliance";
import { formatComplianceDate } from "@/lib/compliance/compliance-board";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type ComplianceTimelineProps = {
  events: ComplianceTimelineEvent[];
  title?: string;
};

const categoryTone: Record<
  ComplianceTimelineEvent["category"],
  keyof typeof CARRIEROS_COLORS
> = {
  document: "warning",
  inspection: "info",
  accident: "critical",
  claim: "warning",
  drug_test: "info",
  training: "success",
  violation: "critical",
  integration: "disabled",
};

export default function ComplianceTimeline({
  events,
  title = "Compliance timeline",
}: ComplianceTimelineProps) {
  return (
    <section className="rounded-[16px] bg-[#F8FAFC] p-4 ring-1 ring-[#EAEAEA]">
      <div className="mb-4">
        <p className="text-[15px] font-semibold text-slate-900">{title}</p>
        <p className="text-[13px] text-slate-500">
          Every compliance event recorded automatically.
        </p>
      </div>

      {events.length === 0 ? (
        <p className="py-6 text-center text-[14px] text-slate-500">
          No events yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => {
            const tone = CARRIEROS_COLORS[categoryTone[event.category]];
            const content = (
              <div className="flex gap-3">
                <span
                  className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${tone.bg} ring-2 ring-white`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-[14px] font-semibold text-slate-900">
                      {event.label}
                    </p>
                    <p className="text-[12px] font-medium text-slate-400">
                      {formatComplianceDate(event.occurredAt)}
                    </p>
                  </div>
                  {event.detail ? (
                    <p className="mt-0.5 text-[13px] text-slate-600">
                      {event.detail}
                    </p>
                  ) : null}
                  <p className={`mt-1 text-[12px] font-medium ${tone.text}`}>
                    {COMPLIANCE_TIMELINE_CATEGORY_LABELS[event.category]}
                    {event.entityLabel ? ` · ${event.entityLabel}` : ""}
                  </p>
                </div>
              </div>
            );

            return (
              <li
                key={event.id}
                className="rounded-[12px] bg-white px-3 py-3 ring-1 ring-[#EAEAEA]"
              >
                {event.href ? (
                  <Link href={event.href} className="block transition hover:opacity-90">
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
