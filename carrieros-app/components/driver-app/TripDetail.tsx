"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Camera,
  CheckCircle2,
  Navigation,
  Phone,
  Timer,
} from "lucide-react";
import AiPolicyNotice from "@/components/ai-safety/AiPolicyNotice";
import { useAiSafety } from "@/components/ai-safety/AiSafetyProvider";
import { useDriverApp } from "@/components/driver-app/DriverAppProvider";
import StatusStrip from "@/components/driver-app/StatusStrip";
import RejectReasonModal from "@/components/driver-mobile/RejectReasonModal";
import PickupNumbersPanel from "@/components/driver-mobile/PickupNumbersPanel";
import {
  DmCard,
  DmPrimaryButton,
  DmSecondaryButton,
  DmSectionLabel,
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

export default function TripDetail({ tripId }: { tripId: string }) {
  const { runAiSuggestedAction } = useAiSafety();
  const {
    state,
    acceptLoad,
    rejectLoad,
    runLoadAction,
    processPod,
  } = useDriverApp();
  const load = state.loads.find((l) => l.id === tripId);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [podResult, setPodResult] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!load) {
    return (
      <div className="space-y-4">
        <p className="text-[17px] font-semibold">Trip not found</p>
        <Link href="/driver/trips" className="text-[var(--color-info)] font-medium">
          Back to trips
        </Link>
      </div>
    );
  }

  const isOffer = load.status === "offered" || load.offered;
  const navTarget =
    ["dispatched", "accepted", "offered", "heading_to_pickup"].includes(load.status) ||
    state.tripStatus === "heading_to_pickup"
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
        <p className="text-[13px] font-semibold text-[var(--dm-muted)]">
          Pickup · {load.originCity}, {load.originState} · {load.pickupDate}
          {load.pickupAt
            ? ` · ${new Date(load.pickupAt).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}`
            : ""}
        </p>
        <PickupNumbersPanel pickupNumbers={load.pickupNumbers} />
        <div className="flex flex-wrap gap-2 text-[14px] text-[var(--dm-muted)]">
          <span>{load.miles} mi</span>
          <span>·</span>
          <span>{formatMoney(load.rate)}</span>
          <span>·</span>
          <span>ETA {load.eta}</span>
        </div>
        {load.commodity && (
          <p className="text-[14px]">
            <span className="text-[var(--dm-muted)]">Commodity · </span>
            {load.commodity}
            {load.weight ? ` · ${load.weight.toLocaleString()} lbs` : ""}
            {load.tempReq ? ` · ${load.tempReq}` : ""}
          </p>
        )}
        {load.sealNumber && (
          <p className="text-[14px]">
            <span className="text-[var(--dm-muted)]">Seal · </span>
            {load.sealNumber}
          </p>
        )}
      </DmCard>

      <StatusStrip compact />

      <DmPrimaryButton
        onClick={() => window.open(mapsNavigationUrl(navTarget), "_blank")}
      >
        <Navigation className="h-5 w-5" /> Navigate
      </DmPrimaryButton>

      {(load.dispatcherNotes || load.brokerNotes) && (
        <>
          <DmSectionLabel>Notes</DmSectionLabel>
          <DmCard className="space-y-3">
            {load.dispatcherNotes && (
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--dm-muted)]">
                  Dispatcher
                </p>
                <p className="mt-1 text-[14px] leading-relaxed">{load.dispatcherNotes}</p>
              </div>
            )}
            {load.brokerNotes && (
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--dm-muted)]">
                  Broker
                </p>
                <p className="mt-1 text-[14px] leading-relaxed">{load.brokerNotes}</p>
              </div>
            )}
          </DmCard>
        </>
      )}

      {load.references && load.references.length > 0 && (
        <>
          <DmSectionLabel>References</DmSectionLabel>
          <DmCard>
            <p className="text-[14px] font-medium">{load.references.join(" · ")}</p>
            {load.trailerUnit && (
              <p className="mt-2 text-[13px] text-[var(--dm-muted)]">
                Trailer {load.trailerUnit} · Truck {state.truckUnit}
              </p>
            )}
          </DmCard>
        </>
      )}

      {load.timeline && (
        <>
          <DmSectionLabel>Timeline</DmSectionLabel>
          <DmCard className="space-y-3">
            {load.timeline.map((t) => (
              <div key={t.id} className="flex items-center gap-3">
                <CheckCircle2
                  className={`h-5 w-5 ${t.done ? "text-[var(--color-success)]" : "text-[var(--dm-border)]"}`}
                />
                <span className={`text-[15px] ${t.done ? "font-semibold" : "text-[var(--dm-muted)]"}`}>
                  {t.label}
                </span>
              </div>
            ))}
          </DmCard>
        </>
      )}

      {isOffer ? (
        <div className="grid grid-cols-2 gap-3">
          <DmPrimaryButton tone="success" onClick={() => acceptLoad(load.id)}>
            Accept
          </DmPrimaryButton>
          <DmSecondaryButton onClick={() => setRejectOpen(true)}>Decline</DmSecondaryButton>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <DmSecondaryButton onClick={() => runLoadAction(load.id, "check_in")}>
            Arrived
          </DmSecondaryButton>
          <DmSecondaryButton onClick={() => runLoadAction(load.id, "mark_loaded")}>
            Loaded
          </DmSecondaryButton>
          <DmSecondaryButton onClick={() => runLoadAction(load.id, "start_detention")}>
            <Timer className="h-4 w-4" /> Detention
          </DmSecondaryButton>
          <DmPrimaryButton
            tone="success"
            onClick={() => {
              void runAiSuggestedAction({
                kind: "mark_delivered",
                suggestion: `Mark ${load.reference} delivered`,
                confidence: "review_recommended",
                reason:
                  "Marking delivered updates the load record and can start invoicing.",
                dataUsed: ["Trip status", load.reference],
                source: "driver-app",
                previousValue: load.status,
                newValue: "completed",
                onConfirm: () => runLoadAction(load.id, "complete_delivery"),
              });
            }}
          >
            Delivered
          </DmPrimaryButton>
        </div>
      )}

      <DmSectionLabel>POD AI</DmSectionLabel>
      <DmCard className="space-y-3">
        <p className="text-[14px] text-[var(--dm-muted)]">
          Capture proof of delivery — AI extracts signature, time, receiver, seal, and marks
          invoice-ready. You still confirm before the load is marked delivered.
        </p>
        <AiPolicyNotice variant="compact" />
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            void runAiSuggestedAction({
              kind: "mark_delivered",
              suggestion: `Process POD and mark ${load.reference} delivered`,
              confidence: "review_recommended",
              reason:
                "POD AI can extract delivery details. Confirm before the trip is marked delivered.",
              dataUsed: ["POD image", file.name, load.reference],
              source: "driver-app-pod-ai",
              onConfirm: () => {
                const doc = processPod({ fileName: file.name, loadId: load.id });
                setPodResult(
                  doc.podAi?.summary ?? doc.aiSummary ?? "POD processed",
                );
              },
            });
          }}
        />
        <DmPrimaryButton onClick={() => fileRef.current?.click()}>
          <Camera className="h-5 w-5" /> Upload / Capture POD
        </DmPrimaryButton>
        {podResult && (
          <p className="rounded-2xl bg-green-500/12 px-3 py-3 text-[14px] leading-relaxed text-[var(--color-success)]">
            {podResult}
          </p>
        )}
      </DmCard>

      <div className="grid grid-cols-2 gap-3 pb-2">
        <a
          href={telHref(load.dispatchPhone)}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--dm-elevated)] text-[15px] font-semibold"
        >
          <Phone className="h-4 w-4" /> Dispatch
        </a>
        <a
          href={smsHref(load.brokerPhone, `Re: ${load.reference}`)}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--dm-elevated)] text-[15px] font-semibold"
        >
          Broker SMS
        </a>
      </div>

      {rejectOpen && (
        <RejectReasonModal
          onClose={() => setRejectOpen(false)}
          onConfirm={(reason) => {
            rejectLoad(load.id, reason);
            setRejectOpen(false);
          }}
        />
      )}
    </div>
  );
}
