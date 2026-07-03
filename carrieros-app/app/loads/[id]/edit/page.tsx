import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import LoadForm from "@/components/loads/LoadForm";
import { updateLoadAction } from "@/app/loads/actions";
import { listBrokersByTenant } from "@/lib/data/brokers";
import { listCustomersByTenant } from "@/lib/data/customers";
import { getActiveTenantId } from "@/lib/data/tenant";
import { formatLoadLane } from "@/lib/services/loads/load-helpers";
import { getLoadService } from "@/lib/services/loads";

type EditLoadPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditLoadPage({ params }: EditLoadPageProps) {
  const { id } = await params;
  const tenantId = getActiveTenantId();
  const load = await getLoadService().getLoad(tenantId, id);

  if (!load) {
    notFound();
  }

  const customers = listCustomersByTenant(tenantId);
  const brokers = listBrokersByTenant(tenantId);

  return (
    <>
      <Link
        href={`/loads/${load.id}`}
        className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
      >
        ← Back to Load
      </Link>

      <PageHeader
        title={`Edit ${load.reference}`}
        subtitle={formatLoadLane(load)}
        className="mt-4"
      />

      <div className="mt-8">
        <LoadForm
          action={updateLoadAction.bind(null, load.id)}
          customers={customers}
          brokers={brokers}
          load={load}
          submitLabel="Save Changes"
          includeStatus
        />
      </div>
    </>
  );
}
