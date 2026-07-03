import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import DriverProfileSubNav from "@/components/drivers/DriverProfileSubNav";
import DocumentRecordCard from "@/components/drivers/DocumentRecordCard";
import { requireDriver } from "@/lib/drivers/require-driver";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getDriverService } from "@/lib/services/drivers";

type PageProps = { params: Promise<{ id: string }> };

export default async function DriverDocumentsPage({ params }: PageProps) {
  const { id } = await params;
  const driver = await requireDriver(id);
  const documents = await getDriverService().listDocuments(getActiveTenantId(), id);

  return (
    <>
      <Link href={`/drivers/${driver.id}`} className="text-sm font-medium text-blue-400">
        ← Back to Profile
      </Link>
      <PageHeader title="Driver Documents" subtitle={driver.name} className="mt-4" />
      <div className="mt-8"><DriverProfileSubNav driverId={driver.id} /></div>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {documents.map((document) => (
          <DocumentRecordCard
            key={document.id}
            document={document}
            driverName={driver.name}
          />
        ))}
      </div>
    </>
  );
}
