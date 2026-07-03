import type { PublicTrackingView } from "@/lib/types";

type TrackingTimelineProps = {
  tracking: PublicTrackingView;
};

export default function TrackingTimeline({ tracking }: TrackingTimelineProps) {
  const steps = [
    {
      label: "Pickup",
      value: tracking.pickupCompleted ? "Completed" : "Pending",
      active: tracking.pickupCompleted,
    },
    {
      label: "Current stop",
      value: tracking.currentStop,
      active: tracking.status === "live",
    },
    {
      label: "Delivery",
      value:
        tracking.status === "expired_delivered"
          ? "Delivered"
          : tracking.deliveryCountdown,
      active: tracking.status === "expired_delivered",
    },
  ];

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="font-semibold text-zinc-100">Tracking Timeline</h2>
      <div className="mt-5 space-y-4">
        {steps.map((step, index) => (
          <div key={step.label} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={`h-4 w-4 rounded-full border-2 ${
                  step.active
                    ? "border-blue-400 bg-blue-600"
                    : "border-zinc-700 bg-zinc-950"
                }`}
              />
              {index < steps.length - 1 ? (
                <span className="h-10 w-px bg-zinc-800" />
              ) : null}
            </div>
            <div>
              <p className="font-medium text-zinc-100">{step.label}</p>
              <p className="mt-1 text-sm text-zinc-400">{step.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
