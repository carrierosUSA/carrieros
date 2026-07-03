import Link from "next/link";
import MetricCard from "@/components/MetricCard";
import PageHeader from "@/components/PageHeader";
import FleetSubNav from "@/components/fleet/FleetSubNav";
import TrailerCard from "@/components/fleet/TrailerCard";
import { getTruckById } from "@/lib/data/fleet-store";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getFleetService } from "@/lib/services/fleet";

export default async function TrailersPage() {
  const tenantId = getActiveTenantId();
  const trailers = await getFleetService().listTrailers(tenantId);
  const availableCount = trailers.filter((trailer) => trailer.status === "available").length;

  return (
    <>
      <PageHeader
        title="Trailer Management"
        subtitle="Manage dry van, reefer, flatbed, and other trailer assets."
        action={
          <Link
            href="/fleet/trailers/new"
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            + Add Trailer
          </Link>
        }
      />

      <div className="mt-8">
        <FleetSubNav />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <MetricCard title="Total Trailers" value={trailers.length.toString()} />
        <MetricCard title="Available" value={availableCount.toString()} />
        <MetricCard
          title="In Maintenance"
          value={trailers.filter((trailer) => trailer.status === "maintenance").length.toString()}
        />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {trailers.map((trailer) => {
          const truck = trailer.truckId ? getTruckById(trailer.truckId) : undefined;

          return (
            <TrailerCard
              key={trailer.id}
              trailer={trailer}
              truckLabel={truck ? `Unit ${truck.unitNumber}` : undefined}
            />
          );
        })}
      </div>
    </>
  );
}
