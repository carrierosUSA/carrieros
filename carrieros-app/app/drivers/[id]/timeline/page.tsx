import Link from "next/link";
import Card from "@/components/Card";
import PageHeader from "@/components/PageHeader";
import DriverProfileSubNav from "@/components/drivers/DriverProfileSubNav";
import DriverTimeline from "@/components/drivers/DriverTimeline";
import { requireDriver } from "@/lib/drivers/require-driver";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getDriverService } from "@/lib/services/drivers";

type PageProps = { params: Promise<{ id: string }> };

export default async function DriverTimelinePage({ params }: PageProps) {
  const { id } = await params;
  const driver = await requireDriver(id);
  const events = await getDriverService().listTimeline(getActiveTenantId(), id);

  return (
    <>
      <Link href={`/drivers/${driver.id}`} className="text-sm font-medium text-blue-400">
        ← Back to Profile
      </Link>
      <PageHeader title="Driver Timeline" subtitle={driver.name} className="mt-4" />
      <div className="mt-8"><DriverProfileSubNav driverId={driver.id} /></div>
      <div className="mt-8">
        <Card>
          <DriverTimeline events={events} />
        </Card>
      </div>
    </>
  );
}
