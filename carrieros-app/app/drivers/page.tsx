import Link from "next/link";
import Card from "@/components/Card";
import MetricCard from "@/components/MetricCard";
import NovaAlert from "@/components/NovaAlert";
import PageHeader from "@/components/PageHeader";
import DriversSubNav from "@/components/drivers/DriversSubNav";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getDriverService } from "@/lib/services/drivers";

export default async function DriversDashboardPage() {
  const tenantId = getActiveTenantId();
  const metrics = await getDriverService().getDriverMetrics(tenantId);

  return (
    <>
      <PageHeader
        title="Drivers"
        subtitle="Workforce dashboard for hiring, compliance, safety, and payroll."
        action={
          <Link
            href="/drivers/hiring/new"
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            + Hire Driver
          </Link>
        }
      />

      <div className="mt-8">
        <DriversSubNav />
      </div>

      {metrics.expiringCompliance > 0 || metrics.openSafetyEvents > 0 ? (
        <NovaAlert
          className="mt-8"
          message={`${metrics.expiringCompliance} compliance item${metrics.expiringCompliance === 1 ? "" : "s"} and ${metrics.openSafetyEvents} open safety event${metrics.openSafetyEvents === 1 ? "" : "s"} need attention.`}
        />
      ) : (
        <NovaAlert className="mt-8" message="Driver workforce compliance is healthy." />
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard title="Total Drivers" value={metrics.totalDrivers.toString()} />
        <MetricCard title="Active Drivers" value={metrics.activeDrivers.toString()} />
        <MetricCard title="Onboarding" value={metrics.onboardingDrivers.toString()} />
        <MetricCard
          title="Compliance Alerts"
          value={metrics.expiringCompliance.toString()}
        />
        <MetricCard title="Open Safety Events" value={metrics.openSafetyEvents.toString()} />
        <MetricCard title="Pending Time Off" value={metrics.pendingTimeOff.toString()} />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <h3 className="font-semibold text-zinc-100">Directory</h3>
          <p className="mt-2 text-sm text-zinc-400">Search and filter your driver roster.</p>
          <Link
            href="/drivers/directory"
            className="mt-4 inline-block text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            Open Directory →
          </Link>
        </Card>
        <Card>
          <h3 className="font-semibold text-zinc-100">Hiring</h3>
          <p className="mt-2 text-sm text-zinc-400">Onboard new drivers with compliance fields.</p>
          <Link
            href="/drivers/hiring/new"
            className="mt-4 inline-block text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            Start Hiring →
          </Link>
        </Card>
        <Card>
          <h3 className="font-semibold text-zinc-100">Safety</h3>
          <p className="mt-2 text-sm text-zinc-400">Review safety events across the fleet.</p>
          <Link
            href="/drivers/directory?status=active"
            className="mt-4 inline-block text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            View Drivers →
          </Link>
        </Card>
        <Card>
          <h3 className="font-semibold text-zinc-100">Payroll</h3>
          <p className="mt-2 text-sm text-zinc-400">Track compensation from driver profiles.</p>
          <Link
            href="/drivers/directory"
            className="mt-4 inline-block text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            Manage Payroll →
          </Link>
        </Card>
      </div>
    </>
  );
}
