import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import LoadAssignmentPanel from "@/components/loads/LoadAssignmentPanel";
import LoadOverviewPanel from "@/components/loads/LoadOverviewPanel";
import LoadStatusActions from "@/components/loads/LoadStatusActions";
import LoadStatusBadge from "@/components/loads/LoadStatusBadge";
import LoadStopsPanel from "@/components/loads/LoadStopsPanel";
import LoadTimeline from "@/components/loads/LoadTimeline";
import { getBrokerById } from "@/lib/data/brokers";
import { getCustomerById } from "@/lib/data/customers";
import { getActiveTenantId } from "@/lib/data/tenant";
import DocumentStatusBadge from "@/components/documents/DocumentStatusBadge";
import TrackingShareDialog from "@/components/tracking/TrackingShareDialog";
import { getDocumentService } from "@/lib/services/documents";
import { getFleetService } from "@/lib/services/fleet";
import { formatLoadLane } from "@/lib/services/loads/load-helpers";
import { getLoadService } from "@/lib/services/loads";
import { getTrackingService } from "@/lib/services/tracking";

type LoadDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LoadDetailPage({ params }: LoadDetailPageProps) {
  const { id } = await params;
  const tenantId = getActiveTenantId();
  const loadService = getLoadService();
  const fleetService = getFleetService();
  const documentService = getDocumentService();
  const trackingService = getTrackingService();

  const [load, drivers, trucks] = await Promise.all([
    loadService.getLoad(tenantId, id),
    fleetService.listDrivers(tenantId),
    fleetService.listTrucks(tenantId),
  ]);

  if (!load) {
    notFound();
  }

  const [documentSummary, tracking] = await Promise.all([
    documentService.getPacketSummary(tenantId, load.id),
    trackingService.getTrackingForLoad(tenantId, load.id),
  ]);

  const customerName = getCustomerById(load.customerId)?.name ?? "Unknown customer";
  const brokerName = load.brokerId ? getBrokerById(load.brokerId)?.name : undefined;
  const driverName = load.driverId
    ? drivers.find((driver) => driver.id === load.driverId)?.name
    : undefined;
  const truck = load.truckId
    ? trucks.find((entry) => entry.id === load.truckId)
    : undefined;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/loads"
          className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
        >
          ← Back to Dispatch
        </Link>

        <Link
          href={`/loads/${load.id}/edit`}
          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-800"
        >
          Edit Load
        </Link>
      </div>

      <PageHeader
        title={load.reference}
        subtitle={formatLoadLane(load)}
        className="mt-4"
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <LoadStatusBadge status={load.status} />
        <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-300">
          Compliance: {load.complianceStatus}
        </span>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <LoadOverviewPanel
          load={load}
          customerName={customerName}
          brokerName={brokerName}
          driverName={driverName}
          driverId={load.driverId}
          truckLabel={truck ? `Unit ${truck.unitNumber}` : undefined}
          truckId={load.truckId}
        />

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="font-semibold text-zinc-100">Nova AI</h2>
          <p className="mt-3 text-sm text-zinc-300">
            {load.novaSummary ?? "No AI summary available for this load."}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {!load.driverId || !load.truckId ? (
              <a
                href="#dispatch-assignment"
                className="rounded-xl border border-blue-800 px-4 py-2 text-center text-sm font-semibold text-blue-300 transition hover:bg-blue-950"
              >
                Show Me Assignment
              </a>
            ) : null}
            {documentSummary.nextMissing ? (
              <Link
                href={`/loads/${load.id}/documents`}
                className="rounded-xl border border-blue-800 px-4 py-2 text-center text-sm font-semibold text-blue-300 transition hover:bg-blue-950"
              >
                Missing {documentSummary.nextMissing.label}. Show Me
              </Link>
            ) : null}
            <Link
              href={`/documents/packets/${load.id}`}
              className="rounded-xl border border-zinc-700 px-4 py-2 text-center text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
            >
              Open Invoice Packet
            </Link>
            <Link
              href={`/loads/${load.id}/tracking`}
              className="rounded-xl border border-zinc-700 px-4 py-2 text-center text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
            >
              Share Tracking Link
            </Link>
            {load.driverId ? (
              <Link
                href={`/drivers/${load.driverId}`}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-center text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
              >
                Open Driver
              </Link>
            ) : null}
            {load.truckId ? (
              <Link
                href={`/fleet/trucks/${load.truckId}`}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-center text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
              >
                Open Truck
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        <LoadStopsPanel
          origin={load.origin}
          destination={load.destination}
          pickupDate={load.pickupDate}
          deliveryDate={load.deliveryDate}
        />

        <div id="dispatch-assignment">
          <LoadAssignmentPanel
            loadId={load.id}
            drivers={drivers}
            trucks={trucks}
            currentDriverId={load.driverId}
            currentTruckId={load.truckId}
          />
        </div>

        <LoadStatusActions load={load} />

        {tracking ? (
          <TrackingShareDialog
            token={tracking.token}
            loadId={load.id}
            canShare={Boolean(load.driverId && load.truckId)}
            warning="Assign both a driver and truck before sharing this broker/customer tracking link."
          />
        ) : null}

        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-zinc-100">Invoice Packet</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Rate confirmation, BOL, final POD, lumper, invoice, and void
                check sequence.
              </p>
            </div>
            <DocumentStatusBadge
              status={
                documentSummary.readyToSend
                  ? "ready_to_send"
                  : "missing_documents"
              }
            />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link
              href={`/loads/${load.id}/documents`}
              className="rounded-xl border border-zinc-700 px-4 py-3 text-center text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
            >
              Capture Documents
            </Link>
            <Link
              href={`/documents/packets/${load.id}`}
              className="rounded-xl border border-zinc-700 px-4 py-3 text-center text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
            >
              View Packet
            </Link>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="font-semibold text-zinc-100">Status Timeline</h2>
          <div className="mt-6">
            <LoadTimeline events={load.timeline} />
          </div>
        </section>
      </div>
    </>
  );
}
