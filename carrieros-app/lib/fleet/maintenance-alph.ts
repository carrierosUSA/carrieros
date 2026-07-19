import type { Trailer, Truck } from "@/lib/types";
import type {
  PartInventoryItem,
  PmSchedule,
  RepairRecord,
  TireAsset,
  WorkOrder,
} from "@/lib/types/maintenance";

export type MaintenanceAlphSeverity = "info" | "warning" | "critical";

export type MaintenanceAlphFixAction =
  | "createWorkOrder"
  | "schedulePm"
  | "viewParts"
  | "viewTires"
  | "viewRepairs"
  | "viewWorkOrders"
  | "reportBreakdown"
  | "orderParts"
  | "assignMechanic";

export type MaintenanceAlphAlert = {
  id: string;
  severity: MaintenanceAlphSeverity;
  message: string;
  fixLabel: string;
  fixAction: MaintenanceAlphFixAction;
  unitLabel?: string;
};

export type MaintenanceAlphPrediction = {
  id: string;
  kind:
    | "engine_failure"
    | "tire_replacement"
    | "battery_failure"
    | "brake_wear"
    | "reefer_failure"
    | "pm_overdue"
    | "breakdown_probability"
    | "estimated_repair_cost";
  label: string;
  unitLabel: string;
  probabilityPercent: number;
  estimatedCost?: number;
  severity: MaintenanceAlphSeverity;
};

type AlphInput = {
  trucks: Truck[];
  trailers: Trailer[];
  pmSchedules: PmSchedule[];
  workOrders: WorkOrder[];
  repairs: RepairRecord[];
  parts: PartInventoryItem[];
  tires: TireAsset[];
};

function unitLabel(trucks: Truck[], trailers: Trailer[], truckId?: string, trailerId?: string) {
  if (truckId) {
    const t = trucks.find((x) => x.id === truckId);
    return t ? `Unit ${t.unitNumber}` : truckId;
  }
  if (trailerId) {
    const t = trailers.find((x) => x.id === trailerId);
    return t ? `Trailer ${t.unitNumber}` : trailerId;
  }
  return "Fleet";
}

/** Placeholder Alph intelligence — replace with telematics / OEM model signals. */
export function buildMaintenanceAlphPredictions(
  input: AlphInput,
): MaintenanceAlphPrediction[] {
  const predictions: MaintenanceAlphPrediction[] = [];

  for (const truck of input.trucks) {
    const openWo = input.workOrders.filter(
      (w) =>
        w.truckId === truck.id &&
        w.status !== "completed" &&
        w.status !== "closed",
    ).length;
    const daysSince =
      truck.lastServiceDate
        ? Math.floor(
            (Date.now() - new Date(truck.lastServiceDate).getTime()) /
              (24 * 60 * 60 * 1000),
          )
        : 120;

    let engineRisk = 12 + (truck.mileage > 200_000 ? 25 : 0) + (daysSince > 90 ? 15 : 0);
    if (truck.status === "out_of_service") engineRisk += 30;
    if (openWo > 0) engineRisk += 10;

    predictions.push({
      id: `pred-engine-${truck.id}`,
      kind: "engine_failure",
      label: "Engine failure risk",
      unitLabel: `Unit ${truck.unitNumber}`,
      probabilityPercent: Math.min(92, engineRisk),
      estimatedCost: engineRisk > 40 ? 8500 : 2200,
      severity: engineRisk >= 50 ? "critical" : engineRisk >= 30 ? "warning" : "info",
    });

    let breakdown = 10 + (truck.idleHours ?? 0) * 0.4;
    if (truck.status === "in_shop") breakdown += 20;
    if (truck.mpg && truck.mpg < 6) breakdown += 12;
    predictions.push({
      id: `pred-break-${truck.id}`,
      kind: "breakdown_probability",
      label: "Breakdown probability (30 days)",
      unitLabel: `Unit ${truck.unitNumber}`,
      probabilityPercent: Math.min(88, Math.round(breakdown)),
      estimatedCost: Math.round(breakdown * 45),
      severity: breakdown >= 45 ? "critical" : breakdown >= 25 ? "warning" : "info",
    });
  }

  for (const tire of input.tires) {
    if (tire.treadDepthMm > 6) continue;
    const milesLeft = Math.max(500, Math.round(tire.treadDepthMm * 3500));
    predictions.push({
      id: `pred-tire-${tire.id}`,
      kind: "tire_replacement",
      label: "Tire replacement due",
      unitLabel: unitLabel(input.trucks, input.trailers, tire.truckId, tire.trailerId),
      probabilityPercent: tire.treadDepthMm < 5 ? 85 : 60,
      estimatedCost: tire.cost,
      severity: tire.treadDepthMm < 5 ? "critical" : "warning",
    });
    void milesLeft;
  }

  for (const pm of input.pmSchedules.filter((p) => p.status === "overdue")) {
    predictions.push({
      id: `pred-pm-${pm.id}`,
      kind: "pm_overdue",
      label: "PM overdue",
      unitLabel: unitLabel(input.trucks, input.trailers, pm.truckId, pm.trailerId),
      probabilityPercent: 95,
      estimatedCost: 450,
      severity: "critical",
    });
  }

  const reeferTrailers = input.trailers.filter((t) => t.type === "reefer");
  for (const trailer of reeferTrailers) {
    const overdue = input.pmSchedules.some(
      (p) =>
        p.trailerId === trailer.id &&
        p.serviceType === "reefer_service" &&
        p.status === "overdue",
    );
    if (!overdue && (trailer.reeferEngineHours ?? 0) < 9000) continue;
    predictions.push({
      id: `pred-reefer-${trailer.id}`,
      kind: "reefer_failure",
      label: "Reefer failure risk",
      unitLabel: `Trailer ${trailer.unitNumber}`,
      probabilityPercent: overdue ? 72 : 38,
      estimatedCost: overdue ? 3200 : 900,
      severity: overdue ? "critical" : "warning",
    });
  }

  const lowBattery = input.parts.find((p) => p.partNumber.includes("BAT") && p.stock <= p.reorderLevel);
  if (lowBattery) {
    predictions.push({
      id: "pred-battery-fleet",
      kind: "battery_failure",
      label: "Battery failure risk elevated",
      unitLabel: "Fleet",
      probabilityPercent: 48,
      estimatedCost: 185,
      severity: "warning",
    });
  }

  const brakePm = input.pmSchedules.find(
    (p) => p.serviceType === "brake_inspection" && p.status !== "upcoming",
  );
  if (brakePm) {
    predictions.push({
      id: `pred-brake-${brakePm.id}`,
      kind: "brake_wear",
      label: "Brake wear attention",
      unitLabel: unitLabel(
        input.trucks,
        input.trailers,
        brakePm.truckId,
        brakePm.trailerId,
      ),
      probabilityPercent: brakePm.status === "overdue" ? 70 : 40,
      estimatedCost: 1200,
      severity: brakePm.status === "overdue" ? "critical" : "warning",
    });
  }

  return predictions
    .filter((p) => p.probabilityPercent >= 25 || p.severity !== "info")
    .sort((a, b) => b.probabilityPercent - a.probabilityPercent)
    .slice(0, 12);
}

