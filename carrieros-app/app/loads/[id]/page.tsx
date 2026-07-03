import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import LoadStatusBadge from "@/components/loads/LoadStatusBadge";
import LoadTimeline from "@/components/loads/LoadTimeline";
import { getBrokerById } from "@/lib/data/brokers";
import { getCustomerById } from "@/lib/data/customers";
import { getDriverById } from "@/lib/data/drivers";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getTruckById } from "@/lib/data/trucks";
import { getLoadService } from "@/lib/services/loads";

type LoadDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatLane(origin: { city: string; state: string }, destination: { city: string; state: string }) {
  return `${origin.city}, ${origin.state} → ${destination.city}, ${destination.state}`;
}

export default async function LoadDetailPage({ params }: LoadDetailPageProps) {
  const { id } = await params;
  const load = await getLoadService().getLoad(getActiveTenantId(), id);

  if (!load) {
    notFound();
  }

  const customerName = getCustomerById(load.customerId)?.name ?? "Unknown customer";
  const brokerName = load.brokerId ? getBrokerById(load.brokerId)?.name : undefined;
  const driverName = load.driverId ? getDriverById(load.driverId)?.name : undefined;
  const truck = load.truckId ? getTruckById(load.truckId) : undefined;

  return (
    <>
      <Link
        href="/loads"
        className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
      >
        ← Back to Loads
      </Link>

      <PageHeader
        title={load.reference}
        subtitle={formatLane(load.origin, load.destination)}
        className="mt-4"
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <LoadStatusBadge status={load.status} />
        <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-300">
          Compliance: {load.complianceStatus}
        </span>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 lg:col-span-2">
          <h2 className="font-semibold text-zinc-100">Load Overview</h2>
          <div className="mt-4 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
            <p>
              <strong className="text-zinc-100">Customer:</strong> {customerName}
            </p>
            <p>
              <strong className="text-zinc-100">Broker:</strong>{" "}
              {brokerName ?? "Direct"}
            </p>
            <p>
              <strong className="text-zinc-100">Driver:</strong>{" "}
              {driverName ?? "Unassigned"}
            </p>
            <p>
              <strong className="text-zinc-100">Truck:</strong>{" "}
              {truck ? `Unit ${truck.unitNumber}` : "Unassigned"}
            </p>
            <p>
              <strong className="text-zinc-100">Rate:</strong> ${load.rate.toLocaleString()}
            </p>
            <p>
              <strong className="text-zinc-100">Miles:</strong> {load.miles}
            </p>
            <p>
              <strong className="text-zinc-100">Documents:</strong>{" "}
              {load.documentIds.length} linked
            </p>
            <p>
              <strong className="text-zinc-100">Invoice:</strong>{" "}
              {load.invoiceId ?? "Not generated"}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="font-semibold text-zinc-100">Nova AI</h2>
          <p className="mt-3 text-sm text-zinc-300">
            {load.novaSummary ?? "No AI summary available for this load."}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="font-semibold text-zinc-100">Load Timeline</h2>
        <div className="mt-6">
          <LoadTimeline events={load.timeline} />
        </div>
      </div>
    </>
  );
}
