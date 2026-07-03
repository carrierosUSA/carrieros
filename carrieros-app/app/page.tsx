import Link from "next/link";
import DashboardPanel from "@/components/premium/DashboardPanel";
import PremiumMetricCard from "@/components/premium/MetricCard";
import NovaInsightCard from "@/components/premium/NovaInsightCard";
import PremiumStatusBadge from "@/components/premium/StatusBadge";
import PremiumTable from "@/components/premium/PremiumTable";
import { getBrokerById } from "@/lib/data/brokers";
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

export default async function Home() {
  const company = getActiveCompany();
  const tenantId = company.tenantId;
  const loadService = getLoadService();
  const documentService = getDocumentService();
  const driverService = getDriverService();
  const fleetService = getFleetService();
  const trackingService = getTrackingService();

  const [loads, loadCounts, driverMetrics, fleetMetrics] = await Promise.all([
    loadService.listLoads(tenantId),
    loadService.countByStatus(tenantId),
    driverService.getDriverMetrics(tenantId),
    fleetService.getFleetMetrics(tenantId),
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
  const readyPackets = packetSummaries.filter((entry) => entry.summary.readyToSend);
  const brokerRevenue = loads.reduce<Record<string, number>>((totals, load) => {
    const key = load.brokerId ?? "direct";
    totals[key] = (totals[key] ?? 0) + load.rate;
    return totals;
  }, {});
  const topBrokers = Object.entries(brokerRevenue)
    .map(([brokerId, revenue]) => ({
      name:
        brokerId === "direct"
          ? "Direct customers"
          : getBrokerById(brokerId)?.name ?? "Unknown broker",
      revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3);
  const revenueBars = [
    { label: "Booked", value: revenueMtd, width: "w-full" },
    {
      label: "Pending pay",
      value: pendingPayments,
      width:
        revenueMtd > 0 && pendingPayments / revenueMtd > 0.66
          ? "w-2/3"
          : revenueMtd > 0 && pendingPayments / revenueMtd > 0.33
            ? "w-1/2"
            : "w-1/3",
    },
    {
      label: "Ready packets",
      value: readyPackets.reduce((total, entry) => total + entry.load.rate, 0),
      width: readyPackets.length > 1 ? "w-1/2" : "w-1/4",
    },
  ];
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
  const alerts = [
    `${attentionLoads.length} loads need attention`,
    `${missingDocs} packet docs missing`,
    `${fleetMetrics.openMaintenance} fleet items open`,
  ];

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-4 text-slate-950 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              CarrierOS Command Center
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Good afternoon, Owner.
            </h1>
            <p className="mt-3 text-base text-slate-500">{company.name}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/loads/new"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              New Load
            </Link>
            <Link
              href="/finance"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300"
            >
              Finance
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <PremiumMetricCard
            label="Active Loads"
            value={activeLoads.length.toString()}
            detail={`${loadCounts.in_transit} in transit`}
            accent="blue"
          />
          <PremiumMetricCard
            label="Revenue MTD"
            value={formatCurrency(revenueMtd)}
            detail="Booked freight"
            accent="emerald"
          />
          <PremiumMetricCard
            label="Pending Payments"
            value={formatCurrency(pendingPayments)}
            detail="AR watch"
            accent="amber"
          />
          <PremiumMetricCard
            label="Active Trucks"
            value={(fleetMetrics.assignedTrucks + fleetMetrics.availableTrucks).toString()}
            detail={`${fleetMetrics.maintenanceTrucks} in shop`}
            accent="blue"
          />
          <PremiumMetricCard
            label="Drivers"
            value={driverMetrics.totalDrivers.toString()}
            detail={`${driverMetrics.activeDrivers} active`}
            accent="slate"
          />
          <PremiumMetricCard
            label="Compliance Alerts"
            value={complianceAlerts.toString()}
            detail="Needs review"
            accent={complianceAlerts > 0 ? "rose" : "emerald"}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <DashboardPanel title="Revenue Overview" className="min-h-[320px]">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-5xl font-semibold tracking-tight text-slate-950">
                  {formatCurrency(revenueMtd)}
                </p>
                <p className="mt-2 text-sm text-slate-500">Month-to-date revenue</p>
              </div>
              <div className="rounded-3xl bg-slate-950 p-5 text-white">
                <p className="text-sm text-slate-400">Estimated margin</p>
                <p className="mt-2 text-3xl font-semibold">{profitMargin}%</p>
              </div>
            </div>
            <div className="mt-8 space-y-5">
              {revenueBars.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-600">{item.label}</span>
                    <span className="text-slate-500">{formatCurrency(item.value)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div className={`h-3 rounded-full bg-slate-950 ${item.width}`} />
                  </div>
                </div>
              ))}
            </div>
          </DashboardPanel>

          <DashboardPanel title="Nova AI Priorities" eyebrow="Command Assistant">
            <div className="space-y-3">
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

        <section className="grid gap-6 xl:grid-cols-3">
          <DashboardPanel
            title="Recent Loads"
            className="xl:col-span-2"
            action={
              <Link href="/loads" className="text-sm font-semibold text-slate-500">
                View all
              </Link>
            }
          >
            <PremiumTable
              rows={recentLoads}
              getRowKey={(load) => load.id}
              columns={[
                {
                  key: "load",
                  label: "Load",
                  render: (load) => (
                    <Link href={`/loads/${load.id}`} className="block">
                      <span className="block font-semibold text-slate-950">
                        {load.reference}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {formatLoadLane(load)}
                      </span>
                    </Link>
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

          <DashboardPanel title="Alerts">
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
                >
                  {alert}
                </div>
              ))}
            </div>
          </DashboardPanel>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <DashboardPanel title="Top Brokers">
            <div className="space-y-4">
              {topBrokers.map((broker, index) => (
                <div key={broker.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                      {index + 1}
                    </span>
                    <p className="font-medium text-slate-900">{broker.name}</p>
                  </div>
                  <p className="font-semibold text-slate-950">
                    {formatCurrency(broker.revenue)}
                  </p>
                </div>
              ))}
            </div>
          </DashboardPanel>

          <DashboardPanel title="Profit Overview">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Revenue</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatCurrency(revenueMtd)}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Fuel</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatCurrency(fleetMetrics.monthlyFuelCost)}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-950 p-4 text-white">
                <p className="text-sm text-slate-400">Profit</p>
                <p className="mt-2 text-xl font-semibold">
                  {formatCurrency(estimatedProfit)}
                </p>
              </div>
            </div>
          </DashboardPanel>
        </section>
      </div>
    </div>
  );
}
