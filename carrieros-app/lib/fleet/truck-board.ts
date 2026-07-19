import type { FuelRecord, Load, MaintenanceRecord, Truck, TruckStatus } from "@/lib/types";

const ACTIVE_LOAD_STATUSES = new Set<Load["status"]>([
  "dispatched",
  "picked_up",
  "in_transit",
]);

export type TruckDashboardStats = {
  totalTrucks: number;
  available: number;
  onLoad: number;
  idle: number;
  inShop: number;
  outOfService: number;
};

export function truckHasActiveLoad(truckId: string, loads: Load[]): boolean {
  return loads.some(
    (load) => load.truckId === truckId && ACTIVE_LOAD_STATUSES.has(load.status),
  );
}

export function getActiveLoadsForTruck(truckId: string, loads: Load[]): Load[] {
  return loads.filter(
    (load) => load.truckId === truckId && ACTIVE_LOAD_STATUSES.has(load.status),
  );
}

/**
 * Resolve display status from stored equipment status + live load assignment.
 * Active loads win over "available" / "idle" / "on_load" stored values.
 */
export function getTruckOperationalStatus(
  truck: Truck,
  loads: Load[],
): TruckStatus {
  if (truck.status === "out_of_service" || truck.status === "in_shop") {
    return truck.status;
  }

  if (truckHasActiveLoad(truck.id, loads)) {
    return "on_load";
  }

  if (truck.status === "on_load") {
    return "idle";
  }

  return truck.status;
}

export function buildTruckDashboardStats(
  trucks: Truck[],
  loads: Load[],
): TruckDashboardStats {
  const stats: TruckDashboardStats = {
    totalTrucks: trucks.length,
    available: 0,
    onLoad: 0,
    idle: 0,
    inShop: 0,
    outOfService: 0,
  };

  for (const truck of trucks) {
    const status = getTruckOperationalStatus(truck, loads);
    switch (status) {
      case "available":
        stats.available += 1;
        break;
      case "on_load":
        stats.onLoad += 1;
        break;
      case "idle":
        stats.idle += 1;
        break;
      case "in_shop":
        stats.inShop += 1;
        break;
      case "out_of_service":
        stats.outOfService += 1;
        break;
      default:
        break;
    }
  }

  return stats;
}

export function filterTrucksByQuery(trucks: Truck[], query: string): Truck[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return trucks;
  }

  return trucks.filter((truck) =>
    [
      truck.unitNumber,
      truck.vin,
      truck.make,
      truck.model,
      String(truck.year),
      truck.licensePlate,
      truck.licenseState ?? "",
      truck.status,
      truck.location ?? "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
}

export function computeFuelMetrics(fuelRecords: FuelRecord[]) {
  if (fuelRecords.length === 0) {
    return {
      totalGallons: 0,
      totalCost: 0,
      avgMpg: null as number | null,
      fillCount: 0,
    };
  }

  const sorted = [...fuelRecords].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const totalGallons = sorted.reduce((sum, record) => sum + record.gallons, 0);
  const totalCost = sorted.reduce((sum, record) => sum + record.cost, 0);

  let milesDriven = 0;
  let gallonsForMpg = 0;
  for (let i = 1; i < sorted.length; i += 1) {
    const deltaMiles = sorted[i].mileage - sorted[i - 1].mileage;
    if (deltaMiles > 0 && sorted[i].gallons > 0) {
      milesDriven += deltaMiles;
      gallonsForMpg += sorted[i].gallons;
    }
  }

  return {
    totalGallons,
    totalCost,
    avgMpg: gallonsForMpg > 0 ? milesDriven / gallonsForMpg : null,
    fillCount: sorted.length,
  };
}

export function openMaintenanceCount(records: MaintenanceRecord[]): number {
  return records.filter((record) => record.status !== "completed").length;
}
