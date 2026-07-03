import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import DriverProfileSubNav from "@/components/drivers/DriverProfileSubNav";
import DriverForm from "@/components/drivers/DriverForm";
import { updateDriverAction } from "@/app/drivers/actions";
import { requireDriver } from "@/lib/drivers/require-driver";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getFleetService } from "@/lib/services/fleet";

type EditDriverPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditDriverPage({ params }: EditDriverPageProps) {
  const { id } = await params;
  const driver = await requireDriver(id);
  const trucks = await getFleetService().listTrucks(getActiveTenantId());

  return (
    <>
      <Link
        href={`/drivers/${driver.id}`}
        className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
      >
        ← Back to Profile
      </Link>

      <PageHeader
        title={`Edit ${driver.name}`}
        subtitle="Update driver profile, compliance, and payroll settings."
        className="mt-4"
      />

      <div className="mt-8">
        <DriverProfileSubNav driverId={driver.id} />
      </div>

      <div className="mt-8">
        <DriverForm
          action={updateDriverAction.bind(null, driver.id)}
          trucks={trucks}
          driver={driver}
          submitLabel="Save Changes"
        />
      </div>
    </>
  );
}
