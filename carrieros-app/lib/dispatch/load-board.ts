import { getBrokerById } from "@/lib/data/brokers";
import { getCustomerById } from "@/lib/data/customers";
import { getDriverById } from "@/lib/data/drivers";
import { trailerStore } from "@/lib/data/fleet-store";
import { getTruckById } from "@/lib/data/trucks";
import type { Load } from "@/lib/types";
import { TRAILER_TYPE_LABELS } from "@/lib/types";

export type DispatchTab =
  | "all"
  | "new"
  | "assigned"
  | "in_transit"
  | "delivered"
  | "invoiced"
  | "cancelled";

export const DISPATCH_TABS: { id: DispatchTab; label: string }[] = [
  { id: "all", label: "All Loads" },
  { id: "new", label: "New" },
  { id: "assigned", label: "Assigned" },
  { id: "in_transit", label: "In Transit" },
  { id: "delivered", label: "Delivered" },
  { id: "invoiced", label: "Invoiced" },
  { id: "cancelled", label: "Cancelled" },
];

export const EQUIPMENT_TYPES = ["Dry Van", "Reefer", "Flatbed"] as const;

export type DispatchSortKey =
  | "reference"
  | "broker"
  | "customer"
  | "pickup"
  | "delivery"
  | "driver"
  | "truck"
  | "trailer"
  | "status"
  | "revenue";

export const DISPATCH_SORT_KEYS: DispatchSortKey[] = [
  "reference",
  "broker",
  "customer",
  "pickup",
  "delivery",
  "driver",
  "truck",
  "trailer",
  "status",
  "revenue",
];

export type DispatchLoadRow = {
  load: Load;
  brokerName: string;
  customerName: string;
  driverName?: string;
  truckLabel?: string;
  trailerLabel?: string;
  equipmentType: string;
};

export type DispatchFocus =
  | "pickup_today"
  | "delivery_today"
  | "missing_pod"
  | "needs_load";

export type DispatchSearchParams = {
  tab?: string;
  q?: string;
  driver?: string;
  broker?: string;
  from?: string;
  to?: string;
  equipment?: string;
  sort?: string;
  dir?: string;
  page?: string;
  pageSize?: string;
  details?: string;
  /** Home command-center deep links */
  focus?: string;
};

export function isDispatchFocus(
  value: string | undefined,
): value is DispatchFocus {
  return (
    value === "pickup_today" ||
    value === "delivery_today" ||
    value === "missing_pod" ||
    value === "needs_load"
  );
}

export const DEFAULT_PAGE_SIZE = 18;

export function isDispatchTab(value: string | undefined): value is DispatchTab {
  return DISPATCH_TABS.some((tab) => tab.id === value);
}

export function isDispatchSortKey(value: string | undefined): value is DispatchSortKey {
  return !!value && DISPATCH_SORT_KEYS.includes(value as DispatchSortKey);
}

export function matchesDispatchTab(load: Load, tab: DispatchTab): boolean {
  switch (tab) {
    case "all":
      return true;
    case "new":
      return load.status === "pending" && !load.driverId;
    case "assigned":
      return (
        Boolean(load.driverId) &&
        (load.status === "pending" || load.status === "dispatched")
      );
    case "in_transit":
      return load.status === "in_transit" || load.status === "picked_up";
    case "delivered":
      return load.status === "delivered";
    case "invoiced":
      return load.status === "invoiced";
    case "cancelled":
      return load.status === "cancelled";
    default:
      return true;
  }
}

function hasPodDocument(load: Load): boolean {
  return load.documentIds.some((id) => id.toLowerCase().includes("pod"));
}

/** Home deep-link filters — uses FINANCE_TODAY-aligned demo date when provided. */
export function matchesDispatchFocus(
  load: Load,
  focus: DispatchFocus,
  today: string,
): boolean {
  switch (focus) {
    case "pickup_today":
      return load.pickupDate === today;
    case "delivery_today":
      return load.deliveryDate === today;
    case "missing_pod":
      return (
        (load.status === "delivered" || load.status === "in_transit") &&
        !hasPodDocument(load)
      );
    case "needs_load":
      return load.status === "pending" && !load.driverId;
    default:
      return true;
  }
}

export function getTrailerForTruck(truckId?: string) {
  if (!truckId) {
    return undefined;
  }

  return trailerStore.find((trailer) => trailer.truckId === truckId);
}

export function resolveEquipmentType(load: Load): string {
  const trailer = getTrailerForTruck(load.truckId);
  return trailer ? TRAILER_TYPE_LABELS[trailer.type] : "Dry Van";
}

