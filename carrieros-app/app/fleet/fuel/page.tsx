import FleetSubNav from "@/components/fleet/FleetSubNav";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import OperationalTable from "@/components/premium/OperationalTable";
import PremiumMetricCard from "@/components/premium/MetricCard";
import TablePagination from "@/components/premium/TablePagination";
import TableToolbar from "@/components/premium/TableToolbar";
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

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
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
            { key: "actions", label: "Actions", align: "center", render: () => "⋯" },
          ]}
        />
        <TablePagination total={records.length} />
      </div>
    </OperationalPageShell>
  );
}
