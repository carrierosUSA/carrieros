import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import FleetSubNav from "@/components/fleet/FleetSubNav";
import TrailerForm from "@/components/fleet/TrailerForm";
import { createTrailerAction } from "@/app/fleet/actions";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getFleetService } from "@/lib/services/fleet";

export default async function AddTrailerPage() {
  const tenantId = getActiveTenantId();
  const trucks = await getFleetService().listTrucks(tenantId);

  return (
    <>
      <Link
        href="/fleet/trailers"
        className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
      >
        ← Back to Trailers
      </Link>

      <PageHeader
        title="Add Trailer"
        subtitle="Register a new trailer to your fleet inventory."
        className="mt-4"
      />

      <div className="mt-8">
        <FleetSubNav />
      </div>

      <div className="mt-8">
        <TrailerForm
          action={createTrailerAction}
          trucks={trucks}
          submitLabel="Add Trailer"
        />
      </div>
    </>
  );
}