export function enrichLoadRow(load: Load): DispatchLoadRow {
  const brokerName = load.brokerId
    ? (getBrokerById(load.brokerId)?.name ?? "Unknown broker")
    : "Direct";
  const customerName =
    getCustomerById(load.customerId)?.name ?? "Unknown customer";
  const driverName = load.driverId
    ? getDriverById(load.driverId)?.name
    : undefined;
  const truck = load.truckId ? getTruckById(load.truckId) : undefined;
  const trailer = getTrailerForTruck(load.truckId);

  return {
    load,
    brokerName,
    customerName,
    driverName,
    truckLabel: truck ? `Unit ${truck.unitNumber}` : undefined,
    trailerLabel: trailer ? `TRL-${trailer.unitNumber}` : undefined,
    equipmentType: resolveEquipmentType(load),
  };
}

export function sortDispatchRows(
  rows: DispatchLoadRow[],
  sort: DispatchSortKey,
  dir: "asc" | "desc",
): DispatchLoadRow[] {
  const factor = dir === "asc" ? 1 : -1;

  return [...rows].sort((a, b) => {
    const valueFor = (row: DispatchLoadRow): string | number => {
      switch (sort) {
        case "reference":
          return row.load.reference;
        case "broker":
          return row.brokerName;
        case "customer":
          return row.customerName;
        case "pickup":
          return `${row.load.origin.city}, ${row.load.origin.state}`;
        case "delivery":
          return `${row.load.destination.city}, ${row.load.destination.state}`;
        case "driver":
          return row.driverName ?? "";
        case "truck":
          return row.truckLabel ?? "";
        case "trailer":
          return row.trailerLabel ?? "";
        case "status":
          return row.load.status;
        case "revenue":
          return row.load.rate;
        default:
          return row.load.reference;
      }
    };

    const left = valueFor(a);
    const right = valueFor(b);

    if (typeof left === "number" && typeof right === "number") {
      return (left - right) * factor;
    }

    return String(left).localeCompare(String(right)) * factor;
  });
}

export function paginateRows<T>(
  rows: T[],
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
) {
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    rows: rows.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

export function buildLoadsHref(
  params: DispatchSearchParams,
  updates: Partial<DispatchSearchParams> = {},
  options: { omitDetails?: boolean } = {},
): string {
  const merged: DispatchSearchParams = { ...params, ...updates };

  if (options.omitDetails) {
    delete merged.details;
  }

  const search = new URLSearchParams();

  if (merged.tab && merged.tab !== "all") search.set("tab", merged.tab);
  if (merged.focus) search.set("focus", merged.focus);
  if (merged.q) search.set("q", merged.q);
  if (merged.driver) search.set("driver", merged.driver);
  if (merged.broker) search.set("broker", merged.broker);
  if (merged.from) search.set("from", merged.from);
  if (merged.to) search.set("to", merged.to);
  if (merged.equipment) search.set("equipment", merged.equipment);
  if (merged.sort && merged.sort !== "reference") search.set("sort", merged.sort);
  if (merged.dir && merged.dir !== "desc") search.set("dir", merged.dir);
  if (merged.page && merged.page !== "1") search.set("page", merged.page);
  if (merged.pageSize && merged.pageSize !== "18") {
    search.set("pageSize", merged.pageSize);
  }
  if (merged.details && !options.omitDetails) search.set("details", merged.details);

  const query = search.toString();
  return query ? `/loads?${query}` : "/loads";
}

export function estimateLoadEconomics(load: Load) {
  const fuel = Math.round(load.miles * 0.62);
  const driverPay = Math.round(load.rate * 0.27);
  const accessorials = load.status === "delivered" || load.status === "invoiced" ? 75 : 0;
  const expenses = fuel + driverPay + accessorials;
  const margin = load.rate - expenses;

  return { fuel, driverPay, accessorials, expenses, margin };
}

export function formatDispatchDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

export function formatActivityTimestamp(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getDispatchNote(load: Load): string {
  if (load.status === "pending" && !load.driverId) {
    return "Broker confirmed rate. Awaiting driver assignment before dispatch window closes.";
  }

  if (load.status === "pending" && load.driverId) {
    return "Driver confirmed availability. Release dispatch once BOL is uploaded.";
  }

  if (load.status === "dispatched") {
    return "Driver acknowledged dispatch. Monitor pickup check-in and document capture.";
  }

  if (load.status === "in_transit" || load.status === "picked_up") {
    return "Active transit load. Track ETA and notify customer of any detention risk.";
  }

  if (load.status === "delivered" && !load.invoiceId) {
    return "Delivery complete. Generate invoice after POD approval.";
  }

  return "No open dispatcher notes. Load is progressing within SLA.";
}

export function countDispatchTabs(loads: Load[]): Record<DispatchTab, number> {
  return DISPATCH_TABS.reduce(
    (counts, tab) => {
      counts[tab.id] =
        tab.id === "all"
          ? loads.length
          : loads.filter((load) => matchesDispatchTab(load, tab.id)).length;
      return counts;
    },
    {} as Record<DispatchTab, number>,
  );
}

export function formatLoadReferences(load: Load) {
  const digits = load.reference.replace(/\D/g, "").padStart(5, "0").slice(-5);

  return {
    rv: `RV-${digits}`,
    po: `PO-${String(Number.parseInt(digits, 10) + 15000).padStart(5, "0")}`,
  };
}

export function formatStopScheduleLine(
  date: string,
  scheduledAt?: string,
): string {
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
  }).format(new Date(`${date}T12:00:00`));

  if (!scheduledAt) {
    return `${dateLabel} • FCFS`;
  }

  const timeLabel = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(scheduledAt));

  return `${dateLabel} • APT ${timeLabel}`;
}

