"use client";

import { AlertTriangle, CloudRain, Route } from "lucide-react";
import { useDriverApp } from "@/components/driver-app/DriverAppProvider";
import { DmCard, StatusChip } from "@/components/driver-mobile/ui";

export default function SafetyView() {
  const { state } = useDriverApp();

  return (
    <div className="space-y-5 animate-[carrieros-fade-in_0.35s_ease]">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight">Safety</h2>
        <p className="mt-1 text-[14px] text-[var(--dm-muted)]">
          Weather, road, and HOS alerts for your corridor.
        </p>
      </div>

      <DmCard className="space-y-2">
        <p className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--dm-muted)]">
          <CloudRain className="h-4 w-4" /> Now
        </p>
        <p className="text-[20px] font-bold">
          {state.weather.tempF}°F · {state.weather.condition}
        </p>
        <p className="text-[14px] text-[var(--dm-muted)]">
          Wind {state.weather.windMph} mph · {state.weather.label}
        </p>
      </DmCard>

      <DmCard className="space-y-2">
        <p className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--dm-muted)]">
          <Route className="h-4 w-4" /> Traffic
        </p>
        <p className="text-[18px] font-bold">
          +{state.traffic.delayMinutes} min · {state.traffic.label}
        </p>
        <StatusChip
          label={state.traffic.severity}
          tone={state.traffic.severity === "heavy" ? "critical" : "warning"}
        />
      </DmCard>

      <div className="space-y-3">
        {state.safetyAlerts.map((alert) => (
          <DmCard key={alert.id} className="flex gap-3">
            <AlertTriangle
              className={`mt-0.5 h-5 w-5 shrink-0 ${
                alert.severity === "critical"
                  ? "text-[var(--color-critical)]"
                  : alert.severity === "warning"
                    ? "text-[var(--color-warning)]"
                    : "text-[var(--color-info)]"
              }`}
            />
            <div>
              <p className="text-[15px] font-semibold">{alert.title}</p>
              <p className="mt-1 text-[14px] leading-relaxed text-[var(--dm-muted)]">
                {alert.body}
              </p>
            </div>
          </DmCard>
        ))}
      </div>
    </div>
  );
}
