import Link from "next/link";
import MetricCard from "@/components/MetricCard";
import PageHeader from "@/components/PageHeader";
import DriverProfileSubNav from "@/components/drivers/DriverProfileSubNav";
import SafetyEventCard from "@/components/drivers/SafetyEventCard";
import { requireDriver } from "@/lib/drivers/require-driver";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getDriverService } from "@/lib/services/drivers";

type PageProps = { params: Promise<{ id: string }> };

export default async function DriverSafetyPage({ params }: PageProps) {
  const { id } = await params;
  const driver = await requireDriver(id);
  const events = await getDriverService().listSafetyEvents(getActiveTenantId(), id);
  const openCount = events.filter((event) => event.status === "open").length;

  return (
    <>
      <Link href={`/drivers/${driver.id}`} className="text-sm font-medium text-blue-400">
        ← Back to Profile
      </Link>
      <PageHeader title="Safety Events" subtitle={driver.name} className="mt-4" />
      <div className="mt-8"><DriverProfileSubNav driverId={driver.id} /></div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <MetricCard title="Total Events" value={events.length.toString()} />
        <MetricCard title="Open Events" value={openCount.toString()} />
        <MetricCard
          title="Resolved"
          value={events.filter((event) => event.status === "resolved").length.toString()}
        />
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {events.map((event) => (
          <SafetyEventCard key={event.id} event={event} driverName={driver.name} />
        ))}
      </div>
    </>
  );
}
