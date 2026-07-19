import NewLoadForm from "@/components/loads/new/NewLoadForm";
import NewLoadPageShell from "@/components/loads/new/NewLoadPageShell";
import { buildSmartLoadFormContext } from "@/lib/forms/smart-load-intelligence";
import { listBrokersByTenant } from "@/lib/data/brokers";
import { listCustomersByTenant } from "@/lib/data/customers";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getDriverService } from "@/lib/services/drivers";
import { getFleetService } from "@/lib/services/fleet";
import { createLoadAction } from "@/app/loads/actions";

export default async function CreateLoadPage() {
  const tenantId = getActiveTenantId();
  const [customers, brokers, drivers, trucks, trailers, smartContext] =
    await Promise.all([
      Promise.resolve(listCustomersByTenant(tenantId)),
      Promise.resolve(listBrokersByTenant(tenantId)),
      getDriverService().listDrivers(tenantId),
      getFleetService().listTrucks(tenantId),
      getFleetService().listTrailers(tenantId),
      buildSmartLoadFormContext(tenantId),
    ]);

  return (
    <NewLoadPageShell>
      <NewLoadForm
        action={createLoadAction}
        customers={customers}
        brokers={brokers}
        drivers={drivers}
        trucks={trucks}
        trailers={trailers}
        smartContext={smartContext}
      />
    </NewLoadPageShell>
  );
}
