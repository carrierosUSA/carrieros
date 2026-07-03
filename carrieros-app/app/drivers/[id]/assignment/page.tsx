import Link from "next/link";
import Card from "@/components/Card";
import PageHeader from "@/components/PageHeader";
import DriverAssignmentForm from "@/components/drivers/DriverAssignmentForm";
import DriverProfileSubNav from "@/components/drivers/DriverProfileSubNav";
import { requireDriver } from "@/lib/drivers/require-driver";
import { getTruckLabel } from "@/lib/services/drivers/driver-helpers";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getFleetService } from "@/lib/services/fleet";

type PageProps = { params: Promise<{ id: string }> };

export default async function DriverAssignmentPage({ params }: PageProps) {
  const { id } = await params;
  const driver = await requireDriver(id);
  const trucks = await getFleetService().listTrucks(getActiveTenantId());

  return (
    <>
      <Link href={`/drivers/${driver.id}`} className="text-sm font-medium text-blue-400">
        ← Back to Profile
      </Link>
      <PageHeader title="Driver Assignment" subtitle={driver.name} className="mt-4" />
      <div className="mt-8"><DriverProfileSubNav driverId={driver.id} /></div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-zinc-100">Current Assignment</h2>
          <p className="mt-3 text-sm text-zinc-300">
            Truck: {getTruckLabel(driver.truckId) ?? "Unassigned"}
          </p>
        </Card>
        <Card>
          <DriverAssignmentForm
            driverId={driver.id}
            trucks={trucks}
            currentTruckId={driver.truckId}
          />
        </Card>
      </div>
    </>
  );
}
