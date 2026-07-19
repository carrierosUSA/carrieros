import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import SmartLoadForm from "@/components/loads/SmartLoadForm";
import { updateLoadAction } from "@/app/loads/actions";
import { listBrokersByTenant } from "@/lib/data/brokers";
import { getCustomerById, listCustomersByTenant } from "@/lib/data/customers";
import { getActiveTenantId } from "@/lib/data/tenant";
import {
  buildSmartLoadFormContext,
  loadToFormDefaults,
} from "@/lib/forms/smart-load-intelligence";
import { formatLoadLane } from "@/lib/services/loads/load-helpers";
import { getDriverService } from "@/lib/services/drivers";
import { getFleetService } from "@/lib/services/fleet";
import { getLoadService } from "@/lib/services/loads";

type EditLoadPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditLoadPage({ params }: EditLoadPageProps) {
  const { id } = await params;
  const tenantId = getActiveTenantId();
  const loadService = getLoadService();
  const load = await loadService.getLoad(tenantId, id);

  if (!load) {
    notFound();
  }

  const [
    customers,
    brokers,
    drivers,
    trucks,
    trailers,
    smartContext,
  ] = await Promise.all([
    Promise.resolve(listCustomersByTenant(tenantId)),
    Promise.resolve(listBrokersByTenant(tenantId)),
    getDriverService().listDrivers(tenantId),
    getFleetService().listTrucks(tenantId),
    getFleetService().listTrailers(tenantId),
    buildSmartLoadFormContext(tenantId),
  ]);

  const customerName = getCustomerById(load.customerId)?.name ?? "Customer";
  const initialValues = loadToFormDefaults(load, customerName);

  return (
    <>
      <Link
        href={`/loads/${load.id}`}
        className="text-sm font-medium text-[#2563EB] transition hover:text-[#1D4ED8]"
      >
        ← Back to Load
      </Link>

      <PageHeader
        title={`Edit ${load.reference}`}
        subtitle={formatLoadLane(load)}
        className="mt-4"
      />

      <div className="mt-6 max-w-5xl">
        <SmartLoadForm
          action={updateLoadAction.bind(null, load.id)}
          customers={customers}
          brokers={brokers}
          drivers={drivers}
          trucks={trucks}
          trailers={trailers}
          smartContext={smartContext}
          initialValues={initialValues}
          load={load}
          submitLabel="Save Changes"
          includeStatus
        />
      </div>
    </>
  );
}