export function detectMaintenanceAlphAlerts(
  input: AlphInput,
): MaintenanceAlphAlert[] {
  const alerts: MaintenanceAlphAlert[] = [];
  const predictions = buildMaintenanceAlphPredictions(input);

  for (const pred of predictions.slice(0, 8)) {
    if (pred.severity === "info" && pred.probabilityPercent < 40) continue;

    const actionMap: Record<
      MaintenanceAlphPrediction["kind"],
      { fixLabel: string; fixAction: MaintenanceAlphFixAction }
    > = {
      engine_failure: { fixLabel: "Create Work Order", fixAction: "createWorkOrder" },
      tire_replacement: { fixLabel: "View Tires", fixAction: "viewTires" },
      battery_failure: { fixLabel: "Order Parts", fixAction: "orderParts" },
      brake_wear: { fixLabel: "Schedule PM", fixAction: "schedulePm" },
      reefer_failure: { fixLabel: "Create Work Order", fixAction: "createWorkOrder" },
      pm_overdue: { fixLabel: "Schedule PM", fixAction: "schedulePm" },
      breakdown_probability: {
        fixLabel: "Report Breakdown",
        fixAction: "reportBreakdown",
      },
      estimated_repair_cost: {
        fixLabel: "View Repairs",
        fixAction: "viewRepairs",
      },
    };

    const mapped = actionMap[pred.kind];
    alerts.push({
      id: `alert-${pred.id}`,
      severity: pred.severity,
      message: `${pred.label} on ${pred.unitLabel} — ${pred.probabilityPercent}%${
        pred.estimatedCost ? ` · ~$${pred.estimatedCost.toLocaleString()}` : ""
      }`,
      fixLabel: mapped.fixLabel,
      fixAction: mapped.fixAction,
      unitLabel: pred.unitLabel,
    });
  }

  for (const part of input.parts.filter((p) => p.stock <= p.reorderLevel)) {
    alerts.push({
      id: `alert-part-${part.id}`,
      severity: part.stock === 0 ? "critical" : "warning",
      message:
        part.stock === 0
          ? `${part.name} is out of stock`
          : `${part.name} is low (${part.stock} left, reorder at ${part.reorderLevel})`,
      fixLabel: "Order Parts",
      fixAction: "orderParts",
    });
  }

  const unassigned = input.workOrders.filter(
    (w) =>
      !w.mechanicId &&
      w.status !== "completed" &&
      w.status !== "closed",
  );
  for (const wo of unassigned.slice(0, 2)) {
    alerts.push({
      id: `alert-assign-${wo.id}`,
      severity: wo.priority === "critical" ? "critical" : "warning",
      message: `${wo.number} needs a mechanic assigned`,
      fixLabel: "Assign Mechanic",
      fixAction: "assignMechanic",
    });
  }

  const severityRank = { critical: 0, warning: 1, info: 2 } as const;
  return alerts
    .sort((a, b) => severityRank[a.severity] - severityRank[b.severity])
    .slice(0, 10);
}
