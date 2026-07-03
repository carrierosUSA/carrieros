import { getDriverById } from "@/lib/data/drivers";
import { getTrailerById, trailerStore } from "@/lib/data/fleet-store";
import { getActiveCompany } from "@/lib/data/tenant";
import {
  trackingNovaEventStore,
  trackingStore,
} from "@/lib/data/tracking-store";
import { getDocumentService } from "@/lib/services/documents";
import { getDriverService } from "@/lib/services/drivers";
import { getLoadService } from "@/lib/services/loads";
import {
  calculateDeliveryCountdown,
  calculateEtaLabel,
  createSecureTrackingToken,
  driverFirstName,
  formatStop,
} from "@/lib/services/tracking/tracking-helpers";
import type {
  DriverLocation,
  Load,
  PublicTrackingView,
  TrackingNovaEventType,
  TrackingRecord,
} from "@/lib/types";
import type { TrackingService } from "@/lib/services/tracking/tracking-service";

function appendNovaEvent(
  tenantId: string,
  loadId: string,
  type: TrackingNovaEventType,
  message: string,
) {
  const existingRecent = trackingNovaEventStore.find(
    (event) =>
      event.tenantId === tenantId &&
      event.loadId === loadId &&
      event.type === type &&
      Date.now() - new Date(event.createdAt).getTime() < 5 * 60_000,
  );

  if (existingRecent) {
    return;
  }

  trackingNovaEventStore.unshift({
    tenantId,
    id: `tracking-event-${loadId}-${type}-${Date.now()}`,
    loadId,
    type,
    message,
    createdAt: new Date().toISOString(),
  });
}

function getRecordByLoad(tenantId: string, loadId: string) {
  return trackingStore.find(
    (record) => record.tenantId === tenantId && record.loadId === loadId,
  );
}

function isDelivered(load: Load) {
  return load.status === "delivered" || load.status === "invoiced";
}

async function simulateDriverLocation(
  tenantId: string,
  load: Load,
): Promise<DriverLocation | undefined> {
  if (!load.driverId) {
    return undefined;
  }

  const driverService = getDriverService();
  const existing = await driverService.getDriverLocation(tenantId, load.driverId);
  const tick = Math.floor(Date.now() / 60_000);
  const progress = (tick % 30) / 30;
  const origin = load.origin.city === "Austin" ? { lat: 30.2672, lng: -97.7431 } : { lat: 29.4241, lng: -98.4936 };
  const destination =
    load.destination.city === "Oklahoma City"
      ? { lat: 35.4676, lng: -97.5164 }
      : load.destination.city === "Houston"
        ? { lat: 29.7604, lng: -95.3698 }
        : { lat: 33.4484, lng: -112.074 };
  const stopped = load.id === "load-24003" && tick % 11 === 0;
  const location = {
    latitude: origin.lat + (destination.lat - origin.lat) * progress,
    longitude: origin.lng + (destination.lng - origin.lng) * progress,
    heading: Math.round(45 + progress * 25),
    speedMph: stopped ? 0 : 58,
    recordedAt: new Date().toISOString(),
    provider: "mock" as const,
  };

  const updated = await driverService.updateDriverLocation(
    tenantId,
    load.driverId,
    location,
  );

  if (stopped) {
    appendNovaEvent(
      tenantId,
      load.id,
      "truck_stopped",
      "Truck stopped longer than expected.",
    );
  }

  if (existing && Math.abs(existing.latitude - updated.latitude) > 0.15) {
    appendNovaEvent(tenantId, load.id, "eta_changed", "ETA changed.");
  }

  return updated;
}

function estimateEtaMinutes(load: Load, location?: DriverLocation) {
  if (isDelivered(load)) {
    return 0;
  }

  if (!location) {
    return undefined;
  }

  const base = load.status === "in_transit" ? 82 : 210;
  const variation = Math.abs(Math.round((location.longitude % 1) * 20));
  return base + variation;
}

