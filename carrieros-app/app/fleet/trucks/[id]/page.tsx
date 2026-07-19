import { notFound } from "next/navigation";
import { Suspense } from "react";
import FleetSubNav from "@/components/fleet/FleetSubNav";
import TruckDetailShell, {
  parseTruckTab,
} from "@/components/fleet/trucks/TruckDetailShell";
import TruckDetailSkeleton from "@/components/fleet/trucks/TruckDetailSkeleton";
import { getTrailerById } from "@/lib/data/fleet-store";
import { getActiveTenantId } from "@/lib/data/tenant";
import {
  buildTruckCameras,
  buildTruckDocuments,
  buildTruckExpenses,
  buildTruckPmSchedule,
  buildTruckTimeline,
} from "@/lib/fleet/truck-detail-data";
import { getTelematicsProvider } from "@/lib/fleet/telematics-provider";
import { getFleetService } from "@/lib/services/fleet";
import { getLoadService } from "@/lib/services/loads";

type TruckDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function TruckDetailPage({
  params,
  searchParams,
}: TruckDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const activeTab = parseTruckTab(query.tab);
  const tenantId = getActiveTenantId();
  const fleetService = getFleetService();
  const loadService = getLoadService();

  const [truck, drivers, maintenance, fuelRecords, loads, trailers] =
    await Promise.all([
      fleetService.getTruck(tenantId, id),
      fleetService.listDrivers(tenantId),
      fleetService.listMaintenance(tenantId, id),
      fleetService.listFuelRecords(tenantId, id),
      loadService.listLoads(tenantId),
      fleetService.listTrailers(tenantId),
    ]);

  if (!truck) {
    notFound();
  }

  const linkedTrailer = trailers.find((entry) => entry.truckId === truck.id);
  const trailer = linkedTrailer
    ? getTrailerById(linkedTrailer.id) ?? linkedTrailer
    : undefined;
  const telematics = await getTelematicsProvider(
    truck.telematicsProvider ?? "mock",
  ).getVehicleSnapshot(truck.id);

  return (
    <div className="w-full rounded-[16px] bg-white p-4 text-[#111827] sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1560px]">
        <div className="mb-6">
          <FleetSubNav />
        </div>

        <Suspense fallback={<TruckDetailSkeleton />}>
          <TruckDetailShell
            truck={truck}
            loads={loads}
            drivers={drivers}
            maintenance={maintenance}
            fuelRecords={fuelRecords}
            documents={buildTruckDocuments(truck)}
            expenses={buildTruckExpenses(truck)}
            pmItems={buildTruckPmSchedule(truck)}
            cameras={buildTruckCameras(truck)}
            timeline={buildTruckTimeline(truck)}
            telematics={telematics}
            trailerLabel={
              trailer
                ? `Unit ${trailer.unitNumber} · ${trailer.type.replaceAll("_", " ")}`
                : undefined
            }
            activeTab={activeTab}
          />
        </Suspense>
      </div>
    </div>
  );
}
