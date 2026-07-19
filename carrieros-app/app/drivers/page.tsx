import Link from "next/link";
import DriverDashboardClient from "@/components/drivers/DriverDashboardClient";
import DriverDashboardStats from "@/components/drivers/DriverDashboardStats";
import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import { buildDriverDashboardStats } from "@/lib/drivers/driver-board";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getDriverService } from "@/lib/services/drivers";
import { getLoadService } from "@/lib/services/loads";

export default async function DriversDashboardPage() {
  const tenantId = getActiveTenantId();
  const driverService = getDriverService();
  const loadService = getLoadService();

  const [drivers, loads] = await Promise.all([
    driverService.listDrivers(tenantId),
    loadService.listLoads(tenantId),
  ]);

  const stats = buildDriverDashboardStats(drivers, loads);

  return (
    <PageShell
      eyebrow="People"
      title="Drivers"
      description="Your full roster — status, compliance, and contact in one place."
      action={
        <Link href="/drivers/hiring/new" className="transpo-btn-primary">
          Add Driver
        </Link>
      }
    >
      <FadeIn className="space-y-4">
        <DriverDashboardStats stats={stats} />
        <DriverDashboardClient drivers={drivers} loads={loads} />
      </FadeIn>
    </PageShell>
  );
}
