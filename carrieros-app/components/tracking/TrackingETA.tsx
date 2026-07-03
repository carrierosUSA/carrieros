import type { PublicTrackingView } from "@/lib/types";

type TrackingETAProps = {
  tracking: PublicTrackingView;
};

export default function TrackingETA({ tracking }: TrackingETAProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-sm font-semibold text-blue-400">ETA</p>
      <p className="mt-2 text-4xl font-bold text-zinc-100">
        {tracking.etaLabel}
      </p>
      <p className="mt-2 text-sm text-zinc-400">
        Delivery countdown: {tracking.deliveryCountdown}
      </p>
    </section>
  );
}
