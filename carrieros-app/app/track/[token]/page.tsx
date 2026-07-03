import { notFound } from "next/navigation";
import TrackingAutoRefresh from "@/components/tracking/TrackingAutoRefresh";
import TrackingETA from "@/components/tracking/TrackingETA";
import TrackingExpiredView from "@/components/tracking/TrackingExpiredView";
import TrackingMap from "@/components/tracking/TrackingMap";
import TrackingStatusCard from "@/components/tracking/TrackingStatusCard";
import TrackingTemperatureCard from "@/components/tracking/TrackingTemperatureCard";
import TrackingTimeline from "@/components/tracking/TrackingTimeline";
import { getTrackingService } from "@/lib/services/tracking";
import { formatLoadLane } from "@/lib/services/loads/load-helpers";

export const dynamic = "force-dynamic";

type PublicTrackingPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function PublicTrackingPage({
  params,
}: PublicTrackingPageProps) {
  const { token } = await params;
  const tracking = await getTrackingService().getPublicTrackingByToken(token);

  if (!tracking) {
    notFound();
  }

  const initials = tracking.companyName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <TrackingAutoRefresh />

      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-700 bg-blue-950 text-sm font-bold text-blue-200">
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-400">
                {tracking.companyName}
              </p>
              <h1 className="text-xl font-bold text-zinc-100">
                Public Load Tracking
              </h1>
            </div>
          </div>
          <p className="text-sm text-zinc-500">
            {formatLoadLane(tracking.load)}
          </p>
        </header>

        <div className="mt-8">
          {tracking.status === "expired_delivered" ||
          tracking.status === "disabled" ? (
            <TrackingExpiredView tracking={tracking} />
          ) : (
            <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
              <div className="space-y-5">
                <TrackingStatusCard tracking={tracking} />
                <TrackingMap tracking={tracking} />
              </div>
              <div className="space-y-5">
                <TrackingETA tracking={tracking} />
                <TrackingTemperatureCard temperature={tracking.temperature} />
                <TrackingTimeline tracking={tracking} />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
