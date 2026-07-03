import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import DriverProfileSubNav from "@/components/drivers/DriverProfileSubNav";
import MedicalRecordCard from "@/components/drivers/MedicalRecordCard";
import { requireDriver } from "@/lib/drivers/require-driver";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getDriverService } from "@/lib/services/drivers";

type PageProps = { params: Promise<{ id: string }> };

export default async function DriverMedicalPage({ params }: PageProps) {
  const { id } = await params;
  const driver = await requireDriver(id);
  const records = await getDriverService().listMedicalCards(getActiveTenantId(), id);

  return (
    <>
      <Link href={`/drivers/${driver.id}`} className="text-sm font-medium text-blue-400">
        ← Back to Profile
      </Link>
      <PageHeader title="Medical Card Tracking" subtitle={driver.name} className="mt-4" />
      <div className="mt-8"><DriverProfileSubNav driverId={driver.id} /></div>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {records.map((record) => (
          <MedicalRecordCard key={record.id} record={record} driverName={driver.name} />
        ))}
      </div>
    </>
  );
}
