import type { PublicTrackingView } from "@/lib/types";

type TrackingExpiredViewProps = {
  tracking: PublicTrackingView;
};

export default function TrackingExpiredView({ tracking }: TrackingExpiredViewProps) {
  const delivered = tracking.status === "expired_delivered";

  return (
    <section className="rounded-2xl border border-green-900/50 bg-green-950/30 p-6">
      <p className="text-sm font-semibold text-green-300">
        {delivered ? "✓ Delivered" : "Tracking unavailable"}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-zinc-100">
        {tracking.load.reference}
      </h1>
      <p className="mt-2 text-sm text-green-200/80">
        {delivered
          ? "Live tracking has expired because the load is delivered."
          : "Tracking has been disabled by the dispatcher."}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm text-zinc-500">Final POD Status</p>
          <p className="mt-2 text-lg font-semibold text-zinc-100">
            {tracking.finalPodStatus}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm text-zinc-500">Invoice Status</p>
          <p className="mt-2 text-lg font-semibold text-zinc-100">
            {tracking.invoiceStatus}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm text-zinc-500">Payment Status</p>
          <p className="mt-2 text-lg font-semibold text-zinc-100">
            {tracking.paymentStatus}
          </p>
        </div>
      </div>
    </section>
  );
}
