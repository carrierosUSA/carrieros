import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import DriverProfileSubNav from "@/components/drivers/DriverProfileSubNav";
import { TimeOffForm, TimeOffRecordCard } from "@/components/drivers/TimeOffRecordCard";
import { requireDriver } from "@/lib/drivers/require-driver";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getDriverService } from "@/lib/services/drivers";

type PageProps = { params: Promise<{ id: string }> };

export default async function DriverTimeOffPage({ params }: PageProps) {
  const { id } = await params;
  const driver = await requireDriver(id);
  const entries = await getDriverService().listTimeOff(getActiveTenantId(), id);

  return (
    <>
      <Link href={`/drivers/${driver.id}`} className="text-sm font-medium text-blue-400">
        ← Back to Profile
      </Link>
      <PageHeader title="Time Off" subtitle={driver.name} className="mt-4" />
      <div className="mt-8"><DriverProfileSubNav driverId={driver.id} /></div>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <TimeOffForm driverId={driver.id} />
        <div className="space-y-5">
          {entries.map((entry) => (
            <TimeOffRecordCard key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </>
  );
}
