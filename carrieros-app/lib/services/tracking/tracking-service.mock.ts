import { getDriverById } from "@/lib/data/drivers";
import { trailerStore } from "@/lib/data/fleet-store";
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

async function getLatestDriverLocation(
  tenantId: string,
  load: Load,
): Promise<DriverLocation | undefined> {
  if (!load.driverId) {
    return undefined;
  }

  return (await getDriverService().getDriverLocation(tenantId, load.driverId)) ?? undefined;
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

async function buildView(record: TrackingRecord): Promise<PublicTrackingView | null> {
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
    : await getLatestDriverLocation(record.tenantId, load);
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

  const novaEvents = trackingNovaEventStore.filter(
    (event) => event.tenantId === record.tenantId && event.loadId === load.id,
  );

  return {
    companyName: company.name,
    load: {
      id: load.id,
      reference: load.reference,
      status: load.status,
      origin: load.origin,
      destination: load.destination,
    },
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
    trailerNumber: trailer ? `Unit ${trailer.unitNumber}` : undefined,
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

    if (!load) {
      throw new Error("Load not found.");
    }

    const record: TrackingRecord = {
      tenantId,
      id: `tracking-${loadId}-${Date.now()}`,
      loadId,
      token: load.trackingToken ?? createSecureTrackingToken(),
      enabled: load.trackingEnabled ?? true,
      createdAt: new Date().toISOString(),
    };

    trackingStore.unshift(record);
    return record;
  },

  async getTrackingForLoad(tenantId, loadId) {
    const load = await getLoadService().getLoad(tenantId, loadId);

    if (!load) {
      return null;
    }

    const record = await this.ensureTrackingForLoad(tenantId, loadId);
    return buildView(record);
  },

  async getPublicTrackingByToken(token) {
    const record = trackingStore.find((entry) => entry.token === token);

    if (!record) {
      return null;
    }

    return buildView(record);
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
