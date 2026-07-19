"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Cloud,
  Droplets,
  Fuel,
  Gauge,
  MessageCircle,
  Navigation,
  Phone,
  ShieldAlert,
  Timer,
} from "lucide-react";
import { useDriverApp } from "@/components/driver-app/DriverAppProvider";
import StatusStrip from "@/components/driver-app/StatusStrip";
import LiveTrackingCard from "@/components/driver-mobile/LiveTrackingCard";
import {
  DmCard,
  DmPrimaryButton,
  DmSectionLabel,
  StatusChip,
  formatStatus,
  statusTone,
} from "@/components/driver-mobile/ui";
import { mapsNavigationUrl, telHref } from "@/lib/driver-mobile/location-share";
import { TRIP_STATUS_LABELS } from "@/lib/driver-app/constants";

export default function HomeView() {
  const { state } = useDriverApp();
  const load = state.loads.find((l) => l.id === state.todaysLoadId) ?? state.loads[0];
  const unreadMsgs = state.threads.reduce((n, t) => n + t.unread, 0);
  const criticalAlert = state.safetyAlerts.find((a) => a.severity !== "info");

  return (
    <div className="space-y-5 animate-[carrieros-fade-in_0.35s_ease]">
      <StatusStrip />

      {load && (
        <>
          <DmSectionLabel>Today&apos;s load</DmSectionLabel>
          <DmCard className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[13px] font-medium text-[var(--dm-muted)]">
                  {load.reference}
                </p>
                <p className="mt-1 text-[20px] font-bold tracking-tight leading-tight">
                  {load.originCity}, {load.originState}
                  <span className="mx-2 font-medium text-[var(--dm-muted)]">→</span>
                  {load.destCity}, {load.destState}
                </p>
              </div>
              <StatusChip label={formatStatus(load.status)} tone={statusTone(load.status)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Metric
                icon={<Navigation className="h-3.5 w-3.5" />}
                label="Next stop"
                value={load.nextStopLabel}
              />
              <Metric
                icon={<Timer className="h-3.5 w-3.5" />}
                label="ETA"
                value={load.eta}
              />
              <Metric label="Remaining" value={`${load.remainingMiles ?? state.remainingMiles} mi`} />
              <Metric label="Appointment" value={load.appointmentWindow ?? state.appointmentWindow} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DmPrimaryButton
                onClick={() =>
                  window.open(
                    mapsNavigationUrl(
                      load.destAddress ?? `${load.destCity}, ${load.destState}`,
                    ),
                    "_blank",
                  )
                }
              >
                <Navigation className="h-5 w-5" /> Navigate
              </DmPrimaryButton>
              <Link
                href={`/driver/trips/${load.id}`}
                className="flex min-h-12 items-center justify-center rounded-2xl bg-[var(--dm-elevated)] text-[15px] font-semibold"
              >
                Open trip
              </Link>
            </div>
          </DmCard>
        </>
      )}

      <div className="grid grid-cols-2 gap-3">
        <DmCard>
          <p className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--dm-muted)]">
            <Fuel className="h-3.5 w-3.5" /> Fuel
          </p>
          <p className="mt-2 text-[24px] font-bold tracking-tight">{state.fuelLevelPct}%</p>
          <p className="mt-1 text-[12px] text-[var(--dm-muted)]">{state.mpgAverage} mpg avg</p>
        </DmCard>
        <DmCard>
          <p className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--dm-muted)]">
            <Gauge className="h-3.5 w-3.5" /> Hours left
          </p>
          <p className="mt-2 text-[24px] font-bold tracking-tight">
            {state.hos.driveRemainingHours.toFixed(1)}h
          </p>
          <p className="mt-1 text-[12px] text-[var(--dm-muted)]">
            {state.hos.nextBreakDue}
          </p>
        </DmCard>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DmCard>
          <p className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--dm-muted)]">
            <Cloud className="h-3.5 w-3.5" /> Weather
          </p>
          <p className="mt-2 text-[18px] font-bold">{state.weather.tempF}°F</p>
          <p className="text-[13px] text-[var(--dm-muted)]">{state.weather.condition}</p>
        </DmCard>
        <DmCard>
          <p className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--dm-muted)]">
            <Droplets className="h-3.5 w-3.5" /> Traffic
          </p>
          <p className="mt-2 text-[18px] font-bold">+{state.traffic.delayMinutes}m</p>
          <p className="text-[13px] text-[var(--dm-muted)]">{state.traffic.label}</p>
        </DmCard>
      </div>

      <LiveTrackingCard />

      <DmSectionLabel>Status</DmSectionLabel>
      <DmCard>
        <p className="text-[13px] font-medium text-[var(--dm-muted)]">Current</p>
        <p className="mt-1 text-[20px] font-bold tracking-tight">
          {TRIP_STATUS_LABELS[state.tripStatus]}
        </p>
        <p className="mt-1 text-[14px] text-[var(--dm-muted)]">{state.truckUnit}</p>
      </DmCard>

      {criticalAlert && (
        <Link
          href="/driver/safety"
          className="flex items-start gap-3 rounded-[18px] bg-orange-500/12 px-4 py-3.5"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-warning)]" />
          <span>
            <span className="block text-[15px] font-semibold">{criticalAlert.title}</span>
            <span className="mt-0.5 block text-[13px] text-[var(--dm-muted)]">
              {criticalAlert.body}
            </span>
          </span>
        </Link>
      )}

      <DmSectionLabel>Messages</DmSectionLabel>
      <Link
        href="/driver/messages"
        className="flex min-h-14 items-center justify-between rounded-[18px] bg-[var(--dm-surface)] px-4"
      >
        <span className="inline-flex items-center gap-2 text-[15px] font-semibold">
          <MessageCircle className="h-5 w-5 text-[var(--color-info)]" />
          {unreadMsgs > 0 ? `${unreadMsgs} unread` : "All caught up"}
        </span>
        <span className="text-[14px] font-semibold text-[var(--color-info)]">Open</span>
      </Link>

      <DmSectionLabel>Needs attention</DmSectionLabel>
      <div className="space-y-2">
        {state.tasks.map((task) => (
          <Link
            key={task.id}
            href={task.href ?? "/driver"}
            className="flex items-center gap-3 rounded-[18px] bg-[var(--dm-surface)] px-4 py-3.5"
          >
            <span
              className={`grid h-10 w-10 place-items-center rounded-xl ${
                task.urgency === "critical"
                  ? "bg-red-500/15 text-[var(--color-critical)]"
                  : task.urgency === "warning"
                    ? "bg-orange-500/15 text-[var(--color-warning)]"
                    : "bg-blue-500/15 text-[var(--color-info)]"
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold">{task.title}</span>
              <span className="block truncate text-[13px] text-[var(--dm-muted)]">
                {task.detail}
              </span>
            </span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 pb-2">
        <Link
          href="/driver/emergency"
          className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-red-500/15 text-[15px] font-bold text-[var(--color-critical)]"
        >
          <ShieldAlert className="h-5 w-5" /> Emergency
        </Link>
        <a
          href={telHref(load?.dispatchPhone ?? "210-555-0100")}
          className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[var(--dm-elevated)] text-[15px] font-semibold"
        >
          <Phone className="h-5 w-5" /> Dispatch
        </a>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-[var(--dm-elevated)] p-3">
      <p className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--dm-muted)]">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-[14px] font-semibold leading-snug">{value}</p>
    </div>
  );
}
