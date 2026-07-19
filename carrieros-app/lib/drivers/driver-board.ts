import type { Driver, Load } from "@/lib/types";
import type { DriverOperationalStatus } from "@/lib/types/driver";

const ACTIVE_LOAD_STATUSES = new Set<Load["status"]>([
  "dispatched",
  "picked_up",
  "in_transit",
]);

export type DriverDashboardStats = {
  totalDrivers: number;
  active: number;
  onLoad: number;
  offDuty: number;
  available: number;
  expiringCdl: number;
  expiringMedical: number;
};

const EXPIRY_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;

function isExpiringSoon(dateStr: string, now = Date.now()): boolean {
  const expiresAt = new Date(dateStr).getTime();
  return expiresAt <= now + EXPIRY_WINDOW_MS && expiresAt >= now;
}

export function driverHasActiveLoad(driverId: string, loads: Load[]): boolean {
  return loads.some(
    (load) => load.driverId === driverId && ACTIVE_LOAD_STATUSES.has(load.status),
  );
}

export function getDriverOperationalStatus(
  driver: Driver,
  loads: Load[],
): DriverOperationalStatus {
  if (driver.status === "onboarding") {
    return "onboarding";
  }

  if (driver.status === "inactive" || driver.status === "terminated") {
    return "off_duty";
  }

  if (driverHasActiveLoad(driver.id, loads)) {
    return "on_load";
  }

  return "available";
}

export function buildDriverDashboardStats(
  drivers: Driver[],
  loads: Load[],
): DriverDashboardStats {
  let active = 0;
  let onLoad = 0;
  let offDuty = 0;
  let available = 0;
  let expiringCdl = 0;
  let expiringMedical = 0;

  for (const driver of drivers) {
    const operational = getDriverOperationalStatus(driver, loads);

    if (driver.status === "active") {
      active += 1;
    }

    if (operational === "on_load") {
      onLoad += 1;
    } else if (operational === "off_duty") {
      offDuty += 1;
    } else if (operational === "available") {
      available += 1;
    }

    if (isExpiringSoon(driver.licenseExpiresAt)) {
      expiringCdl += 1;
    }

    if (isExpiringSoon(driver.medicalExpiresAt)) {
      expiringMedical += 1;
    }
  }

  return {
    totalDrivers: drivers.length,
    active,
    onLoad,
    offDuty,
    available,
    expiringCdl,
    expiringMedical,
  };
}

export function filterDriversByQuery(drivers: Driver[], query: string): Driver[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return drivers;
  }

  return drivers.filter((driver) =>
    [
      driver.name,
      driver.email,
      driver.phone,
      driver.role,
      driver.location,
      driver.homeTerminal ?? "",
      driver.licenseState,
      driver.licenseNumber,
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
}
