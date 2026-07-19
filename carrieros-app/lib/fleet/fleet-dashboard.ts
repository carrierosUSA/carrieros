import { buildTrailerDocuments } from "@/lib/fleet/trailer-detail-data";
import { buildTruckDocuments } from "@/lib/fleet/truck-detail-data";
import {
  getActiveLoadsForTrailer,
  getTrailerOperationalStatus,
} from "@/lib/fleet/trailer-board";
import {
  getActiveLoadsForTruck,
  getTruckOperationalStatus,
} from "@/lib/fleet/truck-board";
import type {
  Driver,
  Load,
  MaintenanceRecord,
  Trailer,
  TrailerType,
  Truck,
} from "@/lib/types";
import { TRAILER_TYPE_LABELS } from "@/lib/types";
import type { TRANSPO_COLORS } from "@/lib/design-system/colors";

/** Unified operational status across trucks + trailers for fleet overview filters. */
export type FleetOpsStatus =
  | "available"
  | "on_load"
  | "idle"
  | "in_shop"
  | "out_of_service";

export const FLEET_OPS_STATUS_LABELS: Record<FleetOpsStatus, string> = {
  available: "Available",
  on_load: "On Load",
  idle: "Idle",
  in_shop: "In Shop",
  out_of_service: "Out of Service",
};

export type FleetFilterKind = "equipment" | "status";

export type FleetFilter =
  | { kind: "equipment"; id: string }
  | { kind: "status"; id: FleetOpsStatus }
  | null;

export type FleetOverviewCard = {
  id: string;
  kind: FleetFilterKind;
  label: string;
  count: number;
  tone?: keyof typeof TRANSPO_COLORS;
  highlight?: "warning" | "critical";
};

export type FleetInventoryRow = {
  id: string;
  assetKind: "truck" | "trailer";
  unitNumber: string;
  assetTypeLabel: string;
  equipmentTypeLabel: string;
  equipmentGroupId: string;
  sizeLabel: string;
  lengthFt: number | null;
  trailerType: TrailerType | null;
  opsStatus: FleetOpsStatus;
  statusLabel: string;
  driverName: string | null;
  driverPhone: string | null;
  driverId: string | null;
  loadLabel: string | null;
  loadId: string | null;
  location: string | null;
  trailerAssignedLabel: string | null;
  trailerAssignedId: string | null;
  truckAssignedLabel: string | null;
  truckAssignedId: string | null;
  maintenanceLabel: string | null;
  maintenanceTone: "ok" | "warning" | "critical";
  complianceLabel: string | null;
  complianceTone: "ok" | "warning" | "critical";
  lastUpdatedLabel: string | null;
  vin: string | null;
  plate: string | null;
  detailHref: string;
};

const PRIMARY_TRAILER_TYPES: TrailerType[] = [
  "reefer",
  "dry_van",
  "flatbed",
  "step_deck",
];

/**
 * Resolve trailer length from explicit field, then VIN heuristics, then
 * industry defaults for dry van / reefer.
 */
