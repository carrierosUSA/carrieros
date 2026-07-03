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
    <div className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <div className="mx-auto max-w-[1500px] space-y-6 px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
        <header className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white px-6 py-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:px-8">
          <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
                Live carrier command
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
                CarrierOS Dashboard
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-500">
                {company.name} · Owner view
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/loads/new"
                className="rounded-2xl bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white shadow-xl shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Create load
              </Link>
              <Link
                href="/finance"
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300"
              >
                Open finance
              </Link>
            </div>
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

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.7fr)]">
          <DashboardPanel
            title="Revenue Overview"
            eyebrow="Month to date"
            className="min-h-[390px]"
          >
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
                <p className="text-sm text-slate-400">Booked revenue</p>
                <p className="mt-3 text-5xl font-semibold tracking-[-0.05em]">
                  {formatCurrency(revenueMtd)}
                </p>
                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs text-slate-400">Pending</p>
                    <p className="mt-2 text-lg font-semibold">
                      {formatCurrency(pendingPayments)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs text-slate-400">Margin</p>
                    <p className="mt-2 text-lg font-semibold">{profitMargin}%</p>
                  </div>
                </div>
              </div>

              <div className="flex min-h-[260px] flex-col justify-end rounded-[1.5rem] border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-5">
                <div className="grid h-56 grid-cols-7 items-end gap-3 border-b border-l border-slate-200 px-3 pb-3">
                  {[44, 62, 51, 74, 58, 86, 69].map((height, index) => (
                    <div key={height} className="flex h-full items-end">
                      <div
                        className={`w-full rounded-t-xl ${
                          index === 5 ? "bg-slate-950" : "bg-blue-200"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-3">
                  {revenueBars.map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="w-24 text-xs font-medium text-slate-500">
                        {item.label}
                      </span>
                      <div className="h-2 flex-1 rounded-full bg-slate-100">
                        <div className={`h-2 rounded-full bg-slate-950 ${item.width}`} />
                      </div>
                      <span className="w-20 text-right text-xs font-semibold text-slate-700">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
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

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(330px,0.65fr)]">
          <DashboardPanel
            title="Recent Loads"
            eyebrow="Dispatch"
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

          <DashboardPanel title="Alerts" eyebrow="Needs attention">
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
                >
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  {alert}
                </div>
              ))}
            </div>
          </DashboardPanel>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.8fr_0.8fr_1fr]">
          <DashboardPanel title="Profit Overview" eyebrow="Operating view">
            <div className="grid gap-4">
              <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
                <p className="text-sm text-slate-400">Estimated profit</p>
                <p className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                  {formatCurrency(estimatedProfit)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Fuel</p>
                  <p className="mt-2 font-semibold text-slate-950">
                    {formatCurrency(fleetMetrics.monthlyFuelCost)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Margin</p>
                  <p className="mt-2 font-semibold text-slate-950">{profitMargin}%</p>
                </div>
              </div>
            </div>
          </DashboardPanel>

          <DashboardPanel title="Top Brokers" eyebrow="Revenue">
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

          <DashboardPanel title="Recent Activity" eyebrow="Live feed">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <Link
                  key={activity.id}
                  href={activity.href}
                  className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:bg-white hover:shadow-sm"
                >
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">
                      {activity.title}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {activity.meta}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </DashboardPanel>
        </section>
      </div>
    </div>
  );
}
