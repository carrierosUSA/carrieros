import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import DriverPerformanceCard from "@/components/drivers/DriverPerformanceCard";
import DriverProfileSubNav from "@/components/drivers/DriverProfileSubNav";
import { requireDriver } from "@/lib/drivers/require-driver";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getDriverService } from "@/lib/services/drivers";

type PageProps = { params: Promise<{ id: string }> };

export default async function DriverPerformancePage({ params }: PageProps) {
  const { id } = await params;
  const driver = await requireDriver(id);
  const metrics = await getDriverService().listPerformance(getActiveTenantId(), id);

  return (
    <>
      <Link href={`/drivers/${driver.id}`} className="text-sm font-medium text-blue-400">
        ← Back to Profile
      </Link>
      <PageHeader title="Performance Metrics" subtitle={driver.name} className="mt-4" />
      <div className="mt-8"><DriverProfileSubNav driverId={driver.id} /></div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <DriverPerformanceCard key={metric.id} metric={metric} />
        ))}
      </div>
    </>
  );
}
