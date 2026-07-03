import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import LoadForm from "@/components/loads/LoadForm";
import { createLoadAction } from "@/app/loads/actions";
import { listBrokersByTenant } from "@/lib/data/brokers";
import { listCustomersByTenant } from "@/lib/data/customers";
import { getActiveTenantId } from "@/lib/data/tenant";

export default function CreateLoadPage() {
  const tenantId = getActiveTenantId();
  const customers = listCustomersByTenant(tenantId);
  const brokers = listBrokersByTenant(tenantId);

  return (
    <>
      <Link
        href="/loads"
        className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
      >
        ← Back to Dispatch
      </Link>

      <PageHeader
        title="Create Load"
        subtitle="Enter lane, customer, and schedule details for a new shipment."
        className="mt-4"
      />

      <div className="mt-8">
        <LoadForm
          action={createLoadAction}
          customers={customers}
          brokers={brokers}
          submitLabel="Create Load"
        />
      </div>
    </>
  );
}
