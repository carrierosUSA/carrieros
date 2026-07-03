import Badge from "@/components/Badge";
import type { PublicTrackingView } from "@/lib/types";

type TrackingStatusCardProps = {
  tracking: PublicTrackingView;
};

export default function TrackingStatusCard({ tracking }: TrackingStatusCardProps) {
  const badgeType =
    tracking.status === "live"
      ? "success"
      : tracking.status === "not_ready"
        ? "warning"
        : "default";

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-400">Load Status</p>
          <h1 className="mt-2 text-3xl font-bold text-zinc-100">
            {tracking.load.reference}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">{tracking.currentStop}</p>
        </div>
        <Badge text={tracking.status.replace("_", " ")} type={badgeType} />
      </div>

      <div className="mt-6 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
        <p>
          <strong className="text-zinc-100">Pickup completed:</strong>{" "}
          {tracking.pickupCompleted ? "Yes" : "Not yet"}
        </p>
        <p>
          <strong className="text-zinc-100">Driver:</strong>{" "}
          {tracking.driverFirstName ?? "Pending"}
        </p>
        <p>
          <strong className="text-zinc-100">Trailer:</strong>{" "}
          {tracking.trailerNumber ?? "Pending"}
        </p>
        <p>
          <strong className="text-zinc-100">Last updated:</strong>{" "}
          {new Date(tracking.lastUpdatedAt).toLocaleString()}
        </p>
      </div>
    </section>
  );
}
