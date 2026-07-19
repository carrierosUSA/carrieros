import Link from "next/link";
import FleetSubNav from "@/components/fleet/FleetSubNav";
import TruckDashboardClient from "@/components/fleet/trucks/TruckDashboardClient";
import TruckDashboardStats from "@/components/fleet/trucks/TruckDashboardStats";
import FadeIn from "@/components/ui/FadeIn";
import { getActiveTenantId } from "@/lib/data/tenant";
import { buildTruckDashboardStats } from "@/lib/fleet/truck-board";
import { getFleetService } from "@/lib/services/fleet";
import { getLoadService } from "@/lib/services/loads";

export default async function TrucksListPage() {
  const tenantId = getActiveTenantId();
  const fleetService = getFleetService();
  const loadService = getLoadService();

  const [trucks, drivers, loads] = await Promise.all([
    fleetService.listTrucks(tenantId),
    fleetService.listDrivers(tenantId),
    loadService.listLoads(tenantId),
  ]);

  const stats = buildTruckDashboardStats(trucks, loads);

  return (
    <div className="w-full rounded-[16px] bg-white p-4 text-[#111827] sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1560px]">
        <header className="flex flex-col gap-4 rounded-[16px] border border-[#EAEAEA] bg-[#F5F7FA] px-5 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
              Fleet Operations
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              Trucks
            </h1>
            <p className="mt-1 text-[14px] text-slate-500">
              Fleet status, assignments, and unit readiness at a glance.
            </p>
          </div>
          <Link
            href="/fleet/trucks/new"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white shadow-lg shadow-blue-100 transition hover:bg-[#1D4ED8]"
          >
            + Add Truck
          </Link>
        </header>

        <div className="mt-6">
          <FleetSubNav />
        </div>

        <FadeIn className="mt-6 space-y-2">
          <TruckDashboardStats stats={stats} />
          <TruckDashboardClient
            trucks={trucks}
            loads={loads}
            drivers={drivers}
          />
        </FadeIn>
      </div>
    </div>
  );
}
