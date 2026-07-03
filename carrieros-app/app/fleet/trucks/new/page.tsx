import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import FleetSubNav from "@/components/fleet/FleetSubNav";
import TruckForm from "@/components/fleet/TruckForm";
import { createTruckAction } from "@/app/fleet/actions";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getFleetService } from "@/lib/services/fleet";

export default async function AddTruckPage() {
  const tenantId = getActiveTenantId();
  const drivers = await getFleetService().listDrivers(tenantId);

  return (
    <>
      <Link
        href="/fleet/trucks"
        className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
      >
        ← Back to Trucks
      </Link>

      <PageHeader
        title="Add Truck"
        subtitle="Register a new power unit to your fleet."
        className="mt-4"
      />

      <div className="mt-8">
        <FleetSubNav />
      </div>

      <div className="mt-8">
        <TruckForm action={createTruckAction} drivers={drivers} submitLabel="Add Truck" />
      </div>
    </>
  );
}
