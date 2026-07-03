import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/Card";
import MetricCard from "@/components/MetricCard";
import PageHeader from "@/components/PageHeader";
import FleetSubNav from "@/components/fleet/FleetSubNav";
import FuelRecordCard from "@/components/fleet/FuelRecordCard";
import MaintenanceRecordCard from "@/components/fleet/MaintenanceRecordCard";
import TruckStatusBadge from "@/components/fleet/TruckStatusBadge";
import LoadStatusBadge from "@/components/loads/LoadStatusBadge";
import { getTrailerById } from "@/lib/data/fleet-store";
import { getActiveTenantId } from "@/lib/data/tenant";
import {
  formatMileage,
  formatTruckLabel,
} from "@/lib/services/fleet/fleet-helpers";
import { formatLoadLane } from "@/lib/services/loads/load-helpers";
import { getFleetService } from "@/lib/services/fleet";
import { getLoadService } from "@/lib/services/loads";

type TruckDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TruckDetailPage({ params }: TruckDetailPageProps) {
  const { id } = await params;
  const tenantId = getActiveTenantId();
  const fleetService = getFleetService();
  const loadService = getLoadService();

  const [truck, drivers, maintenance, fuelRecords, loads] = await Promise.all([
    fleetService.getTruck(tenantId, id),
    fleetService.listDrivers(tenantId),
    fleetService.listMaintenance(tenantId, id),
    fleetService.listFuelRecords(tenantId, id),
    loadService.listLoads(tenantId),
  ]);

  if (!truck) {
    notFound();
  }

  const driverName = truck.driverId
    ? drivers.find((driver) => driver.id === truck.driverId)?.name
    : undefined;
  const assignedLoads = loads.filter((load) => load.truckId === truck.id);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/fleet/trucks"
          className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
        >
          ← Back to Trucks
        </Link>

        <Link
          href={`/fleet/trucks/${truck.id}/edit`}
          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-800"
        >
          Edit Truck
        </Link>
      </div>

      <PageHeader
        title={`Unit ${truck.unitNumber}`}
        subtitle={formatTruckLabel(truck)}
        className="mt-4"
      />

      <div className="mt-8">
        <FleetSubNav />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <TruckStatusBadge status={truck.status} />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Mileage" value={`${formatMileage(truck.mileage)} mi`} />
        <MetricCard title="Driver" value={driverName ?? "Unassigned"} />
        <MetricCard title="Maintenance Records" value={maintenance.length.toString()} />
        <MetricCard title="Fuel Records" value={fuelRecords.length.toString()} />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-zinc-100">Equipment Details</h2>
          <div className="mt-4 grid gap-3 text-sm text-zinc-300">
            <p>
              <strong className="text-zinc-100">VIN:</strong> {truck.vin}
            </p>
            <p>
              <strong className="text-zinc-100">License Plate:</strong> {truck.licensePlate}
            </p>
            <p>
              <strong className="text-zinc-100">Location:</strong> {truck.location ?? "Unknown"}
            </p>
            <p>
              <strong className="text-zinc-100">Last Service:</strong>{" "}
              {truck.lastServiceDate ?? "Not recorded"}
            </p>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-zinc-100">Nova AI</h2>
          <p className="mt-3 text-sm text-zinc-300">
            {truck.status === "maintenance"
              ? "This unit is in maintenance. Verify open work orders before dispatch assignment."
              : truck.driverId
                ? "Unit is assigned and ready for dispatch coordination."
                : "Unit is available for dispatch assignment."}
          </p>
        </Card>
      </div>

      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-zinc-100">Current Load Assignments</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Dispatch work currently connected to this truck.
            </p>
          </div>
          <Link
            href="/loads"
            className="text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            Open Dispatch →
          </Link>
        </div>

        <div className="mt-5 grid gap-3">
          {assignedLoads.length > 0 ? (
            assignedLoads.slice(0, 3).map((load) => (
              <Link
                key={load.id}
                href={`/loads/${load.id}`}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-zinc-700"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-400">
                      {load.reference}
                    </p>
                    <p className="mt-1 text-sm text-zinc-300">
                      {formatLoadLane(load)}
                    </p>
                  </div>
                  <LoadStatusBadge status={load.status} />
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-700 p-5">
              <p className="text-sm font-medium text-zinc-100">
                No active load assignment
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Assign this truck from a load detail page to test the alpha flow.
              </p>
            </div>
          )}
        </div>
      </div>

      {maintenance.length > 0 ? (
        <div className="mt-8 space-y-5">
          <h2 className="text-xl font-semibold text-zinc-100">Recent Maintenance</h2>
          {maintenance.slice(0, 2).map((record) => (
            <MaintenanceRecordCard
              key={record.id}
              record={record}
              truckLabel={formatTruckLabel(truck)}
              trailerLabel={
                record.trailerId
                  ? getTrailerById(record.trailerId)?.unitNumber
                    ? `Unit ${getTrailerById(record.trailerId)?.unitNumber}`
                    : undefined
                  : undefined
              }
            />
          ))}
        </div>
      ) : null}

      {fuelRecords.length > 0 ? (
        <div className="mt-8 space-y-5">
          <h2 className="text-xl font-semibold text-zinc-100">Recent Fuel History</h2>
          {fuelRecords.slice(0, 2).map((record) => (
            <FuelRecordCard
              key={record.id}
              record={record}
              truckLabel={formatTruckLabel(truck)}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}
