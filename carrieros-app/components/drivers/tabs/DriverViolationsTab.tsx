import type { DriverViolation } from "@/lib/types";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type DriverViolationsTabProps = {
  violations: DriverViolation[];
};

function severityTone(severity: DriverViolation["severity"]) {
  switch (severity) {
    case "critical":
      return CARRIEROS_COLORS.critical;
    case "major":
      return CARRIEROS_COLORS.warning;
    default:
      return CARRIEROS_COLORS.disabled;
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DriverViolationsTab({ violations }: DriverViolationsTabProps) {
  if (violations.length === 0) {
    return (
      <section className="rounded-[16px] bg-white p-8 text-center ring-1 ring-[#E5E7EB]">
        <p className="text-[15px] font-semibold text-slate-900">No violations on record</p>
        <p className="mt-1 text-[14px] text-slate-500">
          This driver has a clean violation history.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {violations.map((violation) => {
        const tone = severityTone(violation.severity);

        return (
          <article
            key={violation.id}
            className="rounded-[16px] bg-white p-4 ring-1 ring-[#E5E7EB]"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-[15px] font-semibold text-slate-950">
                  {violation.title}
                </h3>
                <p className="mt-1 text-[13px] text-slate-500">
                  {formatDate(violation.occurredAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold capitalize ring-1 ${tone.bg} ${tone.text} ${tone.border}`}
                >
                  {violation.severity}
                </span>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold capitalize ring-1 ${
                    violation.status === "open"
                      ? `${CARRIEROS_COLORS.warning.bg} ${CARRIEROS_COLORS.warning.text} ${CARRIEROS_COLORS.warning.border}`
                      : `${CARRIEROS_COLORS.success.bg} ${CARRIEROS_COLORS.success.text} ${CARRIEROS_COLORS.success.border}`
                  }`}
                >
                  {violation.status}
                </span>
              </div>
            </div>
            <p className="mt-3 text-[14px] leading-6 text-slate-700">
              {violation.description}
            </p>
          </article>
        );
      })}
    </section>
  );
}
