import { loads as seedLoads } from "@/lib/data/loads";
import { getDriverById } from "@/lib/data/drivers";
import { getTruckById } from "@/lib/data/trucks";
import type { Load, LoadStatus } from "@/lib/types";
import { LOAD_STATUS_LABELS } from "@/lib/types";
import type {
  AssignDriverInput,
  AssignTruckInput,
  UpdateLoadInput,
} from "@/lib/services/loads/load-inputs";
import {
  buildNovaSummary,
  createTimelineEventId,
  deriveComplianceStatus,
  nextLoadReference,
  resolveDispatchStatus,
} from "@/lib/services/loads/load-helpers";
import { createSecureTrackingToken } from "@/lib/services/tracking/tracking-helpers";
import type { LoadListFilters, LoadService } from "@/lib/services/loads/load-service";

const loadStore: Load[] = structuredClone(seedLoads);

function formatStopSearch(load: Load): string {
  return [
    load.reference,
    load.origin.city,
    load.origin.state,
    load.destination.city,
    load.destination.state,
  ]
    .join(" ")
    .toLowerCase();
}

function filterLoads(tenantId: string, filters: LoadListFilters = {}): Load[] {
  let result = loadStore.filter((load) => load.tenantId === tenantId);

  if (filters.status && filters.status !== "all") {
    result = result.filter((load) => load.status === filters.status);
  }

  if (filters.search?.trim()) {
    const query = filters.search.trim().toLowerCase();
    result = result.filter((load) => formatStopSearch(load).includes(query));
  }

  return result.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

function getTenantLoad(tenantId: string, loadId: string): Load | undefined {
  return loadStore.find(
    (load) => load.tenantId === tenantId && load.id === loadId,
  );
}

function touchLoad(load: Load): Load {
  load.updatedAt = new Date().toISOString();
  load.novaSummary = buildNovaSummary(load);
  load.complianceStatus = deriveComplianceStatus(load);
  return load;
}

function appendTimelineEvent(
  load: Load,
  status: Load["timeline"][number]["status"],
  label: string,
  location?: string,
) {
  load.timeline.push({
    id: createTimelineEventId(load.id),
    loadId: load.id,
    status,
    label,
    occurredAt: new Date().toISOString(),
    location,
  });
}

function applyAssignmentStatus(load: Load) {
  const previousStatus = load.status;
  load.status = resolveDispatchStatus(load.status, load);

  if (previousStatus === "pending" && load.status === "dispatched") {
    appendTimelineEvent(
      load,
      "dispatched",
      "Dispatched to driver",
      `${load.origin.city}, ${load.origin.state}`,
    );
  }
}

export const mockLoadService: LoadService = {
  async listLoads(tenantId, filters = {}) {
    return filterLoads(tenantId, filters);
  },

  async getLoad(tenantId, loadId) {
    return getTenantLoad(tenantId, loadId) ?? null;
  },

  async countByStatus(tenantId) {
    const tenantLoads = loadStore.filter((load) => load.tenantId === tenantId);

    const counts: Record<LoadStatus | "all", number> = {
      all: tenantLoads.length,
      pending: 0,
      dispatched: 0,
      in_transit: 0,
      delivered: 0,
      invoiced: 0,
      cancelled: 0,
    };

    for (const load of tenantLoads) {
      counts[load.status] += 1;
    }

    return counts;
  },

  async createLoad(tenantId, input) {
    const tenantLoads = loadStore.filter((load) => load.tenantId === tenantId);
    const id = `load-${Date.now()}`;
    const now = new Date().toISOString();

    const load: Load = {
      tenantId,
      id,
      reference: nextLoadReference(tenantLoads),
      status: "pending",
      customerId: input.customerId,
      brokerId: input.brokerId,
      origin: input.origin,
      destination: input.destination,
      pickupDate: input.pickupDate,
      deliveryDate: input.deliveryDate,
      rate: input.rate,
      miles: input.miles,
      documentIds: [],
      trackingToken: createSecureTrackingToken(),
      trackingEnabled: true,
      complianceStatus: "attention",
      timeline: [
        {
          id: createTimelineEventId(id),
          loadId: id,
          status: "created",
          label: "Load created",
          occurredAt: now,
          location: `${input.origin.city}, ${input.origin.state}`,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    load.novaSummary = buildNovaSummary(load);
    loadStore.unshift(load);
    return load;
  },

  async updateLoad(tenantId, loadId, input: UpdateLoadInput) {
    const load = getTenantLoad(tenantId, loadId);

    if (!load) {
      throw new Error("Load not found.");
    }

    if (input.customerId) load.customerId = input.customerId;
    if (input.brokerId !== undefined) {
      load.brokerId = input.brokerId || undefined;
    }
    if (input.origin) load.origin = input.origin;
    if (input.destination) load.destination = input.destination;
    if (input.pickupDate) load.pickupDate = input.pickupDate;
    if (input.deliveryDate) load.deliveryDate = input.deliveryDate;
    if (input.rate !== undefined) load.rate = input.rate;
    if (input.miles !== undefined) load.miles = input.miles;

    if (input.status && input.status !== load.status) {
      load.status = input.status;
      appendTimelineEvent(
        load,
        input.status,
        `Status updated to ${LOAD_STATUS_LABELS[input.status]}`,
        `${load.destination.city}, ${load.destination.state}`,
      );
    }

    return touchLoad(load);
  },

  async assignDriver(tenantId, loadId, input: AssignDriverInput) {
    const load = getTenantLoad(tenantId, loadId);

    if (!load) {
      throw new Error("Load not found.");
    }

    const driver = getDriverById(input.driverId);

    if (!driver || driver.tenantId !== tenantId) {
      throw new Error("Driver not found.");
    }

    load.driverId = input.driverId;
    appendTimelineEvent(
      load,
      "assigned",
      `Driver assigned: ${driver.name}`,
      driver.location,
    );
    applyAssignmentStatus(load);

    return touchLoad(load);
  },

  async assignTruck(tenantId, loadId, input: AssignTruckInput) {
    const load = getTenantLoad(tenantId, loadId);

    if (!load) {
      throw new Error("Load not found.");
    }

    const truck = getTruckById(input.truckId);

    if (!truck || truck.tenantId !== tenantId) {
      throw new Error("Truck not found.");
    }

    load.truckId = input.truckId;
    appendTimelineEvent(
      load,
      "assigned",
      `Truck assigned: Unit ${truck.unitNumber}`,
      truck.location,
    );
    applyAssignmentStatus(load);

    return touchLoad(load);
  },
};
