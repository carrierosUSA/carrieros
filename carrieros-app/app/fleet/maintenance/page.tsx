import Link from "next/link";
import MetricCard from "@/components/MetricCard";
import PageHeader from "@/components/PageHeader";
import FleetSubNav from "@/components/fleet/FleetSubNav";
import MaintenanceRecordCard from "@/components/fleet/MaintenanceRecordCard";
import { getTrailerById, getTruckById } from "@/lib/data/fleet-store";
import { getActiveTenantId } from "@/lib/data/tenant";
import { formatTruckLabel } from "@/lib/services/fleet/fleet-helpers";
import { getFleetService } from "@/lib/services/fleet";

export default async function MaintenancePage() {
  const tenantId = getActiveTenantId();
  const records = await getFleetService().listMaintenance(tenantId);
  const openRecords = records.filter((record) => record.status !== "completed");

  return (
    <>
      <PageHeader
        title="Maintenance"
        subtitle="Track preventive service, repairs, and open work orders."
      />

      <div className="mt-8">
        <FleetSubNav />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <MetricCard title="Total Records" value={records.length.toString()} />
        <MetricCard title="Open Work Orders" value={openRecords.length.toString()} />
        <MetricCard
          title="Completed"
          value={records.filter((record) => record.status === "completed").length.toString()}
        />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {records.length > 0 ? (
          records.map((record) => {
            const truck = getTruckById(record.truckId);
            const trailer = record.trailerId ? getTrailerById(record.trailerId) : undefined;

            return (
              <MaintenanceRecordCard
                key={record.id}
                record={record}
                truckLabel={truck ? formatTruckLabel(truck) : `Truck ${record.truckId}`}
                trailerLabel={trailer ? `Unit ${trailer.unitNumber}` : undefined}
              />
            );
          })
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 lg:col-span-2">
            <p className="text-lg font-semibold text-zinc-100">No maintenance records</p>
            <p className="mt-2 text-sm text-zinc-400">
              Maintenance history will appear here as work orders are logged.
            </p>
            <Link
              href="/fleet"
              className="mt-4 inline-block text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              Back to Fleet Dashboard →
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
