import MetricCard from "@/components/MetricCard";
import PageHeader from "@/components/PageHeader";
import FleetSubNav from "@/components/fleet/FleetSubNav";
import FuelRecordCard from "@/components/fleet/FuelRecordCard";
import { getTruckById } from "@/lib/data/fleet-store";
import { getActiveTenantId } from "@/lib/data/tenant";
import { formatCurrency, formatTruckLabel } from "@/lib/services/fleet/fleet-helpers";
import { getFleetService } from "@/lib/services/fleet";

export default async function FuelHistoryPage() {
  const tenantId = getActiveTenantId();
  const records = await getFleetService().listFuelRecords(tenantId);
  const totalCost = records.reduce((sum, record) => sum + record.cost, 0);
  const totalGallons = records.reduce((sum, record) => sum + record.gallons, 0);

  return (
    <>
      <PageHeader
        title="Fuel History"
        subtitle="Review fuel purchases, costs, and mileage across your fleet."
      />

      <div className="mt-8">
        <FleetSubNav />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <MetricCard title="Fuel Records" value={records.length.toString()} />
        <MetricCard title="Total Gallons" value={totalGallons.toString()} />
        <MetricCard title="Total Spend" value={formatCurrency(totalCost)} />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {records.length > 0 ? (
          records.map((record) => {
            const truck = getTruckById(record.truckId);

            return (
              <FuelRecordCard
                key={record.id}
                record={record}
                truckLabel={truck ? formatTruckLabel(truck) : `Truck ${record.truckId}`}
              />
            );
          })
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 lg:col-span-2">
            <p className="text-lg font-semibold text-zinc-100">No fuel records</p>
            <p className="mt-2 text-sm text-zinc-400">
              Fuel transactions will appear here as they are recorded.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
