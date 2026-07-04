import DetailSlideOver, { DetailGrid, DetailSection } from "@/components/premium/DetailSlideOver";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import OperationalTable from "@/components/premium/OperationalTable";
import PremiumMetricCard from "@/components/premium/MetricCard";
import PremiumStatusBadge from "@/components/premium/StatusBadge";
import TablePagination from "@/components/premium/TablePagination";
import TableToolbar from "@/components/premium/TableToolbar";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getDriverService } from "@/lib/services/drivers";
import { getFleetService } from "@/lib/services/fleet";

const complianceRows = [
  { area: "FMCSA Status", owner: "Safety", due: "Continuous", status: "monitoring" },
  { area: "IRP", owner: "Fleet", due: "Annual", status: "valid" },
  { area: "IFTA", owner: "Accounting", due: "Quarterly", status: "review" },
  { area: "UCR", owner: "Safety", due: "Annual", status: "valid" },
  { area: "BOC-3", owner: "Safety", due: "As needed", status: "valid" },
  { area: "MCS-150", owner: "Safety", due: "Biennial", status: "monitoring" },
  { area: "Driver Qualification Files", owner: "Safety", due: "Continuous", status: "review" },
  { area: "Drug & Alcohol", owner: "Safety", due: "Continuous", status: "monitoring" },
  { area: "ELD", owner: "Dispatch", due: "Daily", status: "monitoring" },
  { area: "Insurance", owner: "Owner", due: "Annual", status: "valid" },
];

type CompliancePageProps = {
  searchParams: Promise<{ details?: string }>;
};

export default async function CompliancePage({ searchParams }: CompliancePageProps) {
  const params = await searchParams;
  const tenantId = getActiveTenantId();
  const [driverMetrics, fleetMetrics] = await Promise.all([
    getDriverService().getDriverMetrics(tenantId),
    getFleetService().getFleetMetrics(tenantId),
  ]);
  const alerts = driverMetrics.expiringCompliance + fleetMetrics.openMaintenance;
  const selectedRow = params.details
    ? complianceRows.find((row) => row.area === params.details)
    : undefined;

  return (
    <OperationalPageShell
      title="FMCSA Compliance Center"
      subtitle="DOT audit readiness, permits, driver qualification files, insurance, registration, IFTA, IRP, ELD, and expiry alerts."
      eyebrow="Safety / Compliance"
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <PremiumMetricCard label="Compliance Alerts" value={alerts.toString()} detail="Needs review" accent={alerts > 0 ? "rose" : "emerald"} />
        <PremiumMetricCard label="Driver Expirations" value={driverMetrics.expiringCompliance.toString()} detail="CDL / medical" accent="amber" />
        <PremiumMetricCard label="Open Maintenance" value={fleetMetrics.openMaintenance.toString()} detail="DOT readiness" accent="blue" />
        <PremiumMetricCard label="Audit Status" value="Ready" detail="Structure in place" accent="slate" />
      </div>

      <div className="mt-4 overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
        <TableToolbar
          title="Compliance Register"
          resultCount={complianceRows.length}
          searchPlaceholder="Search FMCSA, permits, DQ files..."
          filters={["All", "Review", "Valid", "Monitoring", "Expiring"]}
          activeFilter="All"
          bulkActionLabel="Export audit"
        />
        <OperationalTable
          rows={complianceRows}
          getRowKey={(row) => row.area}
          getRowHref={(row) => `/compliance?details=${encodeURIComponent(row.area)}`}
          emptyTitle="No compliance records"
          columns={[
            { key: "area", label: "Compliance Area", render: (row) => <span className="font-semibold text-slate-950">{row.area}</span> },
            { key: "owner", label: "Owner", render: (row) => row.owner },
            { key: "due", label: "Renewal / Review", render: (row) => row.due },
            {
              key: "status",
              label: "Status",
              render: (row) => (
                <PremiumStatusBadge
                  label={row.status}
                  tone={row.status === "valid" ? "green" : row.status === "review" ? "amber" : "blue"}
                />
              ),
            },
            { key: "alerts", label: "Automatic Alerts", render: () => "Before expiry" },
            { key: "actions", label: "Actions", align: "center", render: () => "Open" },
          ]}
        />
        <TablePagination total={complianceRows.length} />
      </div>
      {selectedRow ? (
        <DetailSlideOver
          title={selectedRow.area}
          subtitle={`${selectedRow.owner} · ${selectedRow.due}`}
          closeHref="/compliance"
        >
          <DetailSection title="Compliance Detail">
            <DetailGrid
              items={[
                { label: "Area", value: selectedRow.area },
                { label: "Owner", value: selectedRow.owner },
                { label: "Renewal / Review", value: selectedRow.due },
                { label: "Status", value: selectedRow.status },
                { label: "Automatic Alerts", value: "Before expiry" },
                { label: "DOT Audit Readiness", value: "Tracked" },
              ]}
            />
          </DetailSection>
          <DetailSection title="Documents, Notes & Nova Recommendations">
            <p className="text-sm leading-6 text-slate-600">
              Store compliance documents, renewal notes, audit evidence, and Nova expiry recommendations in this detail record.
            </p>
          </DetailSection>
        </DetailSlideOver>
      ) : null}
    </OperationalPageShell>
  );
}
