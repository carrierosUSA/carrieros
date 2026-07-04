import FleetSubNav from "@/components/fleet/FleetSubNav";
import DetailSlideOver, { DetailGrid, DetailSection } from "@/components/premium/DetailSlideOver";
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

type MaintenancePageProps = {
  searchParams: Promise<{ details?: string }>;
};

export default async function MaintenancePage({ searchParams }: MaintenancePageProps) {
  const params = await searchParams;
  const tenantId = getActiveTenantId();
  const records = await getFleetService().listMaintenance(tenantId);
  const openRecords = records.filter((record) => record.status !== "completed");
  const selectedRecord = params.details
    ? records.find((record) => record.id === params.details)
    : undefined;
  const selectedTruck = selectedRecord ? getTruckById(selectedRecord.truckId) : undefined;
  const selectedTrailer = selectedRecord?.trailerId ? getTrailerById(selectedRecord.trailerId) : undefined;

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

      <div className="mt-4 overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
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
          getRowHref={(record) => `/fleet/maintenance?details=${record.id}`}
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
              render: () => <span className="font-semibold text-slate-500">Open</span>,
            },
          ]}
        />
        <TablePagination total={records.length} />
      </div>
      {selectedRecord ? (
        <DetailSlideOver
          title={selectedRecord.type}
          subtitle={selectedTruck ? formatTruckLabel(selectedTruck) : selectedRecord.truckId}
          closeHref="/fleet/maintenance"
        >
          <DetailSection title="Work Order">
            <DetailGrid
              items={[
                { label: "Truck", value: selectedTruck ? formatTruckLabel(selectedTruck) : selectedRecord.truckId },
                { label: "Trailer", value: selectedTrailer ? `Unit ${selectedTrailer.unitNumber}` : "N/A" },
                { label: "Description", value: selectedRecord.description },
                { label: "Status", value: selectedRecord.status.replace("_", " ") },
                { label: "Scheduled", value: selectedRecord.scheduledDate },
                { label: "Completed", value: selectedRecord.completedDate ?? "Open" },
                { label: "Cost", value: formatCurrency(selectedRecord.cost) },
                { label: "Mileage", value: selectedRecord.mileage.toString() },
              ]}
            />
          </DetailSection>
          <DetailSection title="Repair History, Photos, Documents & Notes">
            <p className="text-sm leading-6 text-slate-600">
              Attach estimates, repair invoices, inspection photos, mechanic notes, and Nova maintenance recommendations here.
            </p>
          </DetailSection>
        </DetailSlideOver>
      ) : null}
    </OperationalPageShell>
  );
}
