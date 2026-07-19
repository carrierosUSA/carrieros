"use client";

import { useState } from "react";
import LiveTrackingPanel, {
  type LiveTrackingPanelInput,
} from "@/components/tracking/map/LiveTrackingPanel";
import type { TrackingDriverDetails, TrackingStopDetails } from "@/lib/tracking/map-types";
import type { DriverLocation } from "@/lib/types";

type FullScreenTrackingExperienceProps = LiveTrackingPanelInput & {
  pickupDetails: TrackingStopDetails;
  deliveryDetails: TrackingStopDetails;
  driver?: TrackingDriverDetails;
  driverLocation?: DriverLocation | null;
  loadStatus?: string;
};

export default function FullScreenTrackingExperience({
  pickupDetails,
  deliveryDetails,
  driver,
  loadStatus,
  ...panelInput
}: FullScreenTrackingExperienceProps) {
  const [routeHistoryOpen, setRouteHistoryOpen] = useState(false);

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]">
        <LiveTrackingPanel
          {...panelInput}
          loadStatus={loadStatus}
          pickupDetails={pickupDetails}
          deliveryDetails={deliveryDetails}
          driver={driver}
          variant="fullscreen"
          routeHistoryOpen={routeHistoryOpen}
          onOpenRouteHistory={() => setRouteHistoryOpen(true)}
          onCloseRouteHistory={() => setRouteHistoryOpen(false)}
        />

        <aside className="space-y-4">
          <section className="rounded-[16px] border border-[#EAEAEA] bg-white p-5 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
              Driver
            </p>
            <h2 className="mt-1 text-[18px] font-bold text-slate-950">
              {driver?.name ?? "Unassigned"}
            </h2>
            {driver?.phone ? (
              <p className="mt-1 text-[14px] text-slate-600">{driver.phone}</p>
            ) : null}
            {driver?.truckLabel || driver?.trailerLabel ? (
              <p className="mt-2 text-[13px] font-medium text-slate-700">
                {driver?.truckLabel}
                {driver?.trailerLabel ? ` · ${driver.trailerLabel}` : ""}
              </p>
            ) : null}
          </section>

          <section className="rounded-[16px] border border-[#EAEAEA] bg-white p-5 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
              Live Stats
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Stat label="Speed" value={`${panelInput.driverLocation?.speedMph ?? 62} mph`} />
              <Stat label="ETA" value={panelInput.eta} accent />
              <Stat
                label="Miles Left"
                value={`${panelInput.milesRemaining ?? 0} mi`}
              />
              <Stat
                label="Updated"
                value={panelInput.lastUpdatedLabel?.replace("Updated ", "") ?? "—"}
              />
            </div>
          </section>

          <section className="rounded-[16px] border border-[#EAEAEA] bg-white p-5 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
              Pickup
            </p>
            <h3 className="mt-1 text-[16px] font-semibold text-slate-950">
              {pickupDetails.company ?? `${pickupDetails.city}, ${pickupDetails.state}`}
            </h3>
            {pickupDetails.address ? (
              <p className="mt-1 text-[13px] text-slate-600">{pickupDetails.address}</p>
            ) : null}
            {pickupDetails.appointment ? (
              <p className="mt-2 text-[13px] font-medium text-[#2563EB]">
                {pickupDetails.appointment}
              </p>
            ) : null}
          </section>

          <section className="rounded-[16px] border border-[#EAEAEA] bg-white p-5 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
              Delivery
            </p>
            <h3 className="mt-1 text-[16px] font-semibold text-slate-950">
              {deliveryDetails.company ??
                `${deliveryDetails.city}, ${deliveryDetails.state}`}
            </h3>
            {deliveryDetails.address ? (
              <p className="mt-1 text-[13px] text-slate-600">{deliveryDetails.address}</p>
            ) : null}
            {deliveryDetails.appointment ? (
              <p className="mt-2 text-[13px] font-medium text-[#16A34A]">
                {deliveryDetails.appointment}
              </p>
            ) : null}
          </section>

          <section className="rounded-[16px] border border-[#EAEAEA] bg-[#F8FAFC] p-5">
            <p className="text-[13px] font-medium text-slate-700">
              Multi-stop loads supported
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
              Map architecture is ready for Google Maps or Mapbox, with future
              multi-stop routing without redesigning this UI.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
      <p
        className={`mt-0.5 text-[14px] font-semibold ${
          accent ? "text-[#16A34A]" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
