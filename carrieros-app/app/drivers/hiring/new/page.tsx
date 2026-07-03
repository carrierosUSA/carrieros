import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import DriversSubNav from "@/components/drivers/DriversSubNav";
import DriverForm from "@/components/drivers/DriverForm";
import { createDriverAction } from "@/app/drivers/actions";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getFleetService } from "@/lib/services/fleet";

export default async function DriverHiringPage() {
  const tenantId = getActiveTenantId();
  const trucks = await getFleetService().listTrucks(tenantId);

  return (
    <>
      <Link
        href="/drivers"
        className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
      >
        ← Back to Drivers
      </Link>

      <PageHeader
        title="Driver Hiring"
        subtitle="Onboard a new driver with compliance, payroll, and assignment details."
        className="mt-4"
      />

      <div className="mt-8">
        <DriversSubNav />
      </div>

      <div className="mt-8">
        <DriverForm action={createDriverAction} trucks={trucks} submitLabel="Hire Driver" />
      </div>
    </>
  );
}
