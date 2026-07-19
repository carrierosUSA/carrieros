"use client";

import type { MaintenanceAlphAlert } from "@/lib/fleet/maintenance-alph";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type MaintenanceAlphAlertsStripProps = {
  alerts: MaintenanceAlphAlert[];
  onAction: (alert: MaintenanceAlphAlert) => void;
};

function severityStyles(severity: MaintenanceAlphAlert["severity"]) {
  switch (severity) {
    case "critical":
      return CARRIEROS_COLORS.critical;
    case "warning":
      return CARRIEROS_COLORS.warning;
    default:
      return CARRIEROS_COLORS.info;
  }
}

export default function MaintenanceAlphAlertsStrip({
  alerts,
  onAction,
}: MaintenanceAlphAlertsStripProps) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Alph maintenance predictions"
      className={`rounded-[14px] p-4 ring-1 ${CARRIEROS_COLORS.warning.bg} ${CARRIEROS_COLORS.warning.border}`}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[15px]" aria-hidden>
          ✦
        </span>
        <div>
          <p className={`text-[14px] font-bold ${CARRIEROS_COLORS.warning.text}`}>
            Alph predicts {alerts.length} maintenance risk
            {alerts.length === 1 ? "" : "s"}
          </p>
          <p className="text-[13px] font-medium text-slate-600">
            Failures, PM, tires, parts, and shop assignments — act before downtime.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {alerts.map((alert) => {
          const tone = severityStyles(alert.severity);

          return (
            <div
              key={alert.id}
              className="flex flex-wrap items-center gap-3 rounded-[12px] bg-white px-3 py-3 ring-1 ring-[#EAEAEA] sm:flex-nowrap"
            >
              <span
                className={`inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${
                  alert.severity === "critical"
                    ? "bg-[#DC2626]"
                    : alert.severity === "warning"
                      ? "bg-[#EA580C]"
                      : "bg-[#2563EB]"
                }`}
                aria-hidden
              />
              <p className="min-w-0 flex-1 text-[14px] font-semibold text-slate-900">
                {alert.message}
              </p>
              <span
                className={`hidden text-[11px] font-semibold uppercase tracking-wide sm:inline ${tone.text}`}
              >
                {alert.severity}
              </span>
              <button
                type="button"
                onClick={() => onAction(alert)}
                className="inline-flex h-9 items-center justify-center rounded-full bg-[#2563EB] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
              >
                {alert.fixLabel}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
