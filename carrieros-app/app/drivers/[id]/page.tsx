import Link from "next/link";
import Card from "@/components/Card";
import MetricCard from "@/components/MetricCard";
import PageHeader from "@/components/PageHeader";
import DriverProfileSubNav from "@/components/drivers/DriverProfileSubNav";
import DriverStatusBadge from "@/components/drivers/DriverStatusBadge";
import NovaDriverInsights from "@/components/drivers/NovaDriverInsights";
import LoadStatusBadge from "@/components/loads/LoadStatusBadge";
import { requireDriver } from "@/lib/drivers/require-driver";
import {
  formatPayRate,
  getTruckLabel,
} from "@/lib/services/drivers/driver-helpers";
import { formatLoadLane } from "@/lib/services/loads/load-helpers";
import { getDriverService } from "@/lib/services/drivers";
import { getLoadService } from "@/lib/services/loads";
import { getActiveTenantId } from "@/lib/data/tenant";

type DriverProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function DriverProfilePage({ params }: DriverProfilePageProps) {
  const { id } = await params;
  const tenantId = getActiveTenantId();
  const driver = await requireDriver(id);
  const driverService = getDriverService();
  const loadService = getLoadService();

  const [insights, performance, safetyEvents, timeOff, loads] = await Promise.all([
    driverService.getNovaInsights(tenantId, id),
    driverService.listPerformance(tenantId, id),
    driverService.listSafetyEvents(tenantId, id),
    driverService.listTimeOff(tenantId, id),
    loadService.listLoads(tenantId),
  ]);
  const assignedLoads = loads.filter((load) => load.driverId === driver.id);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/drivers/directory"
          className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
        >
          ← Back to Directory
        </Link>
        <Link
          href={`/drivers/${driver.id}/edit`}
          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-800"
        >
          Edit Driver
        </Link>
      </div>

      <PageHeader
        title={driver.name}
        subtitle={`${driver.role} · ${driver.location}`}
        className="mt-4"
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <DriverStatusBadge status={driver.status} />
      </div>

      <div className="mt-8">
        <DriverProfileSubNav driverId={driver.id} />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Pay Rate" value={formatPayRate(driver)} />
        <MetricCard title="Truck" value={getTruckLabel(driver.truckId) ?? "Unassigned"} />
        <MetricCard title="Open Safety" value={safetyEvents.filter((e) => e.status === "open").length.toString()} />
        <MetricCard title="Time Off Requests" value={timeOff.length.toString()} />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="font-semibold text-zinc-100">Contact & Employment</h2>
          <div className="mt-4 grid gap-3 text-sm text-zinc-300">
            <p>
              <strong className="text-zinc-100">Email:</strong> {driver.email}
            </p>
            <p>
              <strong className="text-zinc-100">Phone:</strong> {driver.phone}
            </p>
            <p>
              <strong className="text-zinc-100">Hire Date:</strong> {driver.hireDate}
            </p>
            <p>
              <strong className="text-zinc-100">License:</strong> {driver.licenseClass} ·{" "}
              {driver.licenseExpiresAt}
            </p>
            <p>
              <strong className="text-zinc-100">Medical:</strong> {driver.medicalExpiresAt}
            </p>
          </div>
        </Card>

        <NovaDriverInsights insights={insights} />

        <Card>
          <h2 className="font-semibold text-zinc-100">Performance Snapshot</h2>
          <div className="mt-4 space-y-3">
            {performance.slice(0, 3).map((metric) => (
              <div key={metric.id}>
                <p className="text-sm text-zinc-500">{metric.label}</p>
                <p className="text-lg font-semibold text-zinc-100">{metric.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-zinc-100">Current Load Assignments</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Dispatch assignments connected to this driver.
            </p>
          </div>
          <Link
            href="/loads"
            className="text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            Open Dispatch →
          </Link>
        </div>

        <div className="mt-5 grid gap-3">
          {assignedLoads.length > 0 ? (
            assignedLoads.slice(0, 3).map((load) => (
              <Link
                key={load.id}
                href={`/loads/${load.id}`}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-zinc-700"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-400">
                      {load.reference}
                    </p>
                    <p className="mt-1 text-sm text-zinc-300">
                      {formatLoadLane(load)}
                    </p>
                  </div>
                  <LoadStatusBadge status={load.status} />
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-700 p-5">
              <p className="text-sm font-medium text-zinc-100">
                No active load assignment
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Assign this driver from a load detail page to test the alpha flow.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