export function getTrailerLengthFt(trailer: Trailer): number | null {
  if (typeof trailer.lengthFt === "number" && trailer.lengthFt > 0) {
    return trailer.lengthFt;
  }

  const vin = trailer.vin ?? "";
  if (/532|253|53['_]|53ft|53-ft/i.test(vin) || /53/.test(vin.slice(4, 8))) {
    return 53;
  }
  if (/48/.test(vin.slice(4, 8))) {
    return 48;
  }

  if (trailer.type === "dry_van" || trailer.type === "reefer") {
    return 53;
  }

  return null;
}

export function formatSizeLabel(lengthFt: number | null): string {
  return lengthFt ? `${lengthFt} ft` : "—";
}

export function getTrailerEquipmentGroupId(trailer: Trailer): string {
  const lengthFt = getTrailerLengthFt(trailer);
  if (PRIMARY_TRAILER_TYPES.includes(trailer.type)) {
    return lengthFt
      ? `trailer:${trailer.type}:${lengthFt}`
      : `trailer:${trailer.type}`;
  }
  return "trailer:other";
}

export function getTrailerEquipmentLabel(trailer: Trailer): string {
  if (!PRIMARY_TRAILER_TYPES.includes(trailer.type)) {
    return "Other";
  }
  const typeLabel = TRAILER_TYPE_LABELS[trailer.type];
  const lengthFt = getTrailerLengthFt(trailer);
  return lengthFt ? `${typeLabel} ${lengthFt} ft` : typeLabel;
}

export function mapTruckOpsStatus(truck: Truck, loads: Load[]): FleetOpsStatus {
  return getTruckOperationalStatus(truck, loads);
}

export function mapTrailerOpsStatus(
  trailer: Trailer,
  loads: Load[],
): FleetOpsStatus {
  const status = getTrailerOperationalStatus(trailer, loads);
  switch (status) {
    case "available":
      return "available";
    case "loaded":
      return "on_load";
    case "empty":
    case "in_yard":
      return "idle";
    case "in_shop":
      return "in_shop";
    case "out_of_service":
      return "out_of_service";
    default:
      return "idle";
  }
}

function daysSince(dateStr: string | undefined): number | null {
  if (!dateStr) return null;
  const ms = Date.now() - new Date(`${dateStr}T12:00:00Z`).getTime();
  return ms / (1000 * 60 * 60 * 24);
}

function formatRelativeDate(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  const days = daysSince(dateStr);
  if (days === null) return null;
  if (days < 1) return "Today";
  if (days < 2) return "Yesterday";
  if (days < 14) return `${Math.floor(days)}d ago`;
  return dateStr;
}

function openMaintenanceForAsset(
  assetKind: "truck" | "trailer",
  assetId: string,
  records: MaintenanceRecord[],
): MaintenanceRecord[] {
  return records.filter((record) => {
    if (record.status === "completed") return false;
    if (assetKind === "truck") return record.truckId === assetId;
    return record.trailerId === assetId;
  });
}

function resolveMaintenanceSummary(
  assetKind: "truck" | "trailer",
  assetId: string,
  opsStatus: FleetOpsStatus,
  lastServiceDate: string | undefined,
  records: MaintenanceRecord[],
): { label: string | null; tone: "ok" | "warning" | "critical" } {
  const open = openMaintenanceForAsset(assetKind, assetId, records);
  if (opsStatus === "in_shop") {
    const title = open[0]?.type ?? "In shop";
    return { label: title, tone: "warning" };
  }
  if (opsStatus === "out_of_service") {
    const title = open[0]?.type ?? "Out of service";
    return { label: title, tone: "critical" };
  }
  if (open.length > 0) {
    return {
      label: open[0].type,
      tone: open[0].status === "in_progress" ? "warning" : "warning",
    };
  }
  const days = daysSince(lastServiceDate);
  if (days !== null && days > 90) {
    return { label: "Service overdue", tone: "warning" };
  }
  return { label: null, tone: "ok" };
}

function resolveComplianceSummary(
  assetKind: "truck" | "trailer",
  truck: Truck | null,
  trailer: Trailer | null,
): { label: string | null; tone: "ok" | "warning" | "critical" } {
  if (assetKind === "truck" && truck) {
    const docs = buildTruckDocuments(truck);
    const expired = docs.filter((d) => d.status === "expired");
    const expiring = docs.filter((d) => d.status === "expiring");
    if (expired.length > 0) {
      return { label: `${expired[0].name.split("·")[0].trim()} expired`, tone: "critical" };
    }
    if (expiring.length > 0) {
      return { label: `${expiring[0].name.split("·")[0].trim()} expiring`, tone: "warning" };
    }
    return { label: null, tone: "ok" };
  }

  if (trailer) {
    const docs = buildTrailerDocuments(trailer);
    const expired = docs.filter((d) => d.status === "expired");
    const expiring = docs.filter((d) => d.status === "expiring");
    if (expired.length > 0) {
      return { label: `${expired[0].name.split("·")[0].trim()} expired`, tone: "critical" };
    }
    if (expiring.length > 0) {
      return { label: `${expiring[0].name.split("·")[0].trim()} expiring`, tone: "warning" };
    }
  }

  return { label: null, tone: "ok" };
}

export function buildFleetInventoryRows(input: {
  trucks: Truck[];
  trailers: Trailer[];
  loads: Load[];
  drivers: Driver[];
  maintenance: MaintenanceRecord[];
}): FleetInventoryRow[] {
  const { trucks, trailers, loads, drivers, maintenance } = input;
  const driverById = new Map(drivers.map((d) => [d.id, d]));
  const truckById = new Map(trucks.map((t) => [t.id, t]));
  const trailersByTruck = new Map<string, Trailer>();
  for (const trailer of trailers) {
    if (trailer.truckId) {
      trailersByTruck.set(trailer.truckId, trailer);
    }
  }

  const rows: FleetInventoryRow[] = [];

  for (const truck of trucks) {
    const opsStatus = mapTruckOpsStatus(truck, loads);
    const activeLoads = getActiveLoadsForTruck(truck.id, loads);
    const load = activeLoads[0];
    const driver = truck.driverId ? driverById.get(truck.driverId) : undefined;
    const assignedTrailer = trailersByTruck.get(truck.id);
    const maint = resolveMaintenanceSummary(
      "truck",
      truck.id,
      opsStatus,
      truck.lastServiceDate,
      maintenance,
    );
    const compliance = resolveComplianceSummary("truck", truck, null);
    const lastUpdated =
      load?.updatedAt ?? truck.lastServiceDate ?? load?.pickupDate;

    rows.push({
      id: truck.id,
      assetKind: "truck",
      unitNumber: truck.unitNumber,
      assetTypeLabel: "Truck",
      equipmentTypeLabel: "Tractor",
      equipmentGroupId: "trucks",
      sizeLabel: "—",
      lengthFt: null,
      trailerType: null,
      opsStatus,
      statusLabel: FLEET_OPS_STATUS_LABELS[opsStatus],
      driverName: driver?.name ?? null,
      driverPhone: driver?.phone ?? null,
      driverId: truck.driverId ?? null,
      loadLabel: load?.reference ?? load?.loadNumber ?? null,
      loadId: load?.id ?? null,
      location: truck.location ?? null,
      trailerAssignedLabel: assignedTrailer
        ? `TRL ${assignedTrailer.unitNumber}`
        : null,
      trailerAssignedId: assignedTrailer?.id ?? null,
      truckAssignedLabel: null,
      truckAssignedId: null,
      maintenanceLabel: maint.label,
      maintenanceTone: maint.tone,
      complianceLabel: compliance.label,
      complianceTone: compliance.tone,
      lastUpdatedLabel: formatRelativeDate(lastUpdated),
      vin: truck.vin ?? null,
      plate: truck.licensePlate,
      detailHref: `/fleet/trucks/${truck.id}`,
    });
  }

  for (const trailer of trailers) {
    const opsStatus = mapTrailerOpsStatus(trailer, loads);
    const activeLoads = getActiveLoadsForTrailer(trailer, loads);
    const load = activeLoads[0];
    const assignedTruck = trailer.truckId
      ? truckById.get(trailer.truckId)
      : undefined;
    const driver = assignedTruck?.driverId
      ? driverById.get(assignedTruck.driverId)
      : undefined;
    const lengthFt = getTrailerLengthFt(trailer);
    const maint = resolveMaintenanceSummary(
      "trailer",
      trailer.id,
      opsStatus,
      trailer.lastServiceDate,
      maintenance,
    );
    const compliance = resolveComplianceSummary("trailer", null, trailer);
    const lastUpdated =
      load?.updatedAt ?? trailer.lastServiceDate ?? load?.pickupDate;

    rows.push({
      id: trailer.id,
      assetKind: "trailer",
      unitNumber: trailer.unitNumber,
      assetTypeLabel: "Trailer",
      equipmentTypeLabel: TRAILER_TYPE_LABELS[trailer.type],
      equipmentGroupId: getTrailerEquipmentGroupId(trailer),
      sizeLabel: formatSizeLabel(lengthFt),
      lengthFt,
      trailerType: trailer.type,
      opsStatus,
      statusLabel: FLEET_OPS_STATUS_LABELS[opsStatus],
      driverName: driver?.name ?? null,
      driverPhone: driver?.phone ?? null,
      driverId: assignedTruck?.driverId ?? null,
      loadLabel: load?.reference ?? load?.loadNumber ?? null,
      loadId: load?.id ?? null,
      location: trailer.location ?? null,
      trailerAssignedLabel: null,
      trailerAssignedId: null,
      truckAssignedLabel: assignedTruck
        ? `Unit ${assignedTruck.unitNumber}`
        : null,
      truckAssignedId: assignedTruck?.id ?? null,
      maintenanceLabel: maint.label,
      maintenanceTone: maint.tone,
      complianceLabel: compliance.label,
      complianceTone: compliance.tone,
      lastUpdatedLabel: formatRelativeDate(lastUpdated),
      vin: trailer.vin ?? null,
      plate: trailer.licensePlate,
      detailHref: `/fleet/trailers/${trailer.id}`,
    });
  }

  return rows.sort((a, b) => {
    const unitCmp = a.unitNumber.localeCompare(b.unitNumber, undefined, {
      numeric: true,
    });
    if (unitCmp !== 0) return unitCmp;
    return a.assetKind.localeCompare(b.assetKind);
  });
}

export function buildFleetOverviewCards(
  rows: FleetInventoryRow[],
): FleetOverviewCard[] {
  const trucks = rows.filter((r) => r.assetKind === "truck").length;

  const equipmentCounts = new Map<string, { label: string; count: number }>();
  for (const row of rows) {
    if (row.assetKind !== "trailer") continue;
    const id = row.equipmentGroupId;
    const label =
      id === "trailer:other"
        ? "Other"
        : row.lengthFt
          ? `${row.equipmentTypeLabel} ${row.lengthFt} ft`
          : row.equipmentTypeLabel;
    const existing = equipmentCounts.get(id);
    if (existing) {
      existing.count += 1;
    } else {
      equipmentCounts.set(id, { label, count: 1 });
    }
  }

  const equipmentOrder = [
    "trailer:reefer:53",
    "trailer:reefer",
    "trailer:dry_van:53",
    "trailer:dry_van",
    "trailer:flatbed:48",
    "trailer:flatbed:53",
    "trailer:flatbed",
    "trailer:step_deck:48",
    "trailer:step_deck:53",
    "trailer:step_deck",
    "trailer:other",
  ];

  const equipmentCards: FleetOverviewCard[] = [
    {
      id: "trucks",
      kind: "equipment",
      label: "Trucks",
      count: trucks,
      tone: "info",
    },
  ];

  const seen = new Set<string>();
  for (const id of equipmentOrder) {
    const entry = equipmentCounts.get(id);
    if (!entry || entry.count === 0) continue;
    equipmentCards.push({
      id,
      kind: "equipment",
      label: entry.label,
      count: entry.count,
    });
    seen.add(id);
  }
  for (const [id, entry] of equipmentCounts) {
    if (seen.has(id)) continue;
    equipmentCards.push({
      id,
      kind: "equipment",
      label: entry.label,
      count: entry.count,
    });
  }

  const statusCounts: Record<FleetOpsStatus, number> = {
    available: 0,
    on_load: 0,
    idle: 0,
    in_shop: 0,
    out_of_service: 0,
  };
  for (const row of rows) {
    statusCounts[row.opsStatus] += 1;
  }

  const statusCards: FleetOverviewCard[] = [
    {
      id: "available",
      kind: "status",
      label: "Available",
      count: statusCounts.available,
      tone: "success",
    },
    {
      id: "on_load",
      kind: "status",
      label: "On Load",
      count: statusCounts.on_load,
      tone: "info",
    },
    {
      id: "idle",
      kind: "status",
      label: "Idle",
      count: statusCounts.idle,
      tone: "disabled",
    },
    {
      id: "in_shop",
      kind: "status",
      label: "In Shop",
      count: statusCounts.in_shop,
      tone: "warning",
      highlight: statusCounts.in_shop > 0 ? "warning" : undefined,
    },
    {
      id: "out_of_service",
      kind: "status",
      label: "Out of Service",
      count: statusCounts.out_of_service,
      tone: "critical",
      highlight: statusCounts.out_of_service > 0 ? "critical" : undefined,
    },
  ];

  return [...equipmentCards, ...statusCards];
}

export function filterMatchesRow(
  row: FleetInventoryRow,
  filter: FleetFilter,
): boolean {
  if (!filter) return true;
  if (filter.kind === "status") {
    return row.opsStatus === filter.id;
  }
  if (filter.id === "trucks") {
    return row.assetKind === "truck";
  }
  return row.equipmentGroupId === filter.id;
}

export function searchFleetRows(
  rows: FleetInventoryRow[],
  query: string,
): FleetInventoryRow[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return rows;

  return rows.filter((row) =>
    [
      row.unitNumber,
      row.assetTypeLabel,
      row.equipmentTypeLabel,
      row.sizeLabel,
      row.statusLabel,
      row.opsStatus,
      row.driverName ?? "",
      row.loadLabel ?? "",
      row.location ?? "",
      row.trailerAssignedLabel ?? "",
      row.truckAssignedLabel ?? "",
      row.maintenanceLabel ?? "",
      row.complianceLabel ?? "",
      row.vin ?? "",
      row.plate ?? "",
      row.assetKind,
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
}

export function getFilterLabel(
  filter: FleetFilter,
  cards: FleetOverviewCard[],
): string | null {
  if (!filter) return null;
  const card = cards.find(
    (c) => c.kind === filter.kind && c.id === filter.id,
  );
  if (!card) return null;
  return `${card.label} · ${card.count}`;
}

/** Prefer shop units with open work when the In Shop filter is active. */
export function sortRowsForFilter(
  rows: FleetInventoryRow[],
  filter: FleetFilter,
): FleetInventoryRow[] {
  if (!filter || filter.kind !== "status" || filter.id !== "in_shop") {
    return rows;
  }

  const toneRank = { critical: 0, warning: 1, ok: 2 } as const;
  return [...rows].sort((a, b) => {
    const aRank = a.maintenanceLabel
      ? toneRank[a.maintenanceTone]
      : 3;
    const bRank = b.maintenanceLabel
      ? toneRank[b.maintenanceTone]
      : 3;
    if (aRank !== bRank) return aRank - bRank;
    return a.unitNumber.localeCompare(b.unitNumber, undefined, {
      numeric: true,
    });
  });
}
