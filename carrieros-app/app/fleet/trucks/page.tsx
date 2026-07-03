import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import FleetSubNav from "@/components/fleet/FleetSubNav";
import TruckCard from "@/components/fleet/TruckCard";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getFleetService } from "@/lib/services/fleet";

export default async function TrucksListPage() {
  const tenantId = getActiveTenantId();
  const fleetService = getFleetService();
  const [trucks, drivers] = await Promise.all([
    fleetService.listTrucks(tenantId),
    fleetService.listDrivers(tenantId),
  ]);

  return (
    <>
      <PageHeader
        title="Trucks"
        subtitle="Manage power units, assignments, and equipment status."
        action={
          <Link
            href="/fleet/trucks/new"
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            + Add Truck
          </Link>
        }
      />

      <div className="mt-8">
        <FleetSubNav />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {trucks.map((truck) => {
          const driverName = truck.driverId
            ? drivers.find((driver) => driver.id === truck.driverId)?.name
            : undefined;

          return (
            <TruckCard key={truck.id} truck={truck} driverName={driverName} />
          );
        })}
      </div>
    </>
  );
}
