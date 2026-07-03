import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import TrackingETA from "@/components/tracking/TrackingETA";
import TrackingExpiredView from "@/components/tracking/TrackingExpiredView";
import TrackingMap from "@/components/tracking/TrackingMap";
import TrackingShareDialog from "@/components/tracking/TrackingShareDialog";
import TrackingStatusCard from "@/components/tracking/TrackingStatusCard";
import TrackingTemperatureCard from "@/components/tracking/TrackingTemperatureCard";
import TrackingTimeline from "@/components/tracking/TrackingTimeline";
import { disableTrackingAction } from "@/app/tracking/actions";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getTrackingService } from "@/lib/services/tracking";
import { formatLoadLane } from "@/lib/services/loads/load-helpers";

export const dynamic = "force-dynamic";

type LoadTrackingPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LoadTrackingPage({ params }: LoadTrackingPageProps) {
  const { id } = await params;
  const tenantId = getActiveTenantId();
  const tracking = await getTrackingService().getTrackingForLoad(tenantId, id);

  if (!tracking) {
    notFound();
  }

  return (
    <>
      <Link
        href={`/loads/${tracking.load.id}`}
        className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
      >
        ← Back to Load
      </Link>

      <PageHeader
        title="Live Tracking"
        subtitle={`${tracking.load.reference} · ${formatLoadLane(tracking.load)}`}
        className="mt-4"
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-5">
          {tracking.status === "expired_delivered" ||
          tracking.status === "disabled" ? (
            <TrackingExpiredView tracking={tracking} />
          ) : (
            <>
              <TrackingStatusCard tracking={tracking} />
              <TrackingMap tracking={tracking} />
            </>
          )}
        </div>

        <div className="space-y-5">
          <TrackingShareDialog token={tracking.token} loadId={tracking.load.id} />
          <TrackingETA tracking={tracking} />
          <TrackingTemperatureCard temperature={tracking.temperature} />
          <TrackingTimeline tracking={tracking} />

          {tracking.status === "live" || tracking.status === "not_ready" ? (
            <form action={disableTrackingAction.bind(null, tracking.load.id)}>
              <button
                type="submit"
                className="w-full rounded-xl border border-red-900 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-950"
              >
                Disable Public Tracking
              </button>
            </form>
          ) : null}

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm font-semibold text-blue-400">Nova Tracking</p>
            <div className="mt-4 space-y-3">
              {tracking.novaEvents.length ? (
                tracking.novaEvents.slice(0, 4).map((event) => (
                  <div
                    key={event.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 p-3"
                  >
                    <p className="text-sm font-medium text-zinc-100">
                      {event.message}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {new Date(event.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-400">
                  Nova is watching broker opens, expiration, stops, and ETA
                  changes.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
