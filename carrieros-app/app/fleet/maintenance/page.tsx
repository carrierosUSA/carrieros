import { Suspense } from "react";
import FleetSubNav from "@/components/fleet/FleetSubNav";
import MaintenanceDashboardClient from "@/components/fleet/maintenance/MaintenanceDashboardClient";
import MaintenanceDashboardSkeleton from "@/components/fleet/maintenance/MaintenanceDashboardSkeleton";
import MaintenanceDashboardStats from "@/components/fleet/maintenance/MaintenanceDashboardStats";
import FadeIn from "@/components/ui/FadeIn";
import { getMaintenanceSnapshot } from "@/lib/data/maintenance-store";
import { getActiveTenantId } from "@/lib/data/tenant";
import {
  detectMaintenanceAlphAlerts,
} from "@/lib/fleet/maintenance-alph";
import {
  buildMaintenanceDashboardStats,
  buildMaintenanceReports,
} from "@/lib/fleet/maintenance-board";
import { listMaintenanceIntegrations } from "@/lib/fleet/maintenance-integrations";
import { getFleetService } from "@/lib/services/fleet";

type MaintenancePageProps = {
  searchParams: Promise<{ tab?: string; create?: string }>;
};

export default async function MaintenancePage({
  searchParams,
}: MaintenancePageProps) {
  const params = await searchParams;
  const tenantId = getActiveTenantId();
  const fleetService = getFleetService();

  const [trucks, trailers] = await Promise.all([
    fleetService.listTrucks(tenantId),
    fleetService.listTrailers(tenantId),
  ]);

  const snapshot = getMaintenanceSnapshot();
  const boardData = {
    pmSchedules: snapshot.pmSchedules,
    workOrders: snapshot.workOrders,
    repairs: snapshot.repairs,
    parts: snapshot.parts,
    tires: snapshot.tires,
    warranties: snapshot.warranties,
    vendors: snapshot.vendors,
    serviceHistory: snapshot.serviceHistory,
  };

  const alerts = detectMaintenanceAlphAlerts({
    trucks,
    trailers,
    pmSchedules: snapshot.pmSchedules,
    workOrders: snapshot.workOrders,
    repairs: snapshot.repairs,
    parts: snapshot.parts,
    tires: snapshot.tires,
  });

  const criticalAlerts = alerts.filter((a) => a.severity === "critical").length;
  const stats = buildMaintenanceDashboardStats(
    trucks,
    trailers,
    boardData,
    criticalAlerts,
  );
  const reports = buildMaintenanceReports(trucks, trailers, boardData);
  const integrations = listMaintenanceIntegrations();

  return (
    <div className="w-full rounded-[16px] bg-white p-4 text-[#111827] sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1560px]">
        <header className="flex flex-col gap-4 rounded-[16px] border border-[#EAEAEA] bg-[#F5F7FA] px-5 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
              Fleet Service
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              Maintenance & Repair
            </h1>
            <p className="mt-1 text-[14px] text-slate-500">
              Predict failures before they happen. Manage every repair from one
              place.
            </p>
          </div>
        </header>

        <div className="mt-6">
          <FleetSubNav />
        </div>

        <FadeIn className="mt-6">
          <MaintenanceDashboardStats stats={stats} />
        </FadeIn>

        <Suspense fallback={<MaintenanceDashboardSkeleton />}>
          <MaintenanceDashboardClient
            trucks={trucks}
            trailers={trailers}
            initialWorkOrders={snapshot.workOrders}
            pmSchedules={snapshot.pmSchedules}
            repairs={snapshot.repairs}
            mechanics={snapshot.mechanics}
            parts={snapshot.parts}
            vendors={snapshot.vendors}
            tires={snapshot.tires}
            warranties={snapshot.warranties}
            serviceHistory={snapshot.serviceHistory}
            alerts={alerts}
            reports={reports}
            integrations={integrations}
            initialTab={params.tab}
            openCreate={params.create === "1"}
          />
        </Suspense>
      </div>
    </div>
  );
}
