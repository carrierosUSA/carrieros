import Link from "next/link";
import DashboardPanel from "@/components/premium/DashboardPanel";
import DetailSlideOver, { DetailGrid, DetailSection } from "@/components/premium/DetailSlideOver";
import {
  EnterpriseAreaChart,
  EnterpriseBarChart,
  EnterpriseDonutChart,
  EnterpriseHorizontalBarChart,
  EnterpriseLineChart,
} from "@/components/premium/EnterpriseCharts";
import PremiumMetricCard from "@/components/premium/MetricCard";
import NovaInsightCard from "@/components/premium/NovaInsightCard";
import PremiumStatusBadge from "@/components/premium/StatusBadge";
import PremiumTable from "@/components/premium/PremiumTable";
import { getActiveCompany } from "@/lib/data/tenant";
import { getDocumentService } from "@/lib/services/documents";
import { getDriverService } from "@/lib/services/drivers";
import { getFleetService } from "@/lib/services/fleet";
import { formatCurrency, formatLoadLane } from "@/lib/services/loads/load-helpers";
import { getLoadService } from "@/lib/services/loads";
import { getTrackingService } from "@/lib/services/tracking";

type DashboardAction = {
  title: string;
  label: string;
  href: string;
  severity: "success" | "warning" | "danger" | "default";
};

