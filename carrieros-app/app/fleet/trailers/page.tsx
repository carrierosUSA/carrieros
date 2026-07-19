import Link from "next/link";
import FleetSubNav from "@/components/fleet/FleetSubNav";
import TrailerDashboardClient from "@/components/fleet/trailers/TrailerDashboardClient";
import TrailerDashboardStats from "@/components/fleet/trailers/TrailerDashboardStats";
import FadeIn from "@/components/ui/FadeIn";
import { buildTrailerDashboardStats } from "@/lib/fleet/trailer-board";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getFleetService } from "@/lib/services/fleet";
import { getLoadService } from "@/lib/services/loads";

export default async function TrailersDashboardPage() {
  const tenantId = getActiveTenantId();
  const fleetService = getFleetService();
  const loadService = getLoadService();

  const [trailers, trucks, loads] = await Promise.all([
    fleetService.listTrailers(tenantId),
    fleetService.listTrucks(tenantId),
    loadService.listLoads(tenantId),
  ]);

  const stats = buildTrailerDashboardStats(trailers, loads);

  return (
    <div className="min-h-full bg-[#F5F7FA] p-4 lg:p-6">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Fleet Operations
          </p>
          <h1 className="mt-1 text-[24px] font-bold tracking-tight text-slate-950">
            Trailers
          </h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Dry van, reefer, flatbed, and specialty trailers — status, docs, and
            Alph insights in one place.
          </p>
        </div>
        <Link
          href="/fleet/trailers/new"
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#2563EB] px-5 text-[14px] font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:bg-[#1D4ED8]"
        >
          <span className="text-base leading-none">+</span>
          Add Trailer
        </Link>
      </header>

      <div className="mb-6">
        <FleetSubNav />
      </div>

      <FadeIn>
        <TrailerDashboardStats stats={stats} />
      </FadeIn>

      <TrailerDashboardClient
        trailers={trailers}
        loads={loads}
        trucks={trucks}
      />
    </div>
  );
}
