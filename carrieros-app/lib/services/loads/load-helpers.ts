import type { ComplianceStatus, Load, LoadStatus } from "@/lib/types";
import { getDriverById } from "@/lib/data/drivers";
import { getTruckById } from "@/lib/data/trucks";

export function formatLoadLane(load: Pick<Load, "origin" | "destination">): string {
  return `${load.origin.city}, ${load.origin.state} → ${load.destination.city}, ${load.destination.state}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function nextLoadReference(existingLoads: Load[]): string {
  const numbers = existingLoads
    .map((load) => Number.parseInt(load.reference.replace("LD-", ""), 10))
    .filter((value) => !Number.isNaN(value));

  const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 24001;
  return `LD-${nextNumber}`;
}

export function createTimelineEventId(loadId: string): string {
  return `evt-${loadId}-${Date.now()}`;
}

export function buildNovaSummary(load: Load): string {
  const hasDriver = Boolean(load.driverId);
  const hasTruck = Boolean(load.truckId);

  if (!hasDriver && !hasTruck) {
    return "Driver and truck assignment required.";
  }

  if (!hasDriver) {
    return "Truck assigned. Driver assignment required.";
  }

  if (!hasTruck) {
    return "Driver assigned. Truck assignment required.";
  }

  if (load.status === "pending") {
    return "Driver and truck assigned. Ready to dispatch.";
  }

  if (load.status === "delivered" && !load.invoiceId) {
    return "Delivered. Invoice not yet generated.";
  }

  if (load.status === "invoiced") {
    return "Invoiced and ready for payment tracking.";
  }

  if (load.status === "in_transit") {
    return "Load in transit. ETA on schedule.";
  }

  return "Driver and truck assigned. All required dispatch data present.";
}

export function deriveComplianceStatus(load: Load): ComplianceStatus {
  if (!load.driverId || !load.truckId) {
    return "attention";
  }

  if (load.documentIds.length === 0) {
    return "attention";
  }

  if (load.status === "delivered" && !load.invoiceId) {
    return "attention";
  }

  return "clear";
}

export function resolveDispatchStatus(currentStatus: LoadStatus, load: Load): LoadStatus {
  if (
    currentStatus === "pending" &&
    load.driverId &&
    load.truckId
  ) {
    return "dispatched";
  }

  return currentStatus;
}

export function getAssignmentLabels(load: Load) {
  const driver = load.driverId ? getDriverById(load.driverId) : undefined;
  const truck = load.truckId ? getTruckById(load.truckId) : undefined;

  return {
    driverName: driver?.name,
    truckLabel: truck ? `Unit ${truck.unitNumber}` : undefined,
  };
}
