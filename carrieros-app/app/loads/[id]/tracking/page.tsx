import Link from "next/link";
import { notFound } from "next/navigation";
import FullScreenTrackingExperience from "@/components/tracking/map/FullScreenTrackingExperience";
import { getCustomerById } from "@/lib/data/customers";
import { getDriverById } from "@/lib/data/drivers";
import { getTruckById } from "@/lib/data/trucks";
import { getActiveTenantId } from "@/lib/data/tenant";
import {
  formatActivityTimestamp,
  formatStopScheduleLine,
  getTrailerForTruck,
} from "@/lib/dispatch/load-board";
import {
  formatStopAppointment,
  getDeliveryDetail,
  getPickupDetail,
} from "@/lib/dispatch/load-detail-meta";
import { getDriverService } from "@/lib/services/drivers";
import { formatLoadLane } from "@/lib/services/loads/load-helpers";
import { getLoadService } from "@/lib/services/loads";
import { getTrackingService } from "@/lib/services/tracking";

export const dynamic = "force-dynamic";

type LoadTrackingPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LoadTrackingPage({ params }: LoadTrackingPageProps) {
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
  const milesRemaining = driverLocation
    ? Math.max(0, Math.round(fullLoad.miles * 0.35))
    : undefined;

  return (
    <div className="px-1 pb-6">
      <Link
        href={`/loads/${id}`}
        className="text-sm font-medium text-[#2563EB] transition hover:text-[#1D4ED8]"
      >
        ← Back to Load
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Live Tracking
          </p>
          <h1 className="mt-1 text-[28px] font-bold tracking-[-0.03em] text-slate-950">
            {fullLoad.reference}
          </h1>
          <p className="mt-1 text-[14px] text-slate-500">{formatLoadLane(fullLoad)}</p>
        </div>
      </div>

      <div className="mt-6">
        <FullScreenTrackingExperience
          loadId={id}
          loadReference={fullLoad.reference}
          originCity={fullLoad.origin.city}
          originState={fullLoad.origin.state}
          destinationCity={fullLoad.destination.city}
          destinationState={fullLoad.destination.state}
          totalMiles={fullLoad.miles}
          milesRemaining={milesRemaining}
          eta={formatStopScheduleLine(fullLoad.deliveryDate)}
          isLive={tracking.status === "live"}
          loadStatus={fullLoad.status}
          currentLocationLabel={tracking.currentStop}
          lastUpdatedLabel={
            tracking.location
              ? `Updated ${formatActivityTimestamp(tracking.location.recordedAt)}`
              : undefined
          }
          driverLocation={driverLocation}
          fullscreenHref={`/loads/${id}/tracking`}
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
      </div>
    </div>
  );
}
