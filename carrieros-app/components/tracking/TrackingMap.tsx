import type { PublicTrackingView } from "@/lib/types";

type TrackingMapProps = {
  tracking: PublicTrackingView;
};

export default function TrackingMap({ tracking }: TrackingMapProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-400">Live Location</p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-100">
            {tracking.location
              ? `${tracking.location.latitude.toFixed(4)}, ${tracking.location.longitude.toFixed(4)}`
              : "Location pending"}
          </h2>
        </div>
        <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-300">
          {tracking.location?.speedMph ?? 0} mph
        </span>
      </div>

      <div className="mt-5 h-64 rounded-2xl border border-zinc-800 bg-[radial-gradient(circle_at_20%_30%,rgba(37,99,235,0.32),transparent_24%),radial-gradient(circle_at_70%_55%,rgba(59,130,246,0.24),transparent_18%),linear-gradient(135deg,#09090b,#18181b)] p-5">
        <div className="relative h-full">
          <div className="absolute left-[12%] top-[18%] h-3 w-3 rounded-full bg-zinc-500" />
          <div className="absolute right-[14%] bottom-[22%] h-3 w-3 rounded-full bg-green-400" />
          <div className="absolute left-[48%] top-[45%] flex h-10 w-10 items-center justify-center rounded-full border border-blue-400 bg-blue-600 text-xs font-bold text-white shadow-lg shadow-blue-950">
            TRK
          </div>
          <div className="absolute bottom-4 left-4 rounded-xl bg-zinc-950/80 px-3 py-2 text-xs text-zinc-300">
            Mock map. Provider-ready for Samsara, Motive, Geotab, ELD, mobile GPS.
          </div>
        </div>
      </div>
    </section>
  );
}
