import FleetDashboardClient from "@/components/fleet/FleetDashboardClient";
import FleetSubNav from "@/components/fleet/FleetSubNav";
import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getFleetService } from "@/lib/services/fleet";
import { getLoadService } from "@/lib/services/loads";

export default async function FleetDashboardPage() {
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
        />
      </FadeIn>
    </PageShell>
  );
}
