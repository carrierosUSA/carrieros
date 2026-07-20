import FleetDashboardClient from "@/components/fleet/FleetDashboardClient";
import FleetSubNav from "@/components/fleet/FleetSubNav";
import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import { getActiveTenantId } from "@/lib/data/tenant";
import type { FleetFilter, FleetOpsStatus } from "@/lib/fleet/fleet-dashboard";
import { getFleetService } from "@/lib/services/fleet";
import { getLoadService } from "@/lib/services/loads";

const OPS_STATUSES: FleetOpsStatus[] = [
  "available",
  "on_load",
  "idle",
  "in_shop",
  "out_of_service",
];

function parseInitialFilter(status?: string, equipment?: string): FleetFilter {
  if (status && OPS_STATUSES.includes(status as FleetOpsStatus)) {
    return { kind: "status", id: status as FleetOpsStatus };
  }
  if (equipment) {
    return { kind: "equipment", id: equipment };
  }
  return null;
}

type FleetPageProps = {
  searchParams: Promise<{ status?: string; equipment?: string }>;
};

export default async function FleetDashboardPage({
  searchParams,
}: FleetPageProps) {
  const params = await searchParams;
  const tenantId = getActiveTenantId();
  const fleetService = getFleetService();
  const loadService = getLoadService();

  const [trucks, trailers, drivers, loads, maintenance] = await Promise.all([
    fleetService.listTrucks(tenantId),
    fleetService.listTrailers(tenantId),
    fleetService.listDrivers(tenantId),
    loadService.listLoads(tenantId),
    fleetService.listMaintenance(tenantId),
  ]);

  const statusFilter =
    params.status && OPS_STATUSES.includes(params.status as FleetOpsStatus)
      ? ({ kind: "status", id: params.status as FleetOpsStatus } as const)
      : null;
  const equipmentFilter = params.equipment
    ? ({ kind: "equipment", id: params.equipment } as const)
    : null;

  // Prefer status when both present; still pass equipment for AND filtering.
  const initialFilter =
    statusFilter ?? equipmentFilter ?? parseInitialFilter(params.status, params.equipment);

  return (
    <PageShell
      eyebrow="Fleet"
      title="Fleet Management"
      description="Equipment counts, status, assignments, and maintenance in one view."
    >
      <FleetSubNav />

      <FadeIn>
        <FleetDashboardClient
          trucks={trucks}
          trailers={trailers}
          drivers={drivers}
          loads={loads}
          maintenance={maintenance}
          initialFilter={initialFilter}
          equipmentConstraint={statusFilter && equipmentFilter ? equipmentFilter.id : undefined}
        />
      </FadeIn>
    </PageShell>
  );
}
