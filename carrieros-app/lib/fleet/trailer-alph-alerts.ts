import type { Load, MaintenanceRecord, Trailer } from "@/lib/types";
import { isReeferTrailer } from "@/lib/types";
import {
  getTrailerOperationalStatus,
  openTrailerMaintenanceCount,
  trailerHasActiveLoad,
} from "@/lib/fleet/trailer-board";
import type { ReeferTelemetrySnapshot } from "@/lib/fleet/reefer-provider";

export type TrailerAlphAlertSeverity = "info" | "warning" | "critical";

export type TrailerAlphFixAction =
  | "scheduleService"
  | "viewMaintenance"
  | "viewTires"
  | "viewReefer"
  | "viewDocuments"
  | "assignTrailer"
  | "reportDamage";

export type TrailerAlphAlert = {
  id: string;
  severity: TrailerAlphAlertSeverity;
  message: string;
  fixLabel: string;
  fixAction: TrailerAlphFixAction;
};

export type TrailerAlphMetrics = {
  breakdownRiskScore: number;
  predictedServiceDueDays: number | null;
  tireReplacementMiles: number | null;
  inspectionDueDays: number | null;
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

/** Placeholder Alph intelligence — replace with model / OEM / telematics signals later. */
export function computeTrailerAlphMetrics(
  trailer: Trailer,
  maintenance: MaintenanceRecord[],
  reefer?: ReeferTelemetrySnapshot | null,
): TrailerAlphMetrics {
  const daysSinceService = daysSince(trailer.lastServiceDate) ?? 150;
  const openWork = openTrailerMaintenanceCount(maintenance);
  const mileage = trailer.mileage ?? 120_000;

  let risk = 16;
  if (trailer.status === "in_shop") risk += 22;
  if (trailer.status === "out_of_service") risk += 40;
  if (daysSinceService > 90) risk += 12;
  if (daysSinceService > 180) risk += 18;
  if (openWork > 0) risk += 10;
  if (mileage > 250_000) risk += 12;

  if (reefer) {
    const tempDelta = Math.abs(reefer.currentTempF - reefer.setTempF);
    if (tempDelta >= 4) risk += 14;
    if (reefer.fuelLevelPercent < 15) risk += 12;
    if (reefer.alarms.some((alarm) => alarm.severity === "critical")) risk += 16;
  }

  const predictedServiceDueDays = Math.max(0, 90 - daysSinceService);
  const tireReplacementMiles = Math.max(0, 100_000 - (mileage % 100_000));
  const inspectionDueDays = Math.max(0, 365 - (daysSinceService + 40));

  return {
    breakdownRiskScore: Math.min(99, Math.max(5, Math.round(risk))),
    predictedServiceDueDays,
    tireReplacementMiles,
    inspectionDueDays,
  };
}

export function detectTrailerAlphAlerts(
  trailer: Trailer,
  loads: Load[],
  maintenance: MaintenanceRecord[],
  reefer?: ReeferTelemetrySnapshot | null,
): TrailerAlphAlert[] {
  const results: TrailerAlphAlert[] = [];
  const metrics = computeTrailerAlphMetrics(trailer, maintenance, reefer);
  const operational = getTrailerOperationalStatus(trailer, loads);
  const onLoad = trailerHasActiveLoad(trailer, loads);

  if (
    metrics.predictedServiceDueDays !== null &&
    metrics.predictedServiceDueDays <= 14
  ) {
    results.push({
      id: `${trailer.id}-service-due`,
      severity: metrics.predictedServiceDueDays <= 3 ? "critical" : "warning",
      message:
        metrics.predictedServiceDueDays <= 0
          ? "Preventive service is overdue — schedule before next assignment"
          : `Service due in ~${metrics.predictedServiceDueDays} days`,
      fixLabel: "Schedule Service",
      fixAction: "scheduleService",
    });
  }

  if (
    metrics.tireReplacementMiles !== null &&
    metrics.tireReplacementMiles < 15_000
  ) {
    results.push({
      id: `${trailer.id}-tires`,
      severity: metrics.tireReplacementMiles < 5_000 ? "critical" : "warning",
      message: `Tire replacement predicted in ~${metrics.tireReplacementMiles.toLocaleString()} mi`,
      fixLabel: "View Tires",
      fixAction: "viewTires",
    });
  }

  if (
    metrics.inspectionDueDays !== null &&
    metrics.inspectionDueDays <= 30
  ) {
    results.push({
      id: `${trailer.id}-inspection`,
      severity: metrics.inspectionDueDays <= 7 ? "critical" : "warning",
      message:
        metrics.inspectionDueDays <= 0
          ? "Annual inspection is overdue"
          : `Inspection due in ~${metrics.inspectionDueDays} days`,
      fixLabel: "View Documents",
      fixAction: "viewDocuments",
    });
  }

  if (isReeferTrailer(trailer) && reefer) {
    const tempDelta = Math.abs(reefer.currentTempF - reefer.setTempF);
    if (tempDelta >= 3) {
      results.push({
        id: `${trailer.id}-temp-dev`,
        severity: tempDelta >= 6 ? "critical" : "warning",
        message: `Temperature deviation ${tempDelta.toFixed(1)}°F from set point`,
        fixLabel: "View Reefer",
        fixAction: "viewReefer",
      });
    }

    if (reefer.fuelLevelPercent < 20) {
      results.push({
        id: `${trailer.id}-fuel-low`,
        severity: reefer.fuelLevelPercent < 10 ? "critical" : "warning",
        message: `Reefer fuel running low — ${reefer.fuelLevelPercent}% remaining`,
        fixLabel: "View Reefer",
        fixAction: "viewReefer",
      });
    }

    const openAlarms = reefer.alarms.filter((alarm) => !alarm.clearedAt);
    if (openAlarms.length > 0) {
      const worst = openAlarms.some((a) => a.severity === "critical")
        ? "critical"
        : "warning";
      results.push({
        id: `${trailer.id}-reefer-alarms`,
        severity: worst,
        message: `${openAlarms.length} active reefer alarm${openAlarms.length === 1 ? "" : "s"} detected`,
        fixLabel: "View Reefer",
        fixAction: "viewReefer",
      });
    }
  }

  if (metrics.breakdownRiskScore >= 55) {
    results.push({
      id: `${trailer.id}-breakdown`,
      severity: metrics.breakdownRiskScore >= 75 ? "critical" : "warning",
      message: `Breakdown risk score ${metrics.breakdownRiskScore}/100`,
      fixLabel: "Report Damage",
      fixAction: "reportDamage",
    });
  }

  if (
    (operational === "available" || operational === "empty" || operational === "in_yard") &&
    !trailer.truckId
  ) {
    results.push({
      id: `${trailer.id}-unassigned`,
      severity: "info",
      message: `Trailer ${trailer.unitNumber} is ready — assign to a truck or load`,
      fixLabel: "Assign Trailer",
      fixAction: "assignTrailer",
    });
  }

  if (onLoad && operational === "in_shop") {
    results.push({
      id: `${trailer.id}-shop-conflict`,
      severity: "critical",
      message: "Trailer is in shop but still linked to an active load",
      fixLabel: "View Maintenance",
      fixAction: "viewMaintenance",
    });
  }

  const severityOrder: Record<TrailerAlphAlertSeverity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };

  return results
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
    .slice(0, 5);
}
