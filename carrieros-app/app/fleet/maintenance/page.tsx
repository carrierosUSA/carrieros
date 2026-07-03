import Link from "next/link";
import FleetSubNav from "@/components/fleet/FleetSubNav";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import OperationalTable from "@/components/premium/OperationalTable";
import PremiumMetricCard from "@/components/premium/MetricCard";
import PremiumStatusBadge from "@/components/premium/StatusBadge";
import TablePagination from "@/components/premium/TablePagination";
import TableToolbar from "@/components/premium/TableToolbar";
import { getTrailerById, getTruckById } from "@/lib/data/fleet-store";
import { getActiveTenantId } from "@/lib/data/tenant";
import { formatCurrency, formatTruckLabel } from "@/lib/services/fleet/fleet-helpers";
import { getFleetService } from "@/lib/services/fleet";

export default async function MaintenancePage() {
  const tenantId = getActiveTenantId();
  const records = await getFleetService().listMaintenance(tenantId);
  const openRecords = records.filter((record) => record.status !== "completed");

  return (
    <OperationalPageShell
        title="Maintenance"
        subtitle="Track preventive service, repairs, and open work orders."
        eyebrow="Fleet Service"
      >

      <div className="mt-8">
        <FleetSubNav />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <PremiumMetricCard label="Total Records" value={records.length.toString()} detail="Service history" accent="blue" />
        <PremiumMetricCard label="Open Work Orders" value={openRecords.length.toString()} detail="Needs action" accent="amber" />
        <PremiumMetricCard
          label="Completed"
          value={records.filter((record) => record.status === "completed").length.toString()}
          detail="Closed work"
          accent="emerald"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
        <TableToolbar
          title="Maintenance Work Orders"
          resultCount={records.length}
          searchPlaceholder="Search unit, work order, service..."
          filters={["All", "Open", "Scheduled", "In Progress", "Completed"]}
          activeFilter="All"
        />
        <OperationalTable
          rows={records}
          getRowKey={(record) => record.id}
          emptyTitle="No maintenance records"
          emptyDescription="Maintenance history will appear here as work orders are logged."
          columns={[
            {
              key: "unit",
              label: "Equipment",
              render: (record) => {
                const truck = getTruckById(record.truckId);
                const trailer = record.trailerId ? getTrailerById(record.trailerId) : undefined;
                return trailer
                  ? `${truck ? formatTruckLabel(truck) : record.truckId} / Trailer ${trailer.unitNumber}`
                  : truck
                    ? formatTruckLabel(truck)
                    : `Truck ${record.truckId}`;
              },
            },
            { key: "type", label: "Type", render: (record) => record.type },
            { key: "description", label: "Description", render: (record) => record.description },
            {
              key: "status",
              label: "Status",
              render: (record) => (
                <PremiumStatusBadge
                  label={record.status.replace("_", " ")}
                  tone={
                    record.status === "completed"
                      ? "green"
                      : record.status === "in_progress"
                        ? "blue"
                        : "amber"
                  }
                />
              ),
            },
            { key: "scheduled", label: "Scheduled", render: (record) => record.scheduledDate },
            { key: "completed", label: "Completed", render: (record) => record.completedDate ?? "Open" },
            { key: "cost", label: "Cost", align: "right", render: (record) => formatCurrency(record.cost) },
            { key: "mileage", label: "Mileage", align: "right", render: (record) => record.mileage.toString() },
            {
              key: "actions",
              label: "Actions",
              align: "center",
              render: () => <Link href="/fleet" className="font-semibold text-slate-500">⋯</Link>,
            },
          ]}
        />
        <TablePagination total={records.length} />
      </div>
    </OperationalPageShell>
  );
}
