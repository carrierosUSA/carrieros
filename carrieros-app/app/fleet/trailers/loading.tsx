import FleetSubNav from "@/components/fleet/FleetSubNav";
import TrailerDashboardSkeleton from "@/components/fleet/trailers/TrailerDashboardSkeleton";

export default function TrailersLoading() {
  return (
    <div className="min-h-full bg-[#F5F7FA] p-4 lg:p-6">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Fleet Operations
        </p>
        <h1 className="mt-1 text-[24px] font-bold tracking-tight text-slate-950">
          Trailers
        </h1>
      </div>
      <div className="mb-6">
        <FleetSubNav />
      </div>
      <TrailerDashboardSkeleton />
    </div>
  );
}
