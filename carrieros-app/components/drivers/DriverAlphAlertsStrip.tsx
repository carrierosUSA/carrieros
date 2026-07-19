"use client";

import { useRouter } from "next/navigation";
import type { DriverAlphAlert } from "@/lib/drivers/driver-alph-alerts";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import {
  buildSmsUrl,
  buildTelUrl,
  openCommunicationUrl,
} from "@/lib/dispatch/communication";
import type { Driver } from "@/lib/types";

type DriverAlphAlertsStripProps = {
  alerts: DriverAlphAlert[];
  driver: Driver;
};

function severityStyles(severity: DriverAlphAlert["severity"]) {
  switch (severity) {
    case "critical":
      return CARRIEROS_COLORS.critical;
    case "warning":
      return CARRIEROS_COLORS.warning;
    default:
      return CARRIEROS_COLORS.info;
  }
}

export default function DriverAlphAlertsStrip({
  alerts,
  driver,
}: DriverAlphAlertsStripProps) {
  const router = useRouter();

  if (alerts.length === 0) {
    return null;
  }

  function handleFix(alert: DriverAlphAlert) {
    switch (alert.fixAction) {
      case "assignLoad":
        router.push("/loads");
        break;
      case "callDriver": {
        const url = buildTelUrl(driver.phone);
        if (url) {
          openCommunicationUrl(url);
        }
        break;
      }
      case "messageDriver": {
        const url = buildSmsUrl(driver.phone);
        if (url) {
          openCommunicationUrl(url);
        }
        break;
      }
      case "uploadDocument":
      case "viewDocuments":
        router.push(`/drivers/${driver.id}?tab=documents`);
        break;
      case "viewTimeline":
        router.push(`/drivers/${driver.id}?tab=timeline`);
        break;
      default:
        break;
    }
  }

  return (
    <section
      aria-label="Alph driver alerts"
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
            Smart alerts to keep this driver moving.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {alerts.map((alert) => {
          const tone = severityStyles(alert.severity);

          return (
            <div
              key={alert.id}
              className="flex flex-wrap items-center gap-3 rounded-[12px] bg-white px-3 py-3 ring-1 ring-[#E5E7EB] sm:flex-nowrap"
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
