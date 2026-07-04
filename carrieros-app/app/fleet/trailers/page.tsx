import Link from "next/link";
import FleetSubNav from "@/components/fleet/FleetSubNav";
import DetailSlideOver, { DetailGrid, DetailSection } from "@/components/premium/DetailSlideOver";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import OperationalTable from "@/components/premium/OperationalTable";
import PremiumMetricCard from "@/components/premium/MetricCard";
import PremiumStatusBadge from "@/components/premium/StatusBadge";
import TablePagination from "@/components/premium/TablePagination";
import TableToolbar from "@/components/premium/TableToolbar";
import { getTruckById } from "@/lib/data/fleet-store";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getFleetService } from "@/lib/services/fleet";

type TrailersPageProps = {
  searchParams: Promise<{ details?: string }>;
};

export default async function TrailersPage({ searchParams }: TrailersPageProps) {
  const params = await searchParams;
  const tenantId = getActiveTenantId();
  const trailers = await getFleetService().listTrailers(tenantId);
  const availableCount = trailers.filter((trailer) => trailer.status === "available").length;
  const selectedTrailer = params.details
    ? trailers.find((trailer) => trailer.id === params.details)
    : undefined;
  const selectedTruck = selectedTrailer?.truckId
    ? getTruckById(selectedTrailer.truckId)
    : undefined;

  return (
    <OperationalPageShell
        title="Trailer Management"
        subtitle="Manage dry van, reefer, flatbed, and other trailer assets."
        eyebrow="Fleet Operations"
        action={
          <Link
            href="/fleet/trailers/new"
            className="rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-500"
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

      <div className="mt-4 overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
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
          getRowHref={(trailer) => `/fleet/trailers?details=${trailer.id}`}
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
                return truck ? `Unit ${truck.unitNumber}` : "Open";
              },
            },
          ]}
        />
        <TablePagination total={trailers.length} />
      </div>
      {selectedTrailer ? (
        <DetailSlideOver
          title={`Trailer ${selectedTrailer.unitNumber}`}
          subtitle={`${selectedTrailer.type} · ${selectedTrailer.status}`}
          closeHref="/fleet/trailers"
        >
          <DetailSection title="Trailer Profile">
            <DetailGrid
              items={[
                { label: "Unit #", value: selectedTrailer.unitNumber },
                { label: "Type", value: selectedTrailer.type },
                { label: "License Plate", value: selectedTrailer.licensePlate },
                { label: "Assigned Truck", value: selectedTruck ? `Unit ${selectedTruck.unitNumber}` : "Unassigned" },
                { label: "Location", value: selectedTrailer.location ?? "Unknown" },
                { label: "Status", value: selectedTrailer.status.replace("_", " ") },
              ]}
            />
          </DetailSection>
          <DetailSection title="Documents & Notes">
            <p className="text-sm leading-6 text-slate-600">
              Registration, insurance, inspection photos, maintenance notes, and assignment history stay attached to this trailer record.
            </p>
          </DetailSection>
        </DetailSlideOver>
      ) : null}
    </OperationalPageShell>
  );
}
