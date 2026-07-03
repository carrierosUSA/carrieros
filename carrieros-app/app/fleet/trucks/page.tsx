import Link from "next/link";
import FleetSubNav from "@/components/fleet/FleetSubNav";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import OperationalTable from "@/components/premium/OperationalTable";
import PremiumStatusBadge from "@/components/premium/StatusBadge";
import TablePagination from "@/components/premium/TablePagination";
import TableToolbar from "@/components/premium/TableToolbar";
import { getActiveTenantId } from "@/lib/data/tenant";
import { formatMileage } from "@/lib/services/fleet/fleet-helpers";
import { getFleetService } from "@/lib/services/fleet";

export default async function TrucksListPage() {
  const tenantId = getActiveTenantId();
  const fleetService = getFleetService();
  const [trucks, drivers] = await Promise.all([
    fleetService.listTrucks(tenantId),
    fleetService.listDrivers(tenantId),
  ]);

  return (
    <OperationalPageShell
        title="Trucks"
        subtitle="Manage power units, assignments, and equipment status."
        eyebrow="Fleet Operations"
        action={
          <Link
            href="/fleet/trucks/new"
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Add Truck
          </Link>
        }
      >

      <div className="mt-8">
        <FleetSubNav />
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
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
          getRowHref={(truck) => `/fleet/trucks/${truck.id}`}
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
            { key: "actions", label: "Actions", align: "center", render: (truck) => <Link href={`/fleet/trucks/${truck.id}`} className="font-semibold text-slate-500">⋯</Link> },
          ]}
        />
        <TablePagination total={trucks.length} />
      </div>
    </OperationalPageShell>
  );
}
