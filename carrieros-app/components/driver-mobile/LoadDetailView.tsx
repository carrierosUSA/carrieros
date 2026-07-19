"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  MessageSquare,
  Navigation,
  Phone,
  Timer,
  XCircle,
} from "lucide-react";
import { useDriverMobile } from "@/components/driver-mobile/DriverMobileProvider";
import RejectReasonModal from "@/components/driver-mobile/RejectReasonModal";
import {
  BottomSheet,
  DmCard,
  DmPrimaryButton,
  DmSecondaryButton,
  StatusChip,
  formatMoney,
  formatStatus,
  statusTone,
} from "@/components/driver-mobile/ui";
import {
  mapsNavigationUrl,
  smsHref,
  telHref,
} from "@/lib/driver-mobile/location-share";
import type { DriverLoadAction, DriverMobileLoad } from "@/lib/driver-mobile/types";

export default function LoadDetailView({ loadId }: { loadId: string }) {
  const { state, acceptLoad, rejectLoad, runLoadAction } = useDriverMobile();
  const load = state.loads.find((l) => l.id === loadId);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [sheet, setSheet] = useState<"pickup" | "delivery" | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  if (!load) {
    return (
      <div className="space-y-4">
        <p className="text-[17px] font-semibold">Load not found</p>
        <Link href="/driver/trips" className="text-[var(--color-info)]">
          Back to trips
        </Link>
      </div>
    );
  }

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const act = (action: DriverLoadAction, label: string) => {
    runLoadAction(load.id, action);
    flash(label);
  };

  const isOffer = load.status === "offered" || load.offered;
  const navTarget =
    ["dispatched", "accepted", "offered"].includes(load.status)
      ? load.originAddress ?? `${load.originCity}, ${load.originState}`
      : load.destAddress ?? `${load.destCity}, ${load.destState}`;

  return (
    <div className="space-y-4 animate-[carrieros-fade-in_0.35s_ease]">
      <Link
        href="/driver/trips"
        className="inline-flex min-h-11 items-center text-[14px] font-medium text-[var(--color-info)]"
      >
        ← Trips
      </Link>

      <DmCard className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] font-medium text-[var(--dm-muted)]">{load.reference}</p>
            <h1 className="mt-1 text-[22px] font-bold tracking-tight leading-tight">
              {load.originCity}, {load.originState}
              <span className="mx-2 text-[var(--dm-muted)]">→</span>
              {load.destCity}, {load.destState}
            </h1>
          </div>
          <StatusChip label={formatStatus(load.status)} tone={statusTone(load.status)} />
        </div>
        <div className="flex flex-wrap gap-2 text-[14px] text-[var(--dm-muted)]">
          <span>{load.miles} mi</span>
          <span>·</span>
          <span>{formatMoney(load.rate)}</span>
          <span>·</span>
          <span>ETA {load.eta}</span>
        </div>
        {load.instructions && (
          <p className="rounded-2xl bg-[var(--dm-elevated)] p-3 text-[14px] leading-relaxed">
            {load.instructions}
          </p>
        )}
        {load.missingDocs.length > 0 && (
          <p className="text-[13px] font-medium text-[var(--color-warning)]">
            Missing: {load.missingDocs.join(", ")}
          </p>
        )}
      </DmCard>

      {isOffer && (
        <div className="grid grid-cols-2 gap-3">
          <DmPrimaryButton
            tone="success"
            onClick={() => {
              acceptLoad(load.id);
              flash("Load accepted");
            }}
          >
            <CheckCircle2 className="h-5 w-5" /> Accept
          </DmPrimaryButton>
          <DmPrimaryButton tone="danger" onClick={() => setRejectOpen(true)}>
            <XCircle className="h-5 w-5" /> Reject
          </DmPrimaryButton>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <DmSecondaryButton onClick={() => setSheet("pickup")}>View pickup</DmSecondaryButton>
        <DmSecondaryButton onClick={() => setSheet("delivery")}>View delivery</DmSecondaryButton>
      </div>

      <DmPrimaryButton
        onClick={() => window.open(mapsNavigationUrl(navTarget), "_blank")}
      >
        <Navigation className="h-5 w-5" /> Open navigation
      </DmPrimaryButton>

      <div className="grid grid-cols-2 gap-3">
        <DmSecondaryButton href={telHref(load.brokerPhone)}>
          <Phone className="h-4 w-4" /> Call broker
        </DmSecondaryButton>
        <DmSecondaryButton href={telHref(load.dispatchPhone)}>
          <Phone className="h-4 w-4" /> Call dispatch
        </DmSecondaryButton>
      </div>

      <DmSecondaryButton
        href={smsHref(load.dispatchPhone, `Re: ${load.reference} — `)}
      >
        <MessageSquare className="h-4 w-4" /> Message dispatch
      </DmSecondaryButton>

      {!isOffer && load.status !== "completed" && load.status !== "rejected" && (
        <LoadActionGrid load={load} onAction={act} />
      )}

      {sheet && (
        <BottomSheet
          title={sheet === "pickup" ? "Pickup" : "Delivery"}
          onClose={() => setSheet(null)}
        >
          <StopDetails load={load} kind={sheet} />
        </BottomSheet>
      )}

      {rejectOpen && (
        <RejectReasonModal
          onClose={() => setRejectOpen(false)}
          onConfirm={(reason) => {
            rejectLoad(load.id, reason);
            setRejectOpen(false);
            flash("Load rejected");
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-[calc(96px+env(safe-area-inset-bottom))] left-1/2 z-50 -translate-x-1/2 rounded-full bg-[var(--dm-fg)] px-4 py-2.5 text-[14px] font-semibold text-[var(--dm-bg)] shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function LoadActionGrid({
  load,
  onAction,
}: {
  load: DriverMobileLoad;
  onAction: (action: DriverLoadAction, label: string) => void;
}) {
  const actions: { action: DriverLoadAction; label: string; tone?: "primary" | "success" | "warning" | "muted" }[] = [
    { action: "check_in", label: "Check in", tone: "primary" },
    { action: "check_out", label: "Check out", tone: "muted" },
    { action: "mark_loaded", label: "Mark loaded", tone: "success" },
    { action: "mark_empty", label: "Mark empty", tone: "muted" },
    {
      action: load.detentionActive ? "stop_detention" : "start_detention",
      label: load.detentionActive ? "Stop detention" : "Start detention",
      tone: "warning",
    },
    { action: "complete_delivery", label: "Complete delivery", tone: "success" },
  ];

  return (
    <div className="space-y-2">
      <p className="px-1 text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--dm-muted)]">
        Load actions
      </p>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((a) => (
          <DmPrimaryButton
            key={a.action}
            tone={a.tone}
            onClick={() => onAction(a.action, a.label)}
          >
            {a.action.includes("detention") && <Timer className="h-4 w-4" />}
            {a.label}
          </DmPrimaryButton>
        ))}
      </div>
    </div>
  );
}

function StopDetails({
  load,
  kind,
}: {
  load: DriverMobileLoad;
  kind: "pickup" | "delivery";
}) {
  const city = kind === "pickup" ? load.originCity : load.destCity;
  const state = kind === "pickup" ? load.originState : load.destState;
  const address = kind === "pickup" ? load.originAddress : load.destAddress;
  const when = kind === "pickup" ? load.pickupDate : load.deliveryDate;
  const at = kind === "pickup" ? load.pickupAt : load.deliveryAt;

  return (
    <div className="space-y-3 pb-2">
      <p className="text-[18px] font-semibold">
        {city}, {state}
      </p>
      <p className="text-[14px] text-[var(--dm-muted)]">{address}</p>
      <p className="text-[14px]">
        <span className="font-medium">Date:</span> {when}
        {at ? ` · ${new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : ""}
      </p>
      <DmPrimaryButton
        onClick={() => window.open(mapsNavigationUrl(address ?? `${city}, ${state}`), "_blank")}
      >
        <Navigation className="h-5 w-5" /> Navigate here
      </DmPrimaryButton>
    </div>
  );
}
