"use client";

import { useRouter } from "next/navigation";
import type { TruckAlphAlert } from "@/lib/fleet/truck-alph-alerts";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import type { Truck } from "@/lib/types";

type TruckAlphAlertsStripProps = {
  alerts: TruckAlphAlert[];
  truck: Truck;
};

function severityStyles(severity: TruckAlphAlert["severity"]) {
  switch (severity) {
    case "critical":
      return CARRIEROS_COLORS.critical;
    case "warning":
      return CARRIEROS_COLORS.warning;
    default:
      return CARRIEROS_COLORS.info;
  }
}

export default function TruckAlphAlertsStrip({
  alerts,
  truck,
}: TruckAlphAlertsStripProps) {
  const router = useRouter();

  if (alerts.length === 0) {
    return null;
  }

  function handleFix(alert: TruckAlphAlert) {
    switch (alert.fixAction) {
      case "scheduleMaintenance":
      case "viewMaintenance":
      case "reportBreakdown":
        router.push(`/fleet/trucks/${truck.id}?tab=maintenance`);
        break;
      case "viewFuel":
        router.push(`/fleet/trucks/${truck.id}?tab=fuel`);
        break;
      case "viewGps":
        router.push(`/fleet/trucks/${truck.id}?tab=gps`);
        break;
      case "assignDriver":
        router.push(`/fleet/trucks/${truck.id}?tab=driver`);
        break;
      case "assignLoad":
        router.push("/loads");
        break;
      default:
        break;
    }
  }

  return (
    <section
      aria-label="Alph truck alerts"
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
            Maintenance, fuel, and risk signals for this unit.
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
