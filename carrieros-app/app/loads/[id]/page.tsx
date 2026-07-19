import { notFound } from "next/navigation";
import DispatchLoadDetail from "@/components/dispatch/DispatchLoadDetail";
import { getBrokerById } from "@/lib/data/brokers";
import { getCustomerById } from "@/lib/data/customers";
import { getActiveCompany, getActiveTenantId } from "@/lib/data/tenant";
import {
  formatActivityTimestamp,
  getTrailerForTruck,
} from "@/lib/dispatch/load-board";
import { getDocumentService } from "@/lib/services/documents";
import { getDriverService } from "@/lib/services/drivers";
import { getFleetService } from "@/lib/services/fleet";
import { getLoadService } from "@/lib/services/loads";
import {
  DRIVER_STATUS_LABELS,
  TRAILER_STATUS_LABELS,
  TRAILER_TYPE_LABELS,
  TRUCK_STATUS_LABELS,
} from "@/lib/types";

type LoadDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function brokerEmailFor(brokerId?: string): string | undefined {
  if (!brokerId) {
    return undefined;
  }

  if (brokerId === "broker-capital") {
    return "dispatch@capitalfreight.com";
  }

  if (brokerId === "broker-freightline") {
    return "ops@freightline.com";
  }

  return undefined;
}

export default async function LoadDetailPage({ params }: LoadDetailPageProps) {
  const { id } = await params;
  const tenantId = getActiveTenantId();
  const loadService = getLoadService();
  const fleetService = getFleetService();
  const documentService = getDocumentService();
  const company = getActiveCompany();

  const [load, drivers, trucks, trailers] = await Promise.all([
    loadService.getLoad(tenantId, id),
    fleetService.listDrivers(tenantId),
    fleetService.listTrucks(tenantId),
    fleetService.listTrailers(tenantId),
  ]);

  if (!load) {
    notFound();
  }

  const [documentSummary, driverLocation] = await Promise.all([
    documentService.getPacketSummary(tenantId, load.id),
    load.driverId
      ? getDriverService().getDriverLocation(tenantId, load.driverId)
      : Promise.resolve(null),
  ]);

  const customerName =
    getCustomerById(load.customerId)?.name ?? "Unknown customer";
  const broker = load.brokerId ? getBrokerById(load.brokerId) : undefined;
  const driver = load.driverId
    ? drivers.find((entry) => entry.id === load.driverId)
    : undefined;
  const truck = load.truckId
    ? trucks.find((entry) => entry.id === load.truckId)
    : undefined;
  const trailer = getTrailerForTruck(load.truckId);
  const lastLocationUpdate = driverLocation
    ? `Updated ${formatActivityTimestamp(driverLocation.recordedAt)} · ${driverLocation.speedMph} mph`
    : undefined;
  const milesRemaining = driverLocation
    ? Math.max(0, Math.round(load.miles * 0.35))
    : undefined;

  const driverOptions = drivers.map((entry) => {
    const assignedTruck = entry.truckId
      ? trucks.find((item) => item.id === entry.truckId)
      : undefined;
    const trailer = getTrailerForTruck(entry.truckId);

    return {
      id: entry.id,
      name: entry.name,
      phone: entry.phone,
      status: DRIVER_STATUS_LABELS[entry.status],
      truckLabel: assignedTruck?.unitNumber,
      trailerLabel: trailer?.unitNumber,
    };
  });

  const truckOptions = trucks.map((entry) => {
    const linkedTrailer = getTrailerForTruck(entry.id);

    return {
      id: entry.id,
      unitNumber: entry.unitNumber,
      status: TRUCK_STATUS_LABELS[entry.status],
      trailerLabel: linkedTrailer?.unitNumber,
    };
  });

  const trailerOptions = trailers.map((entry) => ({
    id: entry.id,
    unitNumber: entry.unitNumber,
    type: TRAILER_TYPE_LABELS[entry.type],
    status: TRAILER_STATUS_LABELS[entry.status],
  }));

  return (
    <DispatchLoadDetail
      load={load}
      customerName={customerName}
      broker={broker}
      brokerEmail={brokerEmailFor(load.brokerId)}
      company={company}
      driver={driver}
      truck={truck}
      documentSummary={documentSummary}
      lastLocation={driverLocation ? driver?.location : undefined}
      lastLocationUpdate={lastLocationUpdate}
      milesRemaining={milesRemaining}
      driverLocation={driverLocation}
      driverOptions={driverOptions}
      truckOptions={truckOptions}
      trailerOptions={trailerOptions}
      currentTrailerId={trailer?.id}
    />
  );
}