export function formatStopDateTime(
  date: string,
  scheduledAt?: string,
  suffix = "APT",
): string {
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(`${date}T12:00:00`));

  if (!scheduledAt) {
    return `${dateLabel} - FCFS`;
  }

  const timeLabel = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(scheduledAt));

  return `${dateLabel} - ${suffix} ${timeLabel}`;
}

export function formatDriverFirstName(name?: string): string {
  if (!name) {
    return "—";
  }

  return name.split(" ")[0] ?? name;
}

export function formatTruckTrailerPair(
  truckLabel?: string,
  trailerLabel?: string,
): string {
  const truck = truckLabel?.replace(/^Unit\s+/i, "") ?? "—";
  const trailer = trailerLabel?.replace(/^TRL-/i, "") ?? "—";
  return `${truck} / ${trailer}`;
}

export type DispatchEtaInfo = {
  label: string;
  tone: "green" | "orange" | "red" | "blue" | "slate";
  delayed: boolean;
};

export function resolveDispatchEta(load: Load): DispatchEtaInfo {
  const delivery = new Date(`${load.deliveryDate}T18:00:00`);
  const etaDate = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(delivery);
  const etaDay = new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
  }).format(delivery);
  const label = `${etaDate} (${etaDay})`;
  const today = new Date().toISOString().slice(0, 10);
  const isPastDelivery = load.deliveryDate < today;
  const isActive =
    load.status === "dispatched" ||
    load.status === "picked_up" ||
    load.status === "in_transit";

  if (load.status === "delivered" || load.status === "invoiced") {
    return { label, tone: "blue", delayed: false };
  }

  if (load.complianceStatus === "attention" && isPastDelivery && isActive) {
    return { label, tone: "red", delayed: true };
  }

  if (load.complianceStatus === "attention" && (isActive || load.status === "pending")) {
    return { label, tone: "orange", delayed: true };
  }

  if (isActive) {
    return { label, tone: "green", delayed: false };
  }

  return { label, tone: "slate", delayed: false };
}

export type DispatchStatusDisplay = {
  label: string;
  tone: "blue" | "green" | "red" | "amber" | "slate";
};

export function resolveDispatchStatusDisplay(load: Load): DispatchStatusDisplay {
  if (load.status === "cancelled") {
    return { label: "Cancelled", tone: "slate" };
  }

  if (
    load.complianceStatus === "attention" &&
    (load.status === "in_transit" ||
      load.status === "picked_up" ||
      load.status === "dispatched")
  ) {
    return { label: "Delay", tone: "red" };
  }

  if (load.status === "in_transit" || load.status === "picked_up") {
    return { label: "In Transit", tone: "blue" };
  }

  if (
    load.status === "delivered" ||
    load.status === "invoiced" ||
    load.status === "dispatched"
  ) {
    return { label: "On Time", tone: "green" };
  }

  if (load.status === "pending") {
    return { label: "New", tone: "amber" };
  }

  return { label: String(load.status).replace("_", " "), tone: "slate" };
}

export function parsePageSize(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "18", 10);
  return [12, 15, 18, 20, 25].includes(parsed) ? parsed : DEFAULT_PAGE_SIZE;
}

export type DispatchSummaryStats = {
  active: number;
  pickupToday: number;
  deliveryToday: number;
  late: number;
  unassigned: number;
  missingPod: number;
};

function isActiveLoad(load: Load): boolean {
  return (
    load.status !== "delivered" &&
    load.status !== "invoiced" &&
    load.status !== "cancelled"
  );
}

export function computeDispatchSummary(loads: Load[]): DispatchSummaryStats {
  const today = new Date().toISOString().slice(0, 10);

  return {
    active: loads.filter(isActiveLoad).length,
    pickupToday: loads.filter((load) => load.pickupDate === today).length,
    deliveryToday: loads.filter((load) => load.deliveryDate === today).length,
    late: loads.filter(
      (load) =>
        isActiveLoad(load) &&
        load.complianceStatus === "attention" &&
        load.deliveryDate < today,
    ).length,
    unassigned: loads.filter(
      (load) => load.status === "pending" && !load.driverId,
    ).length,
    missingPod: loads.filter(
      (load) =>
        (load.status === "delivered" || load.status === "in_transit") &&
        !hasPodDocument(load),
    ).length,
  };
}
