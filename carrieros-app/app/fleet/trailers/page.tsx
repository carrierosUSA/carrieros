import Link from "next/link";
import FleetSubNav from "@/components/fleet/FleetSubNav";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import OperationalTable from "@/components/premium/OperationalTable";
import PremiumMetricCard from "@/components/premium/MetricCard";
import PremiumStatusBadge from "@/components/premium/StatusBadge";
import TablePagination from "@/components/premium/TablePagination";
import TableToolbar from "@/components/premium/TableToolbar";
import { getTruckById } from "@/lib/data/fleet-store";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getFleetService } from "@/lib/services/fleet";

export default async function TrailersPage() {
  const tenantId = getActiveTenantId();
  const trailers = await getFleetService().listTrailers(tenantId);
  const availableCount = trailers.filter((trailer) => trailer.status === "available").length;

  return (
    <OperationalPageShell
        title="Trailer Management"
        subtitle="Manage dry van, reefer, flatbed, and other trailer assets."
        eyebrow="Fleet Operations"
        action={
          <Link
            href="/fleet/trailers/new"
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Add Trailer
          </Link>
        }
      >

      <div className="mt-8">
        <FleetSubNav />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <PremiumMetricCard label="Total Trailers" value={trailers.length.toString()} detail="Trailer assets" accent="blue" />
        <PremiumMetricCard label="Available" value={availableCount.toString()} detail="Ready to assign" accent="emerald" />
        <PremiumMetricCard
          label="In Maintenance"
          value={trailers.filter((trailer) => trailer.status === "maintenance").length.toString()}
          detail="Needs review"
          accent="amber"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
        <TableToolbar
          title="Trailers"
          resultCount={trailers.length}
          searchPlaceholder="Search unit, type, location..."
          filters={["All", "Available", "Assigned", "Maintenance"]}
          activeFilter="All"
        />
        <OperationalTable
          rows={trailers}
          getRowKey={(trailer) => trailer.id}
          getRowHref={() => "/fleet/trailers"}
          columns={[
            { key: "unit", label: "Unit #", render: (trailer) => <span className="font-semibold text-slate-950">{trailer.unitNumber}</span> },
            { key: "type", label: "Type", render: (trailer) => trailer.type },
            { key: "asset", label: "Truck / Trailer", render: () => "Trailer" },
            { key: "driver", label: "Assigned Driver", render: () => "See truck" },
            { key: "load", label: "Assigned Load", render: () => "See Dispatch" },
            { key: "location", label: "Location", render: (trailer) => trailer.location ?? "Unknown" },
            {
              key: "status",
              label: "Status",
              render: (trailer) => (
                <PremiumStatusBadge
                  label={trailer.status}
                  tone={
                    trailer.status === "available"
                      ? "green"
                      : trailer.status === "maintenance"
                        ? "amber"
                        : "blue"
                  }
                />
              ),
            },
            { key: "mileage", label: "Mileage", render: () => "N/A" },
            { key: "fuel", label: "Fuel", render: () => "N/A" },
            { key: "maintenance", label: "Maintenance", render: () => "Tracked" },
            { key: "registration", label: "Registration", render: () => "Valid" },
            { key: "insurance", label: "Insurance", render: () => "Valid" },
            {
              key: "actions",
              label: "Actions",
              align: "center",
              render: (trailer) => {
                const truck = trailer.truckId ? getTruckById(trailer.truckId) : undefined;
                return truck ? `Unit ${truck.unitNumber}` : "⋯";
              },
            },
          ]}
        />
        <TablePagination total={trailers.length} />
      </div>
    </OperationalPageShell>
  );
}
