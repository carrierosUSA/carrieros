import DetailSlideOver, { DetailGrid, DetailSection } from "@/components/premium/DetailSlideOver";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import OperationalTable from "@/components/premium/OperationalTable";
import PremiumMetricCard from "@/components/premium/MetricCard";
import PremiumStatusBadge from "@/components/premium/StatusBadge";
import TablePagination from "@/components/premium/TablePagination";
import TableToolbar from "@/components/premium/TableToolbar";
import { getActiveTenantId } from "@/lib/data/tenant";
import { formatCurrency } from "@/lib/services/fleet/fleet-helpers";
import { getDriverService } from "@/lib/services/drivers";

type PayrollPageProps = {
  searchParams: Promise<{ details?: string }>;
};

export default async function PayrollPage({ searchParams }: PayrollPageProps) {
  const params = await searchParams;
  const tenantId = getActiveTenantId();
  const driverService = getDriverService();
  const drivers = await driverService.listDrivers(tenantId);
  const rows = (
    await Promise.all(
      drivers.map(async (driver) => {
        const records = await driverService.listPayroll(tenantId, driver.id);
        return records.map((record) => ({ driver, record }));
      }),
    )
  ).flat();
  const grossPay = rows.reduce((total, row) => total + row.record.grossPay, 0);
  const netPay = rows.reduce((total, row) => total + row.record.netPay, 0);
  const deductions = rows.reduce((total, row) => total + row.record.deductions, 0);
  const selectedRow = params.details
    ? rows.find((row) => row.record.id === params.details)
    : undefined;

  return (
    <OperationalPageShell
      title="Payroll"
      subtitle="Driver settlements, paid miles, deductions, advances, exports, and year-end reporting readiness."
      eyebrow="Accounting"
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <PremiumMetricCard label="Settlements" value={rows.length.toString()} detail="Payroll records" accent="blue" />
        <PremiumMetricCard label="Gross Pay" value={formatCurrency(grossPay)} detail="Before deductions" accent="emerald" />
        <PremiumMetricCard label="Deductions" value={formatCurrency(deductions)} detail="Advances, deductions" accent="amber" />
        <PremiumMetricCard label="Net Pay" value={formatCurrency(netPay)} detail="Ready for export" accent="slate" />
      </div>

      <div className="mt-4 overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
        <TableToolbar
          title="Driver Payroll"
          resultCount={rows.length}
          searchPlaceholder="Search driver, pay period..."
          filters={["All", "Pending", "Paid", "1099", "W2", "Year-End"]}
          activeFilter="All"
          bulkActionLabel="Export payroll"
        />
        <OperationalTable
          rows={rows}
          getRowKey={(row) => row.record.id}
          getRowHref={(row) => `/payroll?details=${row.record.id}`}
          emptyTitle="No payroll records"
          emptyDescription="Driver payroll records will appear after settlements are created."
          columns={[
            { key: "driver", label: "Driver", render: (row) => <span className="font-semibold text-slate-950">{row.driver.name}</span> },
            { key: "period", label: "Pay Period", render: (row) => row.record.period },
            { key: "paidMiles", label: "Paid Miles", align: "right", render: () => "2,180" },
            { key: "unpaidMiles", label: "Unpaid Miles", align: "right", render: () => "126" },
            { key: "rate", label: "Rate", render: (row) => `${row.driver.payRate}${row.driver.payType === "per_mile" ? "/mi" : ""}` },
            { key: "advances", label: "Advances", align: "right", render: () => formatCurrency(0) },
            { key: "deductions", label: "Deductions", align: "right", render: (row) => formatCurrency(row.record.deductions) },
            { key: "gross", label: "Gross Pay", align: "right", render: (row) => formatCurrency(row.record.grossPay) },
            { key: "net", label: "Net Pay", align: "right", render: (row) => <span className="font-semibold text-slate-950">{formatCurrency(row.record.netPay)}</span> },
            {
              key: "status",
              label: "Status",
              render: (row) => (
                <PremiumStatusBadge label={row.record.status} tone={row.record.status === "paid" ? "green" : "amber"} />
              ),
            },
            { key: "tax", label: "Tax Docs", render: () => "1099 / W-2 ready" },
            { key: "actions", label: "Actions", align: "center", render: () => "Open" },
          ]}
        />
        <TablePagination total={rows.length} />
      </div>
      {selectedRow ? (
        <DetailSlideOver
          title={`${selectedRow.driver.name} Settlement`}
          subtitle={selectedRow.record.period}
          closeHref="/payroll"
        >
          <DetailSection title="Payroll Detail">
            <DetailGrid
              items={[
                { label: "Driver", value: selectedRow.driver.name },
                { label: "Pay Period", value: selectedRow.record.period },
                { label: "Paid Miles", value: "2,180" },
                { label: "Unpaid Miles", value: "126" },
                { label: "Detention", value: formatCurrency(0) },
                { label: "Layover", value: formatCurrency(0) },
                { label: "Extra Pay", value: formatCurrency(0) },
                { label: "Advances", value: formatCurrency(0) },
                { label: "Deductions", value: formatCurrency(selectedRow.record.deductions) },
                { label: "Gross Pay", value: formatCurrency(selectedRow.record.grossPay) },
                { label: "Net Pay", value: formatCurrency(selectedRow.record.netPay) },
                { label: "Status", value: selectedRow.record.status },
              ]}
            />
          </DetailSection>
          <DetailSection title="Settlements, 1099/W2 & Export">
            <p className="text-sm leading-6 text-slate-600">
              Settlement review, accountant access, tax document status, year-end reporting, and payroll export actions live here.
            </p>
          </DetailSection>
        </DetailSlideOver>
      ) : null}
    </OperationalPageShell>
  );
}
