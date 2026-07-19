import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import type { ReeferTelemetrySnapshot } from "@/lib/fleet/reefer-provider";

type TrailerReeferTabProps = {
  telemetry: ReeferTelemetrySnapshot | null;
};

function MetricCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: { bg: string; text: string; border: string };
}) {
  return (
    <div
      className={`rounded-[14px] px-4 py-3 ring-1 ${
        tone
          ? `${tone.bg} ${tone.border}`
          : "bg-[#F8FAFC] ring-[#EAEAEA]"
      }`}
    >
      <p className="text-[12px] font-medium text-slate-500">{label}</p>
      <p
        className={`mt-1 text-[22px] font-bold tabular-nums ${
          tone ? tone.text : "text-slate-950"
        }`}
      >
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-[12px] text-slate-500">{hint}</p> : null}
    </div>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TrailerReeferTab({ telemetry }: TrailerReeferTabProps) {
  if (!telemetry) {
    return (
      <section className="rounded-[16px] bg-white p-8 text-center ring-1 ring-[#EAEAEA]">
        <p className="text-[15px] font-semibold text-slate-900">No reefer telemetry</p>
        <p className="mt-1 text-[14px] text-slate-500">
          Connect Thermo King, Carrier, or a telematics temp feed to see live data.
        </p>
      </section>
    );
  }

  const tempDelta = Math.abs(telemetry.currentTempF - telemetry.setTempF);
  const tempTone =
    tempDelta >= 6
      ? CARRIEROS_COLORS.critical
      : tempDelta >= 3
        ? CARRIEROS_COLORS.warning
        : CARRIEROS_COLORS.success;
  const fuelTone =
    telemetry.fuelLevelPercent < 10
      ? CARRIEROS_COLORS.critical
      : telemetry.fuelLevelPercent < 20
        ? CARRIEROS_COLORS.warning
        : undefined;

  return (
    <div className="space-y-4">
      <section className="rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[15px] font-semibold text-slate-950">Live temperatures</h2>
          <p className="text-[12px] font-medium text-slate-500">
            {(telemetry.provider ?? "mock").replaceAll("_", " ")}
            {telemetry.connected ? " · Connected" : " · Offline"}
          </p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Current"
            value={`${telemetry.currentTempF.toFixed(1)}°F`}
            tone={tempTone}
          />
          <MetricCard
            label="Set point"
            value={`${telemetry.setTempF.toFixed(1)}°F`}
          />
          <MetricCard
            label="Return"
            value={`${telemetry.returnTempF.toFixed(1)}°F`}
          />
          <MetricCard
            label="Defrost"
            value={telemetry.defrostStatus}
            hint={telemetry.defrostStatus === "active" ? "Cycle running" : "Idle"}
          />
        </div>
      </section>

      <section className="rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA]">
        <h2 className="text-[15px] font-semibold text-slate-950">Unit health</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <MetricCard
            label="Fuel level"
            value={`${telemetry.fuelLevelPercent}%`}
            tone={fuelTone}
          />
          <MetricCard
            label="Engine hours"
            value={telemetry.engineHours.toLocaleString()}
            hint="Reefer unit hours"
          />
        </div>
      </section>

      <section className="rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA]">
        <h2 className="text-[15px] font-semibold text-slate-950">Alarm history</h2>
        {telemetry.alarms.length === 0 ? (
          <p className="mt-3 text-[14px] text-slate-500">No active or recent alarms.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {telemetry.alarms.map((alarm) => {
              const tone =
                alarm.severity === "critical"
                  ? CARRIEROS_COLORS.critical
                  : alarm.severity === "warning"
                    ? CARRIEROS_COLORS.warning
                    : CARRIEROS_COLORS.info;
              return (
                <li
                  key={alarm.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-[12px] bg-[#F8FAFC] px-3 py-3 ring-1 ring-[#EAEAEA]"
                >
                  <div>
                    <p className="text-[14px] font-semibold text-slate-900">
                      {alarm.message}
                    </p>
                    <p className="mt-0.5 text-[12px] text-slate-500">
                      {alarm.code} · {formatTime(alarm.occurredAt)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${tone.bg} ${tone.text} ${tone.border}`}
                  >
                    {alarm.severity}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA]">
        <h2 className="text-[15px] font-semibold text-slate-950">Door open events</h2>
        <ul className="mt-4 space-y-2">
          {telemetry.doorEvents.map((event) => (
            <li
              key={event.id}
              className="rounded-[12px] bg-[#F8FAFC] px-3 py-3 ring-1 ring-[#EAEAEA]"
            >
              <p className="text-[14px] font-semibold text-slate-900">
                Opened {formatTime(event.openedAt)}
              </p>
              <p className="mt-0.5 text-[12px] text-slate-500">
                {event.closedAt
                  ? `Closed ${formatTime(event.closedAt)}`
                  : "Still open"}
                {event.durationMinutes != null
                  ? ` · ${event.durationMinutes} min`
                  : ""}
                {event.location ? ` · ${event.location}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
