import type { BusinessRole } from "@/lib/auth/roles";
import type { LoadStatus } from "@/lib/types/load";

const FORWARD_TRANSITION: Partial<Record<LoadStatus, LoadStatus>> = {
  pending: "dispatched",
  dispatched: "en_route_to_pickup",
  en_route_to_pickup: "arrived_pickup",
  arrived_pickup: "picked_up",
  picked_up: "in_transit",
  in_transit: "arrived_delivery",
  arrived_delivery: "delivered",
};

const LOAD_UPDATE_ROLES = new Set<BusinessRole>([
  "super_admin",
  "owner",
  "dispatcher",
  "driver",
]);

const LOAD_ASSIGNMENT_ROLES = new Set<BusinessRole>([
  "super_admin",
  "owner",
  "dispatcher",
]);

export function canRecordLoadFacts(role: BusinessRole): boolean {
  return LOAD_UPDATE_ROLES.has(role);
}

export function canAssignLoads(role: BusinessRole): boolean {
  return LOAD_ASSIGNMENT_ROLES.has(role);
}

export function canManageLoadClosure(role: BusinessRole): boolean {
  return LOAD_ASSIGNMENT_ROLES.has(role);
}

export function allowedNextLoadStatuses(
  role: BusinessRole,
  current: LoadStatus,
): LoadStatus[] {
  if (!canRecordLoadFacts(role) || current === "closed" || current === "cancelled") {
    return [];
  }
  const next = FORWARD_TRANSITION[current];
  const statuses: LoadStatus[] = [];
  if (
    next &&
    !(current === "pending" && role === "driver")
  ) {
    statuses.push(next);
  }
  if (
    role !== "driver" &&
    current !== "delivered"
  ) {
    statuses.push("cancelled");
  }
  return statuses;
}

export function isLoadStatus(value: unknown): value is LoadStatus {
  return (
    typeof value === "string" &&
    [
      "pending",
      "dispatched",
      "en_route_to_pickup",
      "arrived_pickup",
      "picked_up",
      "in_transit",
      "arrived_delivery",
      "delivered",
      "closed",
      "cancelled",
    ].includes(value)
  );
}