async function buildView(
  record: TrackingRecord,
  markOpened: boolean,
): Promise<PublicTrackingView | null> {
  const load = await getLoadService().getLoad(record.tenantId, record.loadId);

  if (!load) {
    return null;
  }

  const company = getActiveCompany();
  const driver = load.driverId ? getDriverById(load.driverId) : undefined;
  const trailer = load.truckId
    ? trailerStore.find((entry) => entry.truckId === load.truckId)
    : undefined;
  const location = isDelivered(load)
    ? undefined
    : await simulateDriverLocation(record.tenantId, load);
  const etaMinutes = estimateEtaMinutes(load, location);
  const documentSummary = await getDocumentService().getPacketSummary(
    record.tenantId,
    load.id,
  );
  const finalPod = documentSummary.checklist.find(
    (item) => item.type === "final_pod",
  );
  const status = !record.enabled
    ? "disabled"
    : isDelivered(load)
      ? "expired_delivered"
      : load.driverId && load.truckId
        ? "live"
        : "not_ready";

  if (markOpened) {
    record.lastOpenedAt = new Date().toISOString();
    appendNovaEvent(
      record.tenantId,
      load.id,
      "broker_opened",
      "Broker opened tracking.",
    );
  }

  if (status === "expired_delivered" || status === "disabled") {
    appendNovaEvent(record.tenantId, load.id, "tracking_expired", "Tracking expired.");
  }

  if (
    etaMinutes !== undefined &&
    record.lastEtaMinutes !== undefined &&
    Math.abs(record.lastEtaMinutes - etaMinutes) >= 10
  ) {
    appendNovaEvent(record.tenantId, load.id, "eta_changed", "ETA changed.");
  }

  if (etaMinutes !== undefined) {
    record.lastEtaMinutes = etaMinutes;
  }

  const novaEvents = trackingNovaEventStore.filter(
    (event) => event.tenantId === record.tenantId && event.loadId === load.id,
  );

  return {
    companyName: company.name,
    load,
    token: record.token,
    status,
    location,
    etaMinutes,
    etaLabel: calculateEtaLabel(etaMinutes),
    pickupCompleted: load.status !== "pending" && load.status !== "dispatched",
    currentStop: isDelivered(load)
      ? formatStop(load.destination)
      : load.status === "in_transit"
        ? `En route to ${formatStop(load.destination)}`
        : `Pickup at ${formatStop(load.origin)}`,
    deliveryCountdown: calculateDeliveryCountdown(load),
    driverFirstName: driverFirstName(driver?.name),
    trailerNumber: trailer ? `Unit ${trailer.unitNumber}` : getTrailerById("trailer-2201")?.unitNumber,
    temperature: "Service ready",
    lastUpdatedAt: location?.recordedAt ?? new Date().toISOString(),
    novaEvents,
    finalPodStatus: finalPod?.status ?? "missing",
    invoiceStatus: documentSummary.invoiceDraft?.status ?? "not generated",
    paymentStatus: load.status === "invoiced" ? "pending payment" : "not requested",
  };
}

export const mockTrackingService: TrackingService = {
  async getTrackingRecordForLoad(tenantId, loadId) {
    return getRecordByLoad(tenantId, loadId) ?? null;
  },

  async ensureTrackingForLoad(tenantId, loadId) {
    const existing = getRecordByLoad(tenantId, loadId);

    if (existing) {
      return existing;
    }

    const load = await getLoadService().getLoad(tenantId, loadId);

    const record: TrackingRecord = {
      tenantId,
      id: `tracking-${loadId}-${Date.now()}`,
      loadId,
      token: load?.trackingToken ?? createSecureTrackingToken(),
      enabled: load?.trackingEnabled ?? true,
      createdAt: new Date().toISOString(),
    };

    trackingStore.unshift(record);
    return record;
  },

  async getTrackingForLoad(tenantId, loadId) {
    const record = await this.ensureTrackingForLoad(tenantId, loadId);
    return buildView(record, false);
  },

  async getPublicTrackingByToken(token) {
    const record = trackingStore.find((entry) => entry.token === token);

    if (!record) {
      return null;
    }

    return buildView(record, true);
  },

  async disableTracking(tenantId, loadId) {
    const record = await this.ensureTrackingForLoad(tenantId, loadId);
    record.enabled = false;
    record.disabledAt = new Date().toISOString();
    appendNovaEvent(tenantId, loadId, "tracking_expired", "Tracking expired.");
    return record;
  },

  async listNovaEvents(tenantId, loadId) {
    return trackingNovaEventStore.filter(
      (event) =>
        event.tenantId === tenantId && (loadId ? event.loadId === loadId : true),
    );
  },
};
