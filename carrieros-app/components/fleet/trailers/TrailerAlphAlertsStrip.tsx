"use client";

import { useRouter } from "next/navigation";
import type { TrailerAlphAlert } from "@/lib/fleet/trailer-alph-alerts";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import type { Trailer } from "@/lib/types";

type TrailerAlphAlertsStripProps = {
  alerts: TrailerAlphAlert[];
  trailer: Trailer;
};

function severityStyles(severity: TrailerAlphAlert["severity"]) {
  switch (severity) {
    case "critical":
      return CARRIEROS_COLORS.critical;
    case "warning":
      return CARRIEROS_COLORS.warning;
    default:
      return CARRIEROS_COLORS.info;
  }
}

export default function TrailerAlphAlertsStrip({
  alerts,
  trailer,
}: TrailerAlphAlertsStripProps) {
  const router = useRouter();

  if (alerts.length === 0) {
    return null;
  }

  function handleFix(alert: TrailerAlphAlert) {
    switch (alert.fixAction) {
      case "scheduleService":
      case "viewMaintenance":
      case "reportDamage":
        router.push(`/fleet/trailers/${trailer.id}?tab=maintenance`);
        break;
      case "viewTires":
        router.push(`/fleet/trailers/${trailer.id}?tab=tires`);
        break;
      case "viewReefer":
        router.push(`/fleet/trailers/${trailer.id}?tab=reefer`);
        break;
      case "viewDocuments":
        router.push(`/fleet/trailers/${trailer.id}?tab=documents`);
        break;
      case "assignTrailer":
        router.push("/loads");
        break;
      default:
        break;
    }
  }

  return (
    <section
      aria-label="Alph trailer alerts"
      className={`rounded-[14px] p-4 ring-1 ${CARRIEROS_COLORS.warning.bg} ${CARRIEROS_COLORS.warning.border}`}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[15px]" aria-hidden>
          ✦
        </span>
        <div>
          <p className={`text-[14px] font-bold ${CARRIEROS_COLORS.warning.text}`}>
            Alph found {alerts.length} insight{alerts.length === 1 ? "" : "s"}
          </p>
          <p className="text-[13px] font-medium text-slate-600">
            Maintenance, tires, reefer, and risk signals for this trailer.
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
                className={`inline-flex h-2 w-2 shrink-0 rounded-full ${tone.bg}`}
                aria-hidden
              />
              <p className="min-w-0 flex-1 text-[14px] font-semibold text-slate-900">
                {alert.message}
              </p>
              <button
                type="button"
                onClick={() => handleFix(alert)}
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
