import { notFound } from "next/navigation";
import TripReplayExperience from "@/components/tracking/replay/TripReplayExperience";
import { getCustomerById } from "@/lib/data/customers";
import { getDriverById } from "@/lib/data/drivers";
import { getTruckById } from "@/lib/data/trucks";
import { getActiveTenantId } from "@/lib/data/tenant";
import { formatStopScheduleLine, getTrailerForTruck } from "@/lib/dispatch/load-board";
import {
  formatStopAppointment,
  getDeliveryDetail,
  getPickupDetail,
} from "@/lib/dispatch/load-detail-meta";
import { getDriverService } from "@/lib/services/drivers";
import { getLoadService } from "@/lib/services/loads";
import { getTrackingService } from "@/lib/services/tracking";

export const dynamic = "force-dynamic";

type LoadTripReplayPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LoadTripReplayPage({
  params,
}: LoadTripReplayPageProps) {
  const { id } = await params;
  const tenantId = getActiveTenantId();
  const [tracking, fullLoad] = await Promise.all([
    getTrackingService().getTrackingForLoad(tenantId, id),
    getLoadService().getLoad(tenantId, id),
  ]);

  if (!tracking || !fullLoad) {
    notFound();
  }

  const customerName =
    getCustomerById(fullLoad.customerId)?.name ?? "Unknown customer";
  const pickupDetail = getPickupDetail(fullLoad, customerName);
  const deliveryDetail = getDeliveryDetail(fullLoad, customerName);
  const driver = fullLoad.driverId ? getDriverById(fullLoad.driverId) : undefined;
  const truck = fullLoad.truckId ? getTruckById(fullLoad.truckId) : undefined;
  const trailer = getTrailerForTruck(fullLoad.truckId);
  const driverLocation = fullLoad.driverId
    ? await getDriverService().getDriverLocation(tenantId, fullLoad.driverId)
    : null;

  return (
    <TripReplayExperience
      loadId={id}
      loadReference={fullLoad.reference}
      originCity={fullLoad.origin.city}
      originState={fullLoad.origin.state}
      destinationCity={fullLoad.destination.city}
      destinationState={fullLoad.destination.state}
      totalMiles={fullLoad.miles}
      eta={formatStopScheduleLine(fullLoad.deliveryDate)}
      driverName={driver?.name}
      driverLocation={driverLocation}
      backHref={`/loads/${id}/tracking`}
      pickupDetails={{
        city: fullLoad.origin.city,
        state: fullLoad.origin.state,
        company: pickupDetail.companyName,
        address: pickupDetail.address,
        appointment: formatStopAppointment(pickupDetail),
      }}
      deliveryDetails={{
        city: fullLoad.destination.city,
        state: fullLoad.destination.state,
        company: deliveryDetail.companyName,
        address: deliveryDetail.address,
        appointment: formatStopAppointment(deliveryDetail),
      }}
      driver={
        driver
          ? {
              name: driver.name,
              phone: driver.phone,
              truckLabel: truck ? `Unit ${truck.unitNumber}` : undefined,
              trailerLabel: trailer ? `TRL-${trailer.unitNumber}` : undefined,
            }
          : undefined
      }
    />
  );
}
