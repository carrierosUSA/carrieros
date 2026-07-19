import type { Load, MaintenanceRecord, Trailer, TrailerStatus } from "@/lib/types";
import { TRAILER_TYPE_LABELS } from "@/lib/types";

const ACTIVE_LOAD_STATUSES = new Set<Load["status"]>([
  "dispatched",
  "picked_up",
  "in_transit",
]);

export type TrailerDashboardStats = {
  totalTrailers: number;
  available: number;
  loaded: number;
  empty: number;
  inYard: number;
  inShop: number;
  outOfService: number;
};

export function trailerHasActiveLoad(trailer: Trailer, loads: Load[]): boolean {
  if (!trailer.truckId) {
    return false;
  }

  return loads.some(
    (load) =>
      load.truckId === trailer.truckId && ACTIVE_LOAD_STATUSES.has(load.status),
  );
}

export function getActiveLoadsForTrailer(trailer: Trailer, loads: Load[]): Load[] {
  if (!trailer.truckId) {
    return [];
  }

  return loads.filter(
    (load) =>
      load.truckId === trailer.truckId && ACTIVE_LOAD_STATUSES.has(load.status),
  );
}

export function getLoadHistoryForTrailer(trailer: Trailer, loads: Load[]): Load[] {
  if (!trailer.truckId) {
    return [];
  }

  return loads
    .filter((load) => load.truckId === trailer.truckId)
    .sort(
      (a, b) =>
        new Date(b.pickupDate).getTime() - new Date(a.pickupDate).getTime(),
    );
}

/**
 * Resolve display status from stored equipment status + live load assignment.
 * Active loads win over available / empty / loaded stored values.
 */
export function getTrailerOperationalStatus(
  trailer: Trailer,
  loads: Load[],
): TrailerStatus {
  if (
    trailer.status === "out_of_service" ||
    trailer.status === "in_shop" ||
    trailer.status === "in_yard"
  ) {
    return trailer.status;
  }

  if (trailerHasActiveLoad(trailer, loads)) {
    return "loaded";
  }

  if (trailer.status === "loaded") {
    return trailer.truckId ? "empty" : "available";
  }

  return trailer.status;
}

export function buildTrailerDashboardStats(
  trailers: Trailer[],
  loads: Load[],
): TrailerDashboardStats {
  const stats: TrailerDashboardStats = {
    totalTrailers: trailers.length,
    available: 0,
    loaded: 0,
    empty: 0,
    inYard: 0,
    inShop: 0,
    outOfService: 0,
  };

  for (const trailer of trailers) {
    const status = getTrailerOperationalStatus(trailer, loads);
    switch (status) {
      case "available":
        stats.available += 1;
        break;
      case "loaded":
        stats.loaded += 1;
        break;
      case "empty":
        stats.empty += 1;
        break;
      case "in_yard":
        stats.inYard += 1;
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

export function filterTrailersByQuery(trailers: Trailer[], query: string): Trailer[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return trailers;
  }

  return trailers.filter((trailer) =>
    [
      trailer.unitNumber,
      trailer.vin ?? "",
      trailer.make ?? "",
      String(trailer.year ?? ""),
      trailer.licensePlate,
      trailer.licenseState ?? "",
      trailer.status,
      TRAILER_TYPE_LABELS[trailer.type],
      trailer.type,
      trailer.location ?? "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
}

export function openTrailerMaintenanceCount(records: MaintenanceRecord[]): number {
  return records.filter((record) => record.status !== "completed").length;
}

export function getMaintenanceForTrailer(
  trailerId: string,
  records: MaintenanceRecord[],
): MaintenanceRecord[] {
  return records.filter((record) => record.trailerId === trailerId);
}
