import Link from "next/link";
import FleetSubNav from "@/components/fleet/FleetSubNav";
import DetailSlideOver, { DetailGrid, DetailSection } from "@/components/premium/DetailSlideOver";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import OperationalTable from "@/components/premium/OperationalTable";
import PremiumStatusBadge from "@/components/premium/StatusBadge";
import TablePagination from "@/components/premium/TablePagination";
import TableToolbar from "@/components/premium/TableToolbar";
import { getActiveTenantId } from "@/lib/data/tenant";
import { formatMileage } from "@/lib/services/fleet/fleet-helpers";
import { getFleetService } from "@/lib/services/fleet";

type TrucksListPageProps = {
  searchParams: Promise<{ details?: string }>;
};

export default async function TrucksListPage({ searchParams }: TrucksListPageProps) {
  const params = await searchParams;
  const tenantId = getActiveTenantId();
  const fleetService = getFleetService();
  const [trucks, drivers, maintenanceRecords, fuelRecords] = await Promise.all([
    fleetService.listTrucks(tenantId),
    fleetService.listDrivers(tenantId),
    fleetService.listMaintenance(tenantId),
    fleetService.listFuelRecords(tenantId),
  ]);
  const selectedTruck = params.details
    ? trucks.find((truck) => truck.id === params.details)
    : undefined;
  const selectedDriver = selectedTruck?.driverId
    ? drivers.find((driver) => driver.id === selectedTruck.driverId)
    : undefined;
  const selectedMaintenance = selectedTruck
    ? maintenanceRecords.filter((record) => record.truckId === selectedTruck.id)
    : [];
  const selectedFuel = selectedTruck
    ? fuelRecords.filter((record) => record.truckId === selectedTruck.id)
    : [];

  return (
    <OperationalPageShell
        title="Trucks"
        subtitle="Manage power units, assignments, and equipment status."
        eyebrow="Fleet Operations"
        action={
          <Link
            href="/fleet/trucks/new"
            className="rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-500"
          >
            Add Truck
          </Link>
        }
      >

      <div className="mt-8">
        <FleetSubNav />
      </div>

      <div className="mt-4 overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
        <TableToolbar
          title="Truck Units"
          resultCount={trucks.length}
          searchPlaceholder="Search unit, driver, location..."
          filters={["All", "Available", "Assigned", "Maintenance", "Out of Service"]}
          activeFilter="All"
        />
        <OperationalTable
          rows={trucks}
          getRowKey={(truck) => truck.id}
          getRowHref={(truck) => `/fleet/trucks?details=${truck.id}`}
          columns={[
            { key: "unit", label: "Unit #", render: (truck) => <span className="font-semibold text-slate-950">{truck.unitNumber}</span> },
            { key: "type", label: "Type", render: () => "Truck" },
            { key: "asset", label: "Truck / Trailer", render: (truck) => `${truck.make} ${truck.model}` },
            {
              key: "driver",
              label: "Assigned Driver",
              render: (truck) =>
                truck.driverId
                  ? drivers.find((driver) => driver.id === truck.driverId)?.name ?? "Assigned"
                  : "Unassigned",
            },
            { key: "load", label: "Assigned Load", render: () => "See Dispatch" },
            { key: "location", label: "Location", render: (truck) => truck.location ?? "Unknown" },
            {
              key: "status",
              label: "Status",
              render: (truck) => (
                <PremiumStatusBadge
                  label={truck.status.replace("_", " ")}
                  tone={
                    truck.status === "available"
                      ? "green"
                      : truck.status === "maintenance"
                        ? "amber"
                        : "blue"
                  }
                />
              ),
            },
            { key: "mileage", label: "Mileage", align: "right", render: (truck) => `${formatMileage(truck.mileage)} mi` },
            { key: "fuel", label: "Fuel", render: () => "Tracked" },
            { key: "maintenance", label: "Maintenance", render: (truck) => truck.lastServiceDate },
            { key: "registration", label: "Registration", render: () => "Valid" },
            { key: "insurance", label: "Insurance", render: () => "Valid" },
            { key: "actions", label: "Actions", align: "center", render: () => <span className="font-semibold text-slate-500">Open</span> },
          ]}
        />
        <TablePagination total={trucks.length} />
      </div>
      {selectedTruck ? (
        <DetailSlideOver
          title={`Unit ${selectedTruck.unitNumber}`}
          subtitle={`${selectedTruck.year} ${selectedTruck.make} ${selectedTruck.model}`}
          closeHref="/fleet/trucks"
        >
          <DetailSection title="Truck Information">
            <DetailGrid
              items={[
                { label: "VIN", value: selectedTruck.vin },
                { label: "License Plate", value: selectedTruck.licensePlate },
                { label: "Mileage", value: `${formatMileage(selectedTruck.mileage)} mi` },
                { label: "Engine Hours", value: "Tracked by ELD" },
                { label: "Status", value: selectedTruck.status.replace("_", " ") },
                { label: "GPS", value: selectedTruck.location ?? "Unknown" },
              ]}
            />
          </DetailSection>
          <DetailSection title="Current Driver & Load">
            <DetailGrid
              items={[
                { label: "Current Driver", value: selectedDriver?.name ?? "Unassigned" },
                { label: "Current Load", value: "See Dispatch" },
                { label: "Trailer", value: "Pending" },
                { label: "Fuel Economy", value: "6.8 MPG" },
              ]}
            />
          </DetailSection>
          <DetailSection title="Maintenance, Repair & Fuel History">
            <div className="space-y-2">
              {selectedMaintenance.slice(0, 3).map((record) => (
                <div key={record.id} className="rounded-xl border border-[#E5E7EB] bg-white p-3">
                  <p className="font-semibold text-slate-950">{record.type}</p>
                  <p className="mt-1 text-xs text-slate-500">{record.status.replace("_", " ")} · {record.scheduledDate}</p>
                </div>
              ))}
              <p className="text-sm text-slate-600">{selectedFuel.length} fuel transactions connected to this unit.</p>
            </div>
          </DetailSection>
          <DetailSection title="Insurance, Registration, Photos, Expenses, Documents & Notes">
            <DetailGrid
              items={[
                { label: "Insurance", value: "Valid" },
                { label: "Registration", value: "Valid" },
                { label: "Photos", value: "Ready for upload" },
                { label: "Expenses", value: "Fuel and maintenance tracked" },
                { label: "Documents", value: "Registration, insurance, inspections" },
                { label: "Notes", value: "No critical notes" },
              ]}
            />
          </DetailSection>
          <Link href={`/fleet/trucks/${selectedTruck.id}`} className="inline-block text-sm font-semibold text-blue-600">
            Open full truck profile
          </Link>
        </DetailSlideOver>
      ) : null}
    </OperationalPageShell>
  );
}
