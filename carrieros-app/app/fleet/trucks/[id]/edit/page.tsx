import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import FleetSubNav from "@/components/fleet/FleetSubNav";
import TruckForm from "@/components/fleet/TruckForm";
import { updateTruckAction } from "@/app/fleet/actions";
import { getActiveTenantId } from "@/lib/data/tenant";
import { formatTruckLabel } from "@/lib/services/fleet/fleet-helpers";
import { getFleetService } from "@/lib/services/fleet";

type EditTruckPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTruckPage({ params }: EditTruckPageProps) {
  const { id } = await params;
  const tenantId = getActiveTenantId();
  const fleetService = getFleetService();

  const [truck, drivers] = await Promise.all([
    fleetService.getTruck(tenantId, id),
    fleetService.listDrivers(tenantId),
  ]);

  if (!truck) {
    notFound();
  }

  return (
    <>
      <Link
        href={`/fleet/trucks/${truck.id}`}
        className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
      >
        ← Back to Truck
      </Link>

      <PageHeader
        title={`Edit Unit ${truck.unitNumber}`}
        subtitle={formatTruckLabel(truck)}
        className="mt-4"
      />

      <div className="mt-8">
        <FleetSubNav />
      </div>

      <div className="mt-8">
        <TruckForm
          action={updateTruckAction.bind(null, truck.id)}
          drivers={drivers}
          truck={truck}
          submitLabel="Save Changes"
        />
      </div>
    </>
  );
}
