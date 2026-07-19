"use client";

import { usePathname, useRouter } from "next/navigation";
import type {
  ComplianceAlert,
  ComplianceAlphPrediction,
  ComplianceTab,
} from "@/lib/types/compliance";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type ComplianceAlphAlertsStripProps = {
  predictions: ComplianceAlphPrediction[];
  alerts: ComplianceAlert[];
};

function severityStyles(severity: "info" | "warning" | "critical") {
  switch (severity) {
    case "critical":
      return CARRIEROS_COLORS.critical;
    case "warning":
      return CARRIEROS_COLORS.warning;
    default:
      return CARRIEROS_COLORS.info;
  }
}

export default function ComplianceAlphAlertsStrip({
  predictions,
  alerts,
}: ComplianceAlphAlertsStripProps) {
  const router = useRouter();
  const pathname = usePathname();

  if (predictions.length === 0 && alerts.length === 0) {
    return null;
  }

  function go(tab: ComplianceTab) {
    router.replace(`${pathname}?tab=${tab}`, { scroll: false });
  }

  return (
    <div className="space-y-3">
      {predictions.length > 0 ? (
        <section
          aria-label="Alph compliance predictions"
          className={`rounded-[14px] p-4 ring-1 ${CARRIEROS_COLORS.info.bg} ${CARRIEROS_COLORS.info.border}`}
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[15px]" aria-hidden>
              ✦
            </span>
            <div>
              <p
                className={`text-[14px] font-bold ${CARRIEROS_COLORS.info.text}`}
              >
                Alph safety predictions
              </p>
              <p className="text-[13px] font-medium text-slate-600">
                Upcoming risks across drivers, equipment, and inspections.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {predictions.map((prediction) => {
              const tone = severityStyles(prediction.severity);
              return (
                <div
                  key={prediction.id}
                  className="flex flex-wrap items-center gap-3 rounded-[12px] bg-white px-3 py-3 ring-1 ring-[#EAEAEA] sm:flex-nowrap"
                >
                  <span
                    className={`inline-flex h-2 w-2 shrink-0 rounded-full ${tone.bg}`}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-slate-900">
                      {prediction.title}
                    </p>
                    <p className="mt-0.5 text-[13px] text-slate-600">
                      {prediction.message}
                    </p>
                    <p className="mt-1 text-[12px] font-medium text-slate-400">
                      {Math.round(prediction.confidence * 100)}% confidence
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => go(prediction.fixTab)}
                    className="inline-flex h-9 items-center justify-center rounded-full bg-[#2563EB] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
                  >
                    {prediction.fixLabel}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {alerts.length > 0 ? (
        <section
          aria-label="Compliance alerts"
          className={`rounded-[14px] p-4 ring-1 ${CARRIEROS_COLORS.warning.bg} ${CARRIEROS_COLORS.warning.border}`}
        >
          <div className="mb-3">
            <p
              className={`text-[14px] font-bold ${CARRIEROS_COLORS.warning.text}`}
            >
              {alerts.length} alert{alerts.length === 1 ? "" : "s"} need action
            </p>
            <p className="text-[13px] font-medium text-slate-600">
              Expiring credentials, inspections, and training.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {alerts.slice(0, 5).map((alert) => {
              const tone = severityStyles(alert.severity);
              return (
                <div
                  key={alert.id}
                  className="flex flex-wrap items-center gap-3 rounded-[12px] bg-white px-3 py-3 ring-1 ring-[#EAEAEA] sm:flex-nowrap"
                >
                  <span
                    className={`inline-flex h-2 w-2 shrink-0 rounded-full ${tone.bg}`}
                    aria-hidden
                  />
                  <p className="min-w-0 flex-1 text-[14px] font-semibold text-slate-900">
                    {alert.message}
                  </p>
                  <button
                    type="button"
                    onClick={() => go(alert.fixTab)}
                    className="inline-flex h-9 items-center justify-center rounded-full bg-[#2563EB] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
                  >
                    {alert.fixLabel}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
