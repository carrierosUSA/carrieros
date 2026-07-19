"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ChevronRight,
  Clock,
  DollarSign,
  MapPin,
  MessageCircle,
  Navigation,
} from "lucide-react";
import { useDriverMobile } from "@/components/driver-mobile/DriverMobileProvider";
import LiveTrackingCard from "@/components/driver-mobile/LiveTrackingCard";
import {
  DmCard,
  DmPrimaryButton,
  DmSectionLabel,
  StatusChip,
  formatMoney,
  formatStatus,
  statusTone,
} from "@/components/driver-mobile/ui";
import { mapsNavigationUrl } from "@/lib/driver-mobile/location-share";

export default function HomeDashboard() {
  const { state } = useDriverMobile();
  const load = state.loads.find((l) => l.id === state.todaysLoadId) ?? state.loads[0];
  const unreadMsgs = state.threads.reduce((n, t) => n + t.unread, 0);

  return (
    <div className="space-y-5 animate-[carrieros-fade-in_0.35s_ease]">
      <DmCard>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] font-medium text-[var(--dm-muted)]">Current status</p>
            <p className="mt-1 text-[22px] font-bold tracking-tight">{state.currentStatus}</p>
            <p className="mt-1 text-[14px] text-[var(--dm-muted)]">{state.truckUnit}</p>
          </div>
          <StatusChip
            label={state.hos.status === "available" ? "HOS OK" : "HOS low"}
            tone={
              state.hos.status === "critical"
                ? "critical"
                : state.hos.status === "warning"
                  ? "warning"
                  : "success"
            }
          />
        </div>
      </DmCard>

      {load && (
        <>
          <DmSectionLabel>Today&apos;s load</DmSectionLabel>
          <DmCard className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[15px] font-semibold">{load.reference}</p>
                <p className="mt-1 text-[20px] font-bold tracking-tight">
                  {load.originCity}, {load.originState}
                  <span className="mx-2 font-medium text-[var(--dm-muted)]">→</span>
                  {load.destCity}, {load.destState}
                </p>
              </div>
              <StatusChip label={formatStatus(load.status)} tone={statusTone(load.status)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[var(--dm-elevated)] p-3">
                <p className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--dm-muted)]">
                  <MapPin className="h-3.5 w-3.5" /> Next stop
                </p>
                <p className="mt-1 text-[14px] font-semibold">{load.nextStopLabel}</p>
              </div>
              <div className="rounded-2xl bg-[var(--dm-elevated)] p-3">
                <p className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--dm-muted)]">
                  <Clock className="h-3.5 w-3.5" /> ETA
                </p>
                <p className="mt-1 text-[14px] font-semibold">{load.eta}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DmPrimaryButton
                tone="primary"
                onClick={() => {
                  window.open(mapsNavigationUrl(load.destAddress ?? `${load.destCity}, ${load.destState}`), "_blank");
                }}
              >
                <Navigation className="h-5 w-5" /> Navigate
              </DmPrimaryButton>
              <Link
                href={`/driver/trips/${load.id}`}
                className="flex min-h-12 items-center justify-center rounded-2xl bg-[var(--dm-elevated)] text-[15px] font-semibold"
              >
                Open load
              </Link>
            </div>
          </DmCard>
        </>
      )}

      <LiveTrackingCard />

      <div className="grid grid-cols-2 gap-3">
        <DmCard>
          <p className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--dm-muted)]">
            <DollarSign className="h-3.5 w-3.5" /> This week
          </p>
          <p className="mt-2 text-[24px] font-bold tracking-tight">
            {formatMoney(state.weekEarnings)}
          </p>
        </DmCard>
        <DmCard>
          <p className="text-[12px] font-medium text-[var(--dm-muted)]">Drive left</p>
          <p className="mt-2 text-[24px] font-bold tracking-tight">
            {state.hos.driveRemainingHours.toFixed(1)}h
          </p>
          <p className="mt-1 text-[12px] text-[var(--dm-muted)]">
            Break {state.hos.nextBreakDue?.toLowerCase()}
          </p>
        </DmCard>
      </div>

      <DmSectionLabel>Tasks</DmSectionLabel>
      <div className="space-y-2">
        {state.tasks.map((task) => (
          <Link
            key={task.id}
            href={task.href?.startsWith("?") ? `/driver${task.href}` : task.href ?? "#"}
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
            <ChevronRight className="h-5 w-5 text-[var(--dm-muted)]" />
          </Link>
        ))}
      </div>

      <DmSectionLabel>Messages & alerts</DmSectionLabel>
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/driver/messages"
          className="rounded-[18px] bg-[var(--dm-surface)] p-4"
        >
          <MessageCircle className="h-5 w-5 text-[var(--color-info)]" />
          <p className="mt-2 text-[15px] font-semibold">Messages</p>
          <p className="text-[13px] text-[var(--dm-muted)]">
            {unreadMsgs ? `${unreadMsgs} unread` : "All caught up"}
          </p>
        </Link>
        <div className="rounded-[18px] bg-[var(--dm-surface)] p-4">
          <AlertTriangle className="h-5 w-5 text-[var(--color-warning)]" />
          <p className="mt-2 text-[15px] font-semibold">Alerts</p>
          <p className="text-[13px] text-[var(--dm-muted)]">
            {state.alerts.filter((a) => !a.read).length} new
          </p>
        </div>
      </div>
    </div>
  );
}
