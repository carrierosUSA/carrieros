import Link from "next/link";
import Card from "@/components/Card";
import MetricCard from "@/components/MetricCard";
import NovaAlert from "@/components/NovaAlert";
import PageHeader from "@/components/PageHeader";
import FleetSubNav from "@/components/fleet/FleetSubNav";
import { getActiveTenantId } from "@/lib/data/tenant";
import { formatCurrency } from "@/lib/services/fleet/fleet-helpers";
import { getFleetService } from "@/lib/services/fleet";

export default async function FleetDashboardPage() {
  const tenantId = getActiveTenantId();
  const metrics = await getFleetService().getFleetMetrics(tenantId);

  return (
    <>
      <PageHeader
        title="Fleet Management"
        subtitle="Monitor trucks, trailers, maintenance, and fuel across your operation."
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

      {metrics.openMaintenance > 0 ? (
        <NovaAlert
          className="mt-8"
          message={`${metrics.openMaintenance} maintenance record${metrics.openMaintenance === 1 ? "" : "s"} require fleet attention.`}
        />
      ) : (
        <NovaAlert className="mt-8" message="Fleet maintenance is up to date." />
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Trucks" value={metrics.totalTrucks.toString()} />
        <MetricCard title="Available Trucks" value={metrics.availableTrucks.toString()} />
        <MetricCard title="Total Trailers" value={metrics.totalTrailers.toString()} />
        <MetricCard
          title="Monthly Fuel Spend"
          value={formatCurrency(metrics.monthlyFuelCost)}
        />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard title="Assigned Trucks" value={metrics.assignedTrucks.toString()} />
        <MetricCard
          title="In Maintenance"
          value={metrics.maintenanceTrucks.toString()}
        />
        <MetricCard
          title="Open Maintenance"
          value={metrics.openMaintenance.toString()}
        />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <h3 className="font-semibold text-zinc-100">Trucks</h3>
          <p className="mt-2 text-sm text-zinc-400">View and manage power units.</p>
          <Link
            href="/fleet/trucks"
            className="mt-4 inline-block text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            Open Trucks →
          </Link>
        </Card>
        <Card>
          <h3 className="font-semibold text-zinc-100">Trailers</h3>
          <p className="mt-2 text-sm text-zinc-400">Track dry van, reefer, and flatbed assets.</p>
          <Link
            href="/fleet/trailers"
            className="mt-4 inline-block text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            Open Trailers →
          </Link>
        </Card>
        <Card>
          <h3 className="font-semibold text-zinc-100">Maintenance</h3>
          <p className="mt-2 text-sm text-zinc-400">Review service schedules and work orders.</p>
          <Link
            href="/fleet/maintenance"
            className="mt-4 inline-block text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            Open Maintenance →
          </Link>
        </Card>
        <Card>
          <h3 className="font-semibold text-zinc-100">Fuel History</h3>
          <p className="mt-2 text-sm text-zinc-400">Analyze fuel spend and mileage trends.</p>
          <Link
            href="/fleet/fuel"
            className="mt-4 inline-block text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            Open Fuel History →
          </Link>
        </Card>
      </div>
    </>
  );
}
