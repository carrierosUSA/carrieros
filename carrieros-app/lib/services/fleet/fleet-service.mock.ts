import { drivers } from "@/lib/data/drivers";
import {
  fuelStore,
  maintenanceStore,
  trailerStore,
  truckStore,
} from "@/lib/data/fleet-store";
import { nextTrailerId, nextTruckId } from "@/lib/services/fleet/fleet-helpers";
import type {
  CreateTrailerInput,
  CreateTruckInput,
  FleetMetrics,
  FleetService,
  UpdateTrailerInput,
  UpdateTruckInput,
} from "@/lib/services/fleet/fleet-service";

function getTenantTruck(tenantId: string, truckId: string) {
  return truckStore.find(
    (truck) => truck.tenantId === tenantId && truck.id === truckId,
  );
}

function getTenantTrailer(tenantId: string, trailerId: string) {
  return trailerStore.find(
    (trailer) => trailer.tenantId === tenantId && trailer.id === trailerId,
  );
}

export const mockFleetService: FleetService = {
  async listDrivers(tenantId) {
    return drivers.filter((driver) => driver.tenantId === tenantId);
  },

  async listTrucks(tenantId) {
    return truckStore
      .filter((truck) => truck.tenantId === tenantId)
      .sort((a, b) => a.unitNumber.localeCompare(b.unitNumber));
  },

  async getTruck(tenantId, truckId) {
    return getTenantTruck(tenantId, truckId) ?? null;
  },

  async createTruck(tenantId, input: CreateTruckInput) {
    const truck = {
      tenantId,
      id: nextTruckId(),
      ...input,
    };

    truckStore.unshift(truck);
    return truck;
  },

  async updateTruck(tenantId, truckId, input: UpdateTruckInput) {
    const truck = getTenantTruck(tenantId, truckId);

    if (!truck) {
      throw new Error("Truck not found.");
    }

    Object.assign(truck, input);
    return truck;
  },

  async listTrailers(tenantId) {
    return trailerStore
      .filter((trailer) => trailer.tenantId === tenantId)
      .sort((a, b) => a.unitNumber.localeCompare(b.unitNumber));
  },

  async getTrailer(tenantId, trailerId) {
    return getTenantTrailer(tenantId, trailerId) ?? null;
  },

  async createTrailer(tenantId, input: CreateTrailerInput) {
    const trailer = {
      tenantId,
      id: nextTrailerId(),
      ...input,
    };

    trailerStore.unshift(trailer);
    return trailer;
  },

  async updateTrailer(tenantId, trailerId, input: UpdateTrailerInput) {
    const trailer = getTenantTrailer(tenantId, trailerId);

    if (!trailer) {
      throw new Error("Trailer not found.");
    }

    Object.assign(trailer, input);
    return trailer;
  },

  async listMaintenance(tenantId, truckId) {
    return maintenanceStore
      .filter(
        (record) =>
          record.tenantId === tenantId &&
          (truckId ? record.truckId === truckId : true),
      )
      .sort(
        (a, b) =>
          new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime(),
      );
  },

  async listFuelRecords(tenantId, truckId) {
    return fuelStore
      .filter(
        (record) =>
          record.tenantId === tenantId &&
          (truckId ? record.truckId === truckId : true),
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async getFleetMetrics(tenantId): Promise<FleetMetrics> {
    const tenantTrucks = truckStore.filter((truck) => truck.tenantId === tenantId);
    const tenantTrailers = trailerStore.filter(
      (trailer) => trailer.tenantId === tenantId,
    );
    const tenantMaintenance = maintenanceStore.filter(
      (record) => record.tenantId === tenantId,
    );
    const tenantFuel = fuelStore.filter((record) => record.tenantId === tenantId);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyFuelCost = tenantFuel
      .filter((record) => {
        const date = new Date(record.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((total, record) => total + record.cost, 0);

    return {
      totalTrucks: tenantTrucks.length,
      availableTrucks: tenantTrucks.filter((truck) => truck.status === "available")
        .length,
      assignedTrucks: tenantTrucks.filter((truck) => truck.status === "assigned")
        .length,
      maintenanceTrucks: tenantTrucks.filter(
        (truck) => truck.status === "maintenance",
      ).length,
      totalTrailers: tenantTrailers.length,
      openMaintenance: tenantMaintenance.filter(
        (record) => record.status !== "completed",
      ).length,
      monthlyFuelCost,
    };
  },
};
