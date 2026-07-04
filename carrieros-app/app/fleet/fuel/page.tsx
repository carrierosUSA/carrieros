import FleetSubNav from "@/components/fleet/FleetSubNav";
import DetailSlideOver, { DetailGrid, DetailSection } from "@/components/premium/DetailSlideOver";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import OperationalTable from "@/components/premium/OperationalTable";
import PremiumMetricCard from "@/components/premium/MetricCard";
import TablePagination from "@/components/premium/TablePagination";
import TableToolbar from "@/components/premium/TableToolbar";
import { getTruckById } from "@/lib/data/fleet-store";
import { getActiveTenantId } from "@/lib/data/tenant";
import { formatCurrency, formatTruckLabel } from "@/lib/services/fleet/fleet-helpers";
import { getFleetService } from "@/lib/services/fleet";

type FuelHistoryPageProps = {
  searchParams: Promise<{ details?: string }>;
};

export default async function FuelHistoryPage({ searchParams }: FuelHistoryPageProps) {
  const params = await searchParams;
  const tenantId = getActiveTenantId();
  const records = await getFleetService().listFuelRecords(tenantId);
  const totalCost = records.reduce((sum, record) => sum + record.cost, 0);
  const totalGallons = records.reduce((sum, record) => sum + record.gallons, 0);
  const selectedRecord = params.details
    ? records.find((record) => record.id === params.details)
    : undefined;
  const selectedTruck = selectedRecord ? getTruckById(selectedRecord.truckId) : undefined;

  return (
    <OperationalPageShell
        title="Fuel History"
        subtitle="Review fuel purchases, costs, and mileage across your fleet."
        eyebrow="Fuel / IFTA Ready"
      >

      <div className="mt-8">
        <FleetSubNav />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <PremiumMetricCard label="Fuel Records" value={records.length.toString()} detail="Transactions" accent="blue" />
        <PremiumMetricCard label="Total Gallons" value={totalGallons.toString()} detail="IFTA-ready data" accent="emerald" />
        <PremiumMetricCard label="Total Spend" value={formatCurrency(totalCost)} detail="Fuel MTD" accent="amber" />
      </div>

      <div className="mt-4 overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
        <TableToolbar
          title="Fuel Transactions"
          resultCount={records.length}
          searchPlaceholder="Search truck, location, date..."
          filters={["All", "This Month", "High Cost", "IFTA Review"]}
          activeFilter="All"
          bulkActionLabel="Export IFTA"
        />
        <OperationalTable
          rows={records}
          getRowKey={(record) => record.id}
          getRowHref={(record) => `/fleet/fuel?details=${record.id}`}
          emptyTitle="No fuel records"
          emptyDescription="Fuel transactions will appear here as they are recorded."
          columns={[
            {
              key: "truck",
              label: "Unit",
              render: (record) => {
                const truck = getTruckById(record.truckId);
                return truck ? formatTruckLabel(truck) : `Truck ${record.truckId}`;
              },
            },
            { key: "date", label: "Date", render: (record) => record.date },
            { key: "location", label: "Location", render: (record) => record.location },
            { key: "gallons", label: "Gallons", align: "right", render: (record) => record.gallons.toString() },
            { key: "cost", label: "Cost", align: "right", render: (record) => formatCurrency(record.cost) },
            { key: "mileage", label: "Mileage", align: "right", render: (record) => record.mileage.toString() },
            { key: "ifta", label: "IFTA", render: () => "Ready" },
            { key: "actions", label: "Actions", align: "center", render: () => "Open" },
          ]}
        />
        <TablePagination total={records.length} />
      </div>
      {selectedRecord ? (
        <DetailSlideOver
          title="Fuel Transaction"
          subtitle={selectedTruck ? formatTruckLabel(selectedTruck) : `Truck ${selectedRecord.truckId}`}
          closeHref="/fleet/fuel"
        >
          <DetailSection title="Fuel Detail">
            <DetailGrid
              items={[
                { label: "Truck", value: selectedTruck ? formatTruckLabel(selectedTruck) : selectedRecord.truckId },
                { label: "Date", value: selectedRecord.date },
                { label: "Location", value: selectedRecord.location },
                { label: "Gallons", value: selectedRecord.gallons.toString() },
                { label: "Cost", value: formatCurrency(selectedRecord.cost) },
                { label: "Mileage", value: selectedRecord.mileage.toString() },
              ]}
            />
          </DetailSection>
          <DetailSection title="IFTA, Receipt & Notes">
            <p className="text-sm leading-6 text-slate-600">
              Receipt preview, IFTA jurisdiction review, fuel anomaly notes, and accounting export actions attach here.
            </p>
          </DetailSection>
        </DetailSlideOver>
      ) : null}
    </OperationalPageShell>
  );
}
