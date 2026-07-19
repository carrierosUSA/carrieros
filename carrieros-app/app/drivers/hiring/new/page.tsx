import Link from "next/link";
import PageHeader from "@/components/PageHeader";
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
        className="text-sm font-medium text-[#2563EB] transition hover:text-[#1D4ED8]"
      >
        ← Back to Drivers
      </Link>

      <PageHeader
        title="Driver Hiring"
        subtitle="Onboard a new driver with compliance, payroll, and assignment details."
        className="mt-4"
      />

      <div className="mt-8">
        <DriverForm action={createDriverAction} trucks={trucks} submitLabel="Hire Driver" />
      </div>
    </>
  );
}
