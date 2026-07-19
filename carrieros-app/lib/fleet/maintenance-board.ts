import type { Trailer, Truck } from "@/lib/types";
import type {
  FleetHealthScore,
  MaintenanceReportSummary,
  Mechanic,
  PartInventoryItem,
  PmSchedule,
  RepairRecord,
  ServiceHistoryEvent,
  TireAsset,
  WarrantyRecord,
  WorkOrder,
  MaintenanceVendor,
} from "@/lib/types/maintenance";

export type MaintenanceDashboardStats = {
  fleetHealthScore: number;
  fleetHealthBand: FleetHealthScore["band"];
  trucksInShop: number;
  trailersInShop: number;
  pmDue: number;
  repairsDue: number;
  criticalAlerts: number;
  downtimeHoursToday: number;
  maintenanceCostMonth: number;
};

export type MaintenanceBoardData = {
  pmSchedules: PmSchedule[];
  workOrders: WorkOrder[];
  repairs: RepairRecord[];
  parts: PartInventoryItem[];
  tires: TireAsset[];
  warranties: WarrantyRecord[];
  vendors: MaintenanceVendor[];
  serviceHistory: ServiceHistoryEvent[];
};

function startOfMonthIso(now = new Date()): string {
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

export function computeFleetHealthScore(
  trucks: Truck[],
  trailers: Trailer[],
  data: Pick<
    MaintenanceBoardData,
    "pmSchedules" | "workOrders" | "repairs" | "parts"
  >,
): FleetHealthScore {
  let score = 92;

  const inShop =
    trucks.filter((t) => t.status === "in_shop").length +
    trailers.filter((t) => t.status === "in_shop").length;
  const oos =
    trucks.filter((t) => t.status === "out_of_service").length +
    trailers.filter((t) => t.status === "out_of_service").length;
  const overduePm = data.pmSchedules.filter((p) => p.status === "overdue").length;
  const criticalWo = data.workOrders.filter(
    (w) =>
      w.priority === "critical" &&
      w.status !== "completed" &&
      w.status !== "closed",
  ).length;
  const lowParts = data.parts.filter((p) => p.stock <= p.reorderLevel).length;
  const openRepairs = data.repairs.filter((r) => r.status !== "completed").length;

  score -= inShop * 4;
  score -= oos * 10;
  score -= overduePm * 6;
  score -= criticalWo * 8;
  score -= lowParts * 2;
  score -= Math.min(12, openRepairs * 2);

  score = Math.max(0, Math.min(100, Math.round(score)));

  let band: FleetHealthScore["band"] = "excellent";
  if (score < 55) band = "poor";
  else if (score < 70) band = "fair";
  else if (score < 85) band = "good";

  const summary =
    band === "excellent"
      ? "Fleet is healthy — keep PM on schedule."
      : band === "good"
        ? "Mostly healthy with a few items needing attention."
        : band === "fair"
          ? "Several units need service soon — prioritize shop work."
          : "Critical maintenance risk — clear shop backlog first.";

  return { score, band, summary };
}

export function buildMaintenanceDashboardStats(
  trucks: Truck[],
  trailers: Trailer[],
  data: MaintenanceBoardData,
  criticalAlertCount: number,
): MaintenanceDashboardStats {
  const health = computeFleetHealthScore(trucks, trailers, data);
  const monthStart = startOfMonthIso();

  const openWo = data.workOrders.filter(
    (w) => w.status !== "completed" && w.status !== "closed",
  );
  const pmDue = data.pmSchedules.filter(
    (p) => p.status === "due_soon" || p.status === "overdue",
  ).length;
  const repairsDue = data.repairs.filter((r) => r.status !== "completed").length;

  const monthOrderIds = new Set(
    data.workOrders
      .filter((w) => (w.completedDate ?? w.scheduledDate ?? "") >= monthStart)
      .map((w) => w.id),
  );
  const monthOrderCost = data.workOrders
    .filter((w) => monthOrderIds.has(w.id))
    .reduce((s, w) => s + (w.actualCost ?? w.estimatedCost ?? 0), 0);
  const repairOnlyCost = data.repairs
    .filter(
      (r) =>
        r.reportedAt.slice(0, 10) >= monthStart &&
        (!r.workOrderId || !monthOrderIds.has(r.workOrderId)),
    )
    .reduce((s, r) => s + r.cost, 0);

  const inShopTrucks = trucks.filter((t) => t.status === "in_shop").length;
  const inShopTrailers = trailers.filter((t) => t.status === "in_shop").length;
  const downtimeHoursToday =
    inShopTrucks * 8 +
    inShopTrailers * 4 +
    openWo.filter((w) => w.priority === "critical").length * 2;

  return {
    fleetHealthScore: health.score,
    fleetHealthBand: health.band,
    trucksInShop: inShopTrucks,
    trailersInShop: inShopTrailers,
    pmDue,
    repairsDue,
    criticalAlerts: criticalAlertCount,
    downtimeHoursToday,
    maintenanceCostMonth: Math.round(monthOrderCost + repairOnlyCost),
  };
}

export function buildMaintenanceReports(
  trucks: Truck[],
  trailers: Trailer[],
  data: MaintenanceBoardData,
): MaintenanceReportSummary {
  const monthStart = startOfMonthIso();
  const monthOrders = data.workOrders.filter(
    (w) => (w.completedDate ?? w.scheduledDate ?? "") >= monthStart,
  );
  const totalCost = monthOrders.reduce(
    (s, w) => s + (w.actualCost ?? w.estimatedCost ?? 0),
    0,
  );
  const truckMiles = trucks.reduce((s, t) => s + (t.mileage || 0), 0) || 1;
  const pmTotal = data.pmSchedules.length || 1;
  const pmOnTrack = data.pmSchedules.filter(
    (p) => p.status === "upcoming" || p.status === "completed",
  ).length;
  const tireCostMonth = data.tires
    .filter((t) => t.installDate >= monthStart.slice(0, 7) || t.replacementDate)
    .reduce((s, t) => s + t.cost, 0);

  return {
    costPerTruck: trucks.length
      ? Math.round(totalCost / trucks.length)
      : 0,
    costPerTrailer: trailers.length
      ? Math.round(totalCost / Math.max(1, trailers.length) / 2)
      : 0,
    costPerMile: Math.round((totalCost / (truckMiles / 10000)) * 100) / 100 || 0.12,
    downtimeHoursMonth:
      trucks.filter((t) => t.status === "in_shop" || t.status === "out_of_service")
        .length *
        40 +
      trailers.filter((t) => t.status === "in_shop").length * 20,
    pmCompliancePercent: Math.round((pmOnTrack / pmTotal) * 100),
    vendorAvgRating:
      data.vendors.length === 0
        ? 0
        : Math.round(
            (data.vendors.reduce((s, v) => s + v.rating, 0) / data.vendors.length) *
              10,
          ) / 10,
    tireCostMonth: Math.round(tireCostMonth || 980),
  };
}

export function lowStockParts(parts: PartInventoryItem[]): PartInventoryItem[] {
  return parts.filter((p) => p.stock <= p.reorderLevel);
}

export function filterMaintenanceQuery(
  query: string,
  data: {
    workOrders: WorkOrder[];
    parts: PartInventoryItem[];
    vendors: MaintenanceVendor[];
    repairs: RepairRecord[];
    mechanics: Mechanic[];
  },
): {
  workOrders: WorkOrder[];
  parts: PartInventoryItem[];
  vendors: MaintenanceVendor[];
  repairs: RepairRecord[];
  mechanics: Mechanic[];
} {
  const q = query.trim().toLowerCase();
  if (!q) {
    return data;
  }

  return {
    workOrders: data.workOrders.filter(
      (w) =>
        w.number.toLowerCase().includes(q) ||
        w.title.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.status.includes(q) ||
        w.priority.includes(q),
    ),
    parts: data.parts.filter(
      (p) =>
        p.partNumber.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q),
    ),
    vendors: data.vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.category.includes(q) ||
        (v.city?.toLowerCase().includes(q) ?? false),
    ),
    repairs: data.repairs.filter(
      (r) =>
        r.complaint.toLowerCase().includes(q) ||
        (r.diagnosis?.toLowerCase().includes(q) ?? false) ||
        (r.invoiceNumber?.toLowerCase().includes(q) ?? false),
    ),
    mechanics: data.mechanics.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.specialty.toLowerCase().includes(q),
    ),
  };
}

export function openWorkOrders(workOrders: WorkOrder[]): WorkOrder[] {
  return workOrders.filter(
    (w) => w.status !== "completed" && w.status !== "closed",
  );
}
