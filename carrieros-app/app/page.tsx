import Link from "next/link";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import MetricCard from "@/components/MetricCard";
import NovaAlphaSummary from "@/components/alpha/NovaAlphaSummary";
import { getActiveCompany } from "@/lib/data/tenant";
import { getDriverService } from "@/lib/services/drivers";
import { getFleetService } from "@/lib/services/fleet";
import { getLoadService } from "@/lib/services/loads";

export default async function Home() {
  const company = getActiveCompany();
  const tenantId = company.tenantId;
  const loadService = getLoadService();
  const driverService = getDriverService();
  const fleetService = getFleetService();

  const [loads, loadCounts, driverMetrics, fleetMetrics] = await Promise.all([
    loadService.listLoads(tenantId),
    loadService.countByStatus(tenantId),
    driverService.getDriverMetrics(tenantId),
    fleetService.getFleetMetrics(tenantId),
  ]);

  const attentionLoads = loads.filter(
    (load) => load.complianceStatus === "attention",
  );
  const pendingAssignmentLoad = loads.find((load) => !load.driverId || !load.truckId);
  const deliveredNotInvoiced = loads.find(
    (load) => load.status === "delivered" && !load.invoiceId,
  );
  const alphaActions = [
    ...(pendingAssignmentLoad
      ? [
          {
            title: "Finish dispatch assignment",
            description:
              "A load is missing a driver or truck. Assign both to move the workflow forward.",
            href: `/loads/${pendingAssignmentLoad.id}`,
            severity: "warning" as const,
          },
        ]
      : []),
    ...(deliveredNotInvoiced
      ? [
          {
            title: "Close delivered load",
            description:
              "A delivered load has documents but no invoice yet. Finance needs this surfaced.",
            href: `/loads/${deliveredNotInvoiced.id}`,
            severity: "warning" as const,
          },
        ]
      : []),
    ...(driverMetrics.expiringCompliance > 0
      ? [
          {
            title: "Review driver compliance",
            description:
              "Nova found driver license or medical card items that need review.",
            href: "/drivers/directory",
            severity: "danger" as const,
          },
        ]
      : []),
    ...(fleetMetrics.openMaintenance > 0
      ? [
          {
            title: "Check fleet maintenance",
            description:
              "Open maintenance items can block dispatch readiness if ignored.",
            href: "/fleet/maintenance",
            severity: "warning" as const,
          },
        ]
      : []),
  ];

  return (
    <>
      <PageHeader
        eyebrow="Welcome back"
        title={company.name}
        subtitle="AI-powered command system for the whole carrier business."
        variant="hero"
        className="mb-10"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <NovaAlphaSummary
            companyName={company.name}
            actions={
              alphaActions.length > 0
                ? alphaActions
                : [
                    {
                      title: "Ready for alpha workflow",
                      description:
                        "Create a load, assign a driver and truck, then verify linked profiles update.",
                      href: "/loads/new",
                      severity: "success",
                    },
                  ]
            }
          />

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Business Snapshot</p>
                <h2 className="mt-1 text-2xl font-semibold text-zinc-100">
                  Command Center
                </h2>
              </div>
              <Badge
                text={attentionLoads.length > 0 ? "Needs Review" : "All Clear"}
                type={attentionLoads.length > 0 ? "warning" : "success"}
              />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard title="Active Loads" value={loadCounts.all.toString()} />
              <MetricCard
                title="Drivers"
                value={driverMetrics.totalDrivers.toString()}
              />
              <MetricCard
                title="Trucks"
                value={fleetMetrics.totalTrucks.toString()}
              />
              <MetricCard
                title="Nova Alerts"
                value={alphaActions.length.toString()}
              />
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <h3 className="font-semibold text-zinc-100">Dispatch</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Create loads, assign resources, and track execution.
              </p>
              <Link
                href="/loads"
                className="mt-4 inline-block text-sm font-medium text-blue-400 hover:text-blue-300"
              >
                Open Dispatch →
              </Link>
            </Card>

            <Card>
              <h3 className="font-semibold text-zinc-100">Fleet</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Trucks, trailers, maintenance.
              </p>
              <Link
                href="/fleet"
                className="mt-4 inline-block text-sm font-medium text-blue-400 hover:text-blue-300"
              >
                Open Fleet →
              </Link>
            </Card>

            <Card>
              <h3 className="font-semibold text-zinc-100">Drivers</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Compliance, assignment, payroll, safety.
              </p>
              <Link
                href="/drivers"
                className="mt-4 inline-block text-sm font-medium text-blue-400 hover:text-blue-300"
              >
                Open Drivers →
              </Link>
            </Card>

            <Card>
              <h3 className="font-semibold text-zinc-100">Business Control</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Finance, documents, insurance, taxes, automation.
              </p>
              <Link
                href="/documents"
                className="mt-4 inline-block text-sm font-medium text-blue-400 hover:text-blue-300"
              >
                Open Documents →
              </Link>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold text-zinc-100">Alpha Test Path</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Use this path to validate the connected carrier workflow today.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <Link
                href="/loads/new"
                className="rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Start Demo Workflow
              </Link>
              <Link
                href="/loads/load-24001"
                className="rounded-xl border border-zinc-700 px-5 py-3 text-center text-sm font-semibold text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-800"
              >
                Show Me Missing Assignment
              </Link>
              <Link
                href="/drivers/onkar-singh"
                className="rounded-xl border border-zinc-700 px-5 py-3 text-center text-sm font-semibold text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-800"
              >
                View Driver Profile
              </Link>
              <Link
                href="/fleet/trucks/truck-102"
                className="rounded-xl border border-zinc-700 px-5 py-3 text-center text-sm font-semibold text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-800"
              >
                View Truck Profile
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