type HomeProps = {
  searchParams: Promise<{ details?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const company = getActiveCompany();
  const tenantId = company.tenantId;
  const loadService = getLoadService();
  const documentService = getDocumentService();
  const driverService = getDriverService();
  const fleetService = getFleetService();
  const trackingService = getTrackingService();

  const [
    loads,
    loadCounts,
    driverMetrics,
    fleetMetrics,
    drivers,
    maintenanceRecords,
    fuelRecords,
  ] = await Promise.all([
    loadService.listLoads(tenantId),
    loadService.countByStatus(tenantId),
    driverService.getDriverMetrics(tenantId),
    fleetService.getFleetMetrics(tenantId),
    driverService.listDrivers(tenantId),
    fleetService.listMaintenance(tenantId),
    fleetService.listFuelRecords(tenantId),
  ]);

  const attentionLoads = loads.filter(
    (load) => load.complianceStatus === "attention",
  );
  const packetSummaries = await Promise.all(
    loads.map(async (load) => ({
      load,
      summary: await documentService.getPacketSummary(tenantId, load.id),
    })),
  );
  const firstMissingPacketDoc = packetSummaries.find(
    (entry) => entry.summary.nextMissing,
  );
  const missingDocs = packetSummaries.reduce(
    (total, entry) => total + entry.summary.missingRequired.length,
    0,
  );
  const pendingAssignmentLoad = loads.find((load) => !load.driverId || !load.truckId);
  const trackingEvents = await trackingService.listNovaEvents(tenantId);
  const latestTrackingEvent = trackingEvents[0];
  const deliveredNotInvoiced = loads.find(
    (load) => load.status === "delivered" && !load.invoiceId,
  );
  const activeLoads = loads.filter(
    (load) => !["delivered", "invoiced", "cancelled"].includes(load.status),
  );
  const revenueMtd = loads.reduce((total, load) => total + load.rate, 0);
  const pendingPayments = loads
    .filter((load) => load.status === "delivered" || load.status === "invoiced")
    .reduce((total, load) => total + load.rate, 0);
  const complianceAlerts =
    attentionLoads.length +
    driverMetrics.expiringCompliance +
    fleetMetrics.openMaintenance +
    missingDocs;
  const estimatedProfit = Math.max(
    0,
    revenueMtd - fleetMetrics.monthlyFuelCost - Math.round(revenueMtd * 0.34),
  );
  const profitMargin =
    revenueMtd > 0 ? Math.round((estimatedProfit / revenueMtd) * 100) : 0;
  const recentLoads = loads.slice(0, 5);
  const formatPartyLabel = (id: string) =>
    id
      .replace(/^(broker|customer)-/, "")
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  const topBrokers = Array.from(
    loads.reduce(
      (map, load) => {
        const key = load.brokerId ?? load.customerId;
        const current = map.get(key) ?? {
          label: load.brokerId ? formatPartyLabel(load.brokerId) : "Direct customer",
          loads: 0,
          revenue: 0,
        };

        current.loads += 1;
        current.revenue += load.rate;
        map.set(key, current);

        return map;
      },
      new Map<string, { label: string; loads: number; revenue: number }>(),
    ).values(),
  )
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);
  const selectedLoad = params.details
    ? loads.find((load) => load.id === params.details)
    : undefined;
  const upcomingDriverExpirations = drivers
    .map((driver) => ({
      driver,
      expiresAt:
        new Date(driver.medicalExpiresAt) < new Date(driver.licenseExpiresAt)
          ? driver.medicalExpiresAt
          : driver.licenseExpiresAt,
      type:
        new Date(driver.medicalExpiresAt) < new Date(driver.licenseExpiresAt)
          ? "Medical"
          : "CDL",
    }))
    .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime())
    .slice(0, 4);
  const openMaintenance = maintenanceRecords
    .filter((record) => record.status !== "completed")
    .slice(0, 4);
  const fuelSpend = fuelRecords.reduce((total, record) => total + record.cost, 0);
  const profitBase = Math.max(estimatedProfit, Math.round(revenueMtd * 0.22), 18000);
  const cashFlowBase = Math.max(pendingPayments, Math.round(revenueMtd * 0.28), 22000);
  const fuelBase = Math.max(fuelSpend, fleetMetrics.monthlyFuelCost, 9000);
  const maintenanceBase = Math.max(fleetMetrics.openMaintenance * 760, 6500);
  const revenueTrend = [
    { label: "May 1", value: Math.round(revenueMtd * 0.18) },
    { label: "May 6", value: Math.round(revenueMtd * 0.31) },
    { label: "May 11", value: Math.round(revenueMtd * 0.44) },
    { label: "May 16", value: Math.round(revenueMtd * 0.58) },
    { label: "May 21", value: Math.round(revenueMtd * 0.72) },
    { label: "May 26", value: Math.round(revenueMtd * 0.86) },
    { label: "May 31", value: revenueMtd },
  ];
  const profitTrend = [
    { label: "W1", value: Math.round(profitBase * 0.48) },
    { label: "W2", value: Math.round(profitBase * 0.63) },
    { label: "W3", value: Math.round(profitBase * 0.78) },
    { label: "W4", value: profitBase },
  ];
  const cashFlowTrend = [
    { label: "W1", value: Math.round(cashFlowBase * 0.28) },
    { label: "W2", value: Math.round(cashFlowBase * 0.52) },
    { label: "W3", value: Math.round(cashFlowBase * 0.74) },
    { label: "W4", value: cashFlowBase },
  ];
  const fuelCostTrend = [
    { label: "W1", value: Math.round(fuelBase * 0.34) },
    { label: "W2", value: Math.round(fuelBase * 0.51) },
    { label: "W3", value: Math.round(fuelBase * 0.72) },
    { label: "W4", value: fuelBase },
  ];
  const driverPerformance = [
    { label: "On-time", value: 94 },
    { label: "Docs", value: Math.max(70, 100 - missingDocs * 5) },
    { label: "Safety", value: Math.max(76, 100 - driverMetrics.openSafetyEvents * 8) },
    { label: "Utilization", value: Math.min(96, driverMetrics.activeDrivers * 12) },
  ];
  const maintenanceCostTrend = [
    { label: "W1", value: Math.round(maintenanceBase * 0.38) },
    { label: "W2", value: Math.round(maintenanceBase * 0.54) },
    { label: "W3", value: Math.round(maintenanceBase * 0.79) },
    { label: "W4", value: maintenanceBase },
  ];
  const fleetUtilization = Math.min(
    100,
    Math.round(
      (fleetMetrics.assignedTrucks /
        Math.max(fleetMetrics.assignedTrucks + fleetMetrics.availableTrucks, 1)) *
        100,
    ),
  );
  const alphaActions: DashboardAction[] = [
    ...(pendingAssignmentLoad
      ? [
          {
            title: "Finish dispatch assignment",
            label: "Assign now",
            href: `/loads/${pendingAssignmentLoad.id}`,
            severity: "warning" as const,
          },
        ]
      : []),
    ...(firstMissingPacketDoc?.summary.nextMissing
      ? [
          {
            title: `Missing ${firstMissingPacketDoc.summary.nextMissing.label}`,
            label: "Capture",
            href: `/loads/${firstMissingPacketDoc.load.id}/documents`,
            severity: "warning" as const,
          },
        ]
      : []),
    ...(deliveredNotInvoiced
      ? [
          {
            title: "Close delivered load",
            label: "Invoice",
            href: `/loads/${deliveredNotInvoiced.id}`,
            severity: "warning" as const,
          },
        ]
      : []),
    ...(latestTrackingEvent
      ? [
          {
            title: latestTrackingEvent.message,
            label: "View",
            href: `/loads/${latestTrackingEvent.loadId}/tracking`,
            severity: "warning" as const,
          },
        ]
      : []),
    ...(driverMetrics.expiringCompliance > 0
      ? [
          {
            title: "Review driver compliance",
            label: "Review",
            href: "/drivers/directory",
            severity: "danger" as const,
          },
        ]
      : []),
    ...(fleetMetrics.openMaintenance > 0
      ? [
          {
            title: "Check fleet maintenance",
            label: "Open",
            href: "/fleet/maintenance",
            severity: "warning" as const,
          },
        ]
      : []),
  ];
  const visibleActions =
    alphaActions.length > 0
      ? alphaActions.slice(0, 4)
      : [
          {
            title: "Alpha workflow ready",
            label: "Start",
            href: "/loads/new",
            severity: "success" as const,
          },
        ];
  const recentActivity = [
    ...loads.flatMap((load) =>
      load.timeline.slice(-1).map((event) => ({
        id: event.id,
        title: event.label,
        meta: `${load.reference} · ${event.location ?? formatLoadLane(load)}`,
        href: `/loads/${load.id}`,
      })),
    ),
    ...trackingEvents.slice(0, 2).map((event) => ({
      id: event.id,
      title: event.message,
      meta: "Nova tracking",
      href: `/loads/${event.loadId}/tracking`,
    })),
  ].slice(0, 5);

  return (
    <div className="w-full rounded-[14px] bg-white text-slate-950">
      <div className="mx-auto max-w-[1680px] space-y-6 p-3 sm:p-4 lg:p-0">
        <header className="relative overflow-hidden rounded-[16px] border border-[#DDE2EA] bg-white px-6 py-5 shadow-[0_12px_32px_rgba(15,23,42,0.055)]">
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Live operations system
              </div>
              <h1 className="mt-4 text-2xl font-semibold tracking-[-0.035em] text-[#111827] sm:text-[30px]">
                CarrierOS Command Center
              </h1>
              <p className="mt-2 text-sm font-medium text-[#6B7280]">
                {company.name} · Owner, dispatch, finance, safety, and fleet view
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Link
                href="/loads/new"
                className="rounded-xl bg-[#2563EB] px-4 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-500"
              >
                + Create Load
              </Link>
              <Link
                href="/finance"
                className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-slate-950"
              >
                Open Finance
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-12">
          <div className="xl:col-span-2">
            <PremiumMetricCard
              label="Active Loads"
              value={activeLoads.length.toString()}
              detail={`${loadCounts.in_transit} in transit`}
              accent="blue"
              href="/loads"
            />
          </div>
          <div className="xl:col-span-2">
            <PremiumMetricCard
              label="Revenue MTD"
              value={formatCurrency(revenueMtd)}
              detail="Booked freight"
              accent="emerald"
              href="/analytics?details=revenue-overview"
            />
          </div>
          <div className="xl:col-span-2">
            <PremiumMetricCard
              label="Pending Payments"
              value={formatCurrency(pendingPayments)}
              detail="AR watch"
              accent="amber"
              href="/finance"
            />
          </div>
          <div className="xl:col-span-2">
            <PremiumMetricCard
              label="Active Trucks"
              value={(fleetMetrics.assignedTrucks + fleetMetrics.availableTrucks).toString()}
              detail={`${fleetMetrics.maintenanceTrucks} in shop`}
              accent="blue"
              href="/fleet/trucks"
            />
          </div>
          <div className="xl:col-span-2">
            <PremiumMetricCard
              label="Drivers"
              value={driverMetrics.totalDrivers.toString()}
              detail={`${driverMetrics.activeDrivers} active`}
              accent="slate"
              href="/drivers/directory"
            />
          </div>
          <div className="xl:col-span-2">
            <PremiumMetricCard
              label="Compliance Alerts"
              value={complianceAlerts.toString()}
              detail="Needs review"
              accent={complianceAlerts > 0 ? "rose" : "emerald"}
              href="/compliance"
            />
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-[14px] border border-[#E5E7EB] bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"].map((filter) => (
              <span
                key={filter}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                  filter === "Monthly"
                    ? "border-[#2563EB] bg-[#2563EB] text-white"
                    : "border-[#E5E7EB] bg-[#F8F9FB] text-slate-600"
                }`}
              >
                {filter}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {["Truck", "Driver", "Broker", "Customer", "Export PDF", "Export Excel"].map((filter) => (
              <span
                key={filter}
                className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-semibold text-slate-600"
              >
                {filter}
              </span>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8">
          <EnterpriseLineChart
            title="Revenue Overview"
            subtitle="Month to date booked revenue"
            data={revenueTrend}
            valuePrefix="$"
            showMonthSelector
            height={310}
            href="/analytics?details=revenue-overview"
          />
          </div>

          <div className="xl:col-span-4">
          <DashboardPanel
            title="Recent Loads"
            eyebrow="Dispatch board"
            action={
              <Link href="/loads" className="text-sm font-semibold text-blue-600">
                View all
              </Link>
            }
          >
            <PremiumTable
              rows={recentLoads}
              getRowKey={(load) => load.id}
              getRowHref={(load) => `/?details=${load.id}`}
              columns={[
                {
                  key: "load",
                  label: "Load",
                  render: (load) => (
                    <span className="block">
                      <span className="block font-semibold text-slate-950">
                        {load.reference}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {formatLoadLane(load)}
                      </span>
                    </span>
                  ),
                },
                {
                  key: "status",
                  label: "Status",
                  render: (load) => (
                    <PremiumStatusBadge
                      label={load.status.replace("_", " ")}
                      tone={
                        load.status === "delivered" || load.status === "invoiced"
                          ? "green"
                          : load.status === "pending"
                            ? "amber"
                            : "blue"
                      }
                    />
                  ),
                },
                {
                  key: "rate",
                  label: "Rate",
                  align: "right",
                  render: (load) => (
                    <span className="font-semibold text-slate-950">
                      {formatCurrency(load.rate)}
                    </span>
                  ),
                },
              ]}
            />
          </DashboardPanel>
          </div>
        </section>

        <section className="grid items-stretch gap-6 xl:grid-cols-12">
          <div className="xl:col-span-4">
            <EnterpriseBarChart
              title="Profit Overview"
              subtitle={`${profitMargin}% estimated margin`}
              data={profitTrend}
              valuePrefix="$"
              href="/analytics?details=profit-trend"
            />
          </div>

          <DashboardPanel title="Top Brokers" eyebrow="Revenue concentration" className="xl:col-span-4">
            <div className="space-y-2">
              {topBrokers.map((broker) => (
                <Link
                  key={broker.label}
                  href="/loads"
                  className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] px-3 py-2.5 text-sm transition hover:border-blue-200 hover:bg-blue-50/50"
                >
                  <span>
                    <span className="block font-semibold text-[#111827]">{broker.label}</span>
                    <span className="mt-0.5 block text-xs font-medium text-[#6B7280]">
                      {broker.loads} loads
                    </span>
                  </span>
                  <span className="font-semibold text-[#111827]">
                    {formatCurrency(broker.revenue)}
                  </span>
                </Link>
              ))}
            </div>
          </DashboardPanel>

          <DashboardPanel title="Alerts" eyebrow="Exceptions" className="xl:col-span-4">
            <div className="space-y-3">
              {visibleActions.slice(0, 3).map((action) => (
                <NovaInsightCard
                  key={action.title}
                  title={action.title}
                  actionLabel={action.label}
                  href={action.href}
                  tone={
                    action.severity === "danger"
                      ? "red"
                      : action.severity === "warning"
                        ? "amber"
                        : "green"
                  }
                />
              ))}
            </div>
          </DashboardPanel>
        </section>

        <section className="grid items-stretch gap-6 xl:grid-cols-12">
          <DashboardPanel title="Today's Operations" eyebrow="Live status" className="xl:col-span-3">
            <div className="grid gap-2">
              {[
                { label: "Dispatch waiting", value: loadCounts.pending, tone: "amber" as const },
                { label: "Drivers on duty", value: driverMetrics.activeDrivers, tone: "green" as const },
                { label: "Trucks in maintenance", value: fleetMetrics.maintenanceTrucks, tone: "blue" as const },
                { label: "Loads requiring attention", value: attentionLoads.length, tone: "red" as const },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border border-[#DDE2EA] bg-[#F5F7FA] px-3 py-2.5"
                >
                  <span className="text-sm font-medium text-[#374151]">{item.label}</span>
                  <PremiumStatusBadge label={item.value.toString()} tone={item.tone} />
                </div>
              ))}
            </div>
          </DashboardPanel>
          <div className="xl:col-span-3">
          <EnterpriseAreaChart
            title="Cash Flow"
            subtitle="Pending payments"
            data={cashFlowTrend}
            valuePrefix="$"
            href="/analytics?details=cash-flow"
          />
          </div>
          <div className="xl:col-span-3">
          <EnterpriseDonutChart
            title="Fleet Utilization"
            subtitle="Assigned truck utilization"
            value={fleetUtilization}
            label="utilized"
            href="/analytics?details=fleet-utilization"
          />
          </div>
          <div className="xl:col-span-3">
          <EnterpriseLineChart
            title="Fuel Cost Trend"
            subtitle={`${fuelRecords.length} fuel records`}
            data={fuelCostTrend}
            valuePrefix="$"
            height={190}
            href="/analytics?details=fuel-cost-trend"
          />
          </div>
        </section>

        <section className="grid items-stretch gap-6 xl:grid-cols-12">
          <div className="xl:col-span-6">
          <EnterpriseHorizontalBarChart
            title="Driver Performance"
            subtitle="On-time, documents, safety, and utilization"
            data={driverPerformance}
            href="/analytics?details=driver-performance"
          />
          </div>
          <div className="xl:col-span-6">
          <EnterpriseLineChart
            title="Maintenance Cost Trend"
            subtitle={`${fleetMetrics.openMaintenance} open maintenance items`}
            data={maintenanceCostTrend}
            valuePrefix="$"
            height={210}
            href="/analytics?details=maintenance-cost-trend"
          />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-12">
          <DashboardPanel title="Nova AI Command Center" eyebrow="Operations manager" className="xl:col-span-12">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {visibleActions.map((action) => (
                <NovaInsightCard
                  key={action.title}
                  title={action.title}
                  actionLabel={action.label}
                  href={action.href}
                  tone={
                    action.severity === "danger"
                      ? "red"
                      : action.severity === "warning"
                        ? "amber"
                        : "green"
                  }
                />
              ))}
            </div>
          </DashboardPanel>
        </section>

        <section className="grid gap-6 xl:grid-cols-4">
          <DashboardPanel title="Pending Invoices" eyebrow="AR">
            <div className="space-y-2">
              {packetSummaries.slice(0, 4).map(({ load, summary }) => (
                <Link key={load.id} href={`/documents/packets/${load.id}`} className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] px-3 py-2 text-sm transition hover:border-blue-200">
                  <span className="font-semibold text-slate-950">{load.reference}</span>
                  <span className="text-slate-500">{summary.invoiceDraft ? "Ready" : "Draft needed"}</span>
                </Link>
              ))}
            </div>
          </DashboardPanel>

          <DashboardPanel title="Driver Expirations" eyebrow="CDL / medical">
            <div className="space-y-2">
              {upcomingDriverExpirations.map(({ driver, expiresAt, type }) => (
                <Link key={`${driver.id}-${type}`} href={`/drivers/${driver.id}`} className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] px-3 py-2 text-sm transition hover:border-blue-200">
                  <span className="font-semibold text-slate-950">{driver.name}</span>
                  <span className="text-slate-500">{type} · {expiresAt}</span>
                </Link>
              ))}
            </div>
          </DashboardPanel>

          <DashboardPanel title="Open Maintenance" eyebrow="Shop">
            <div className="space-y-2">
              {openMaintenance.map((record) => (
                <Link key={record.id} href="/fleet/maintenance" className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] px-3 py-2 text-sm transition hover:border-blue-200">
                  <span className="font-semibold text-slate-950">{record.type}</span>
                  <span className="text-slate-500">{record.status.replace("_", " ")}</span>
                </Link>
              ))}
            </div>
          </DashboardPanel>

          <DashboardPanel title="Recent Activity" eyebrow="Live feed">
            <div className="space-y-2">
              {recentActivity.map((activity) => (
                <Link
                  key={activity.id}
                  href={activity.href}
                  className="flex gap-3 rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] p-2.5 transition hover:border-blue-200"
                >
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#2563EB]" />
                  <span>
                    <span className="block text-sm font-semibold text-slate-950">
                      {activity.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {activity.meta}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </DashboardPanel>
        </section>
        {selectedLoad ? (
          <DetailSlideOver
            title={selectedLoad.reference}
            subtitle={formatLoadLane(selectedLoad)}
            closeHref="/"
          >
            <DetailSection title="Load Profile">
              <DetailGrid
                items={[
                  { label: "Status", value: selectedLoad.status.replace("_", " ") },
                  { label: "Rate", value: formatCurrency(selectedLoad.rate) },
                  { label: "Miles", value: selectedLoad.miles.toLocaleString() },
                  { label: "Pickup", value: `${selectedLoad.origin.city}, ${selectedLoad.origin.state}` },
                  { label: "Delivery", value: `${selectedLoad.destination.city}, ${selectedLoad.destination.state}` },
                  { label: "Tracking", value: selectedLoad.trackingEnabled ? "Live" : "Off" },
                ]}
              />
            </DetailSection>
            <DetailSection title="Documents, Invoices, Timeline & Notes">
              <p className="text-sm leading-6 text-slate-600">
                Open Dispatch for the full load execution record, including documents, invoice, tracking timeline, broker notes, and Nova recommendations.
              </p>
              <Link href={`/loads?details=${selectedLoad.id}`} className="mt-3 inline-block text-sm font-semibold text-blue-600">
                Open in Dispatch
              </Link>
            </DetailSection>
          </DetailSlideOver>
        ) : null}
      </div>
    </div>
  );
}
