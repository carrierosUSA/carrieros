import type { FuelRecord, Load, MaintenanceRecord, Truck } from "@/lib/types";
import {
  computeFuelMetrics,
  getTruckOperationalStatus,
  truckHasActiveLoad,
} from "@/lib/fleet/truck-board";

export type TruckAlphAlertSeverity = "info" | "warning" | "critical";

export type TruckAlphFixAction =
  | "scheduleMaintenance"
  | "viewFuel"
  | "viewMaintenance"
  | "assignLoad"
  | "assignDriver"
  | "reportBreakdown"
  | "viewGps";

export type TruckAlphAlert = {
  id: string;
  severity: TruckAlphAlertSeverity;
  message: string;
  fixLabel: string;
  fixAction: TruckAlphFixAction;
};

export type TruckAlphMetrics = {
  breakdownRiskScore: number;
  costPerMile: number;
  predictedServiceDueDays: number | null;
  tireReplacementMiles: number | null;
};

function daysSince(dateStr: string | undefined, now = Date.now()): number | null {
  if (!dateStr) {
    return null;
  }
  const then = new Date(dateStr).getTime();
  if (Number.isNaN(then)) {
    return null;
  }
  return Math.floor((now - then) / (24 * 60 * 60 * 1000));
}

/** Placeholder Alph intelligence — replace with model / telematics signals later. */
export function computeTruckAlphMetrics(
  truck: Truck,
  maintenance: MaintenanceRecord[],
  fuelRecords: FuelRecord[],
): TruckAlphMetrics {
  const fuel = computeFuelMetrics(fuelRecords);
  const mpg = truck.mpg ?? fuel.avgMpg ?? 6.5;
  const idleHours = truck.idleHours ?? 8;
  const daysSinceService = daysSince(truck.lastServiceDate) ?? 120;
  const openWork = maintenance.filter((r) => r.status !== "completed").length;

  let risk = 18;
  if (truck.status === "in_shop") risk += 25;
  if (truck.status === "out_of_service") risk += 40;
  if (daysSinceService > 90) risk += 15;
  if (daysSinceService > 180) risk += 20;
  if (mpg < 5.5) risk += 12;
  if (idleHours > 20) risk += 10;
  if (openWork > 0) risk += 8;
  if (truck.mileage > 200_000) risk += 10;

  const costPerMile =
    truck.costPerMile ??
    Math.max(0.85, Math.min(2.4, 1.15 + idleHours * 0.012 + (6.5 - mpg) * 0.08));

  const predictedServiceDueDays =
    daysSinceService === null ? 30 : Math.max(0, 90 - daysSinceService);

  const tireReplacementMiles = Math.max(0, 80_000 - (truck.mileage % 80_000));

  return {
    breakdownRiskScore: Math.min(99, Math.max(5, Math.round(risk))),
    costPerMile: Math.round(costPerMile * 100) / 100,
    predictedServiceDueDays,
    tireReplacementMiles,
  };
}

export function detectTruckAlphAlerts(
  truck: Truck,
  loads: Load[],
  maintenance: MaintenanceRecord[],
  fuelRecords: FuelRecord[],
): TruckAlphAlert[] {
  const results: TruckAlphAlert[] = [];
  const metrics = computeTruckAlphMetrics(truck, maintenance, fuelRecords);
  const fuel = computeFuelMetrics(fuelRecords);
  const mpg = truck.mpg ?? fuel.avgMpg ?? null;
  const idleHours = truck.idleHours ?? 0;
  const operational = getTruckOperationalStatus(truck, loads);
  const onLoad = truckHasActiveLoad(truck.id, loads);

  if (
    metrics.predictedServiceDueDays !== null &&
    metrics.predictedServiceDueDays <= 14
  ) {
    results.push({
      id: `${truck.id}-service-due`,
      severity: metrics.predictedServiceDueDays <= 3 ? "critical" : "warning",
      message:
        metrics.predictedServiceDueDays <= 0
          ? "Preventive service is overdue — schedule before next dispatch"
          : `Service due in ~${metrics.predictedServiceDueDays} days`,
      fixLabel: "Schedule Maintenance",
      fixAction: "scheduleMaintenance",
    });
  }

  if (metrics.tireReplacementMiles !== null && metrics.tireReplacementMiles < 12_000) {
    results.push({
      id: `${truck.id}-tires`,
      severity: metrics.tireReplacementMiles < 4_000 ? "critical" : "warning",
      message: `Tire replacement predicted in ~${metrics.tireReplacementMiles.toLocaleString()} mi`,
      fixLabel: "View Maintenance",
      fixAction: "viewMaintenance",
    });
  }

  if (mpg !== null && mpg < 5.8) {
    results.push({
      id: `${truck.id}-low-mpg`,
      severity: mpg < 5.2 ? "critical" : "warning",
      message: `Low MPG detected — averaging ${mpg.toFixed(1)} MPG`,
      fixLabel: "View Fuel",
      fixAction: "viewFuel",
    });
  }

  if (idleHours > 18) {
    results.push({
      id: `${truck.id}-idle`,
      severity: idleHours > 30 ? "critical" : "warning",
      message: `Excessive idle — ${idleHours.toFixed(1)} hours this period`,
      fixLabel: "View GPS",
      fixAction: "viewGps",
    });
  }

  if (metrics.breakdownRiskScore >= 55) {
    results.push({
      id: `${truck.id}-breakdown`,
      severity: metrics.breakdownRiskScore >= 75 ? "critical" : "warning",
      message: `Breakdown risk score ${metrics.breakdownRiskScore}/100`,
      fixLabel: "Report Breakdown",
      fixAction: "reportBreakdown",
    });
  }

  if (operational === "available" && !truck.driverId) {
    results.push({
      id: `${truck.id}-no-driver`,
      severity: "info",
      message: `Unit ${truck.unitNumber} is available — assign a driver`,
      fixLabel: "Assign Driver",
      fixAction: "assignDriver",
    });
  } else if (operational === "available" || operational === "idle") {
    results.push({
      id: `${truck.id}-ready`,
      severity: "info",
      message: `Unit ${truck.unitNumber} is ready for the next load`,
      fixLabel: "Assign Load",
      fixAction: "assignLoad",
    });
  }

  if (onLoad && operational === "in_shop") {
    results.push({
      id: `${truck.id}-shop-conflict`,
      severity: "critical",
      message: "Truck is in shop but still linked to an active load",
      fixLabel: "View Maintenance",
      fixAction: "viewMaintenance",
    });
  }

  const severityOrder: Record<TruckAlphAlertSeverity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };

  return results
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
    .slice(0, 5);
}
