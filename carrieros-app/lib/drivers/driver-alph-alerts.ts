import type { Driver, Load } from "@/lib/types";
import {
  detectDriverAlerts,
  type DriverAlert,
} from "@/lib/drivers/driver-alerts";
import {
  driverHasActiveLoad,
  getDriverOperationalStatus,
} from "@/lib/drivers/driver-board";

export type DriverAlphAlertSeverity = "info" | "warning" | "critical";

export type DriverAlphFixAction =
  | "assignLoad"
  | "callDriver"
  | "messageDriver"
  | "uploadDocument"
  | "viewTimeline"
  | "viewDocuments";

export type DriverAlphAlert = {
  id: string;
  severity: DriverAlphAlertSeverity;
  message: string;
  fixLabel: string;
  fixAction: DriverAlphFixAction;
  viewTarget?: string;
};

function complianceAlertsToAlph(alerts: DriverAlert[]): DriverAlphAlert[] {
  return alerts.slice(0, 2).map((alert) => ({
    id: `alph-${alert.id}`,
    severity: alert.severity === "critical" ? "critical" : "warning",
    message: `${alert.label}: ${alert.detail}`,
    fixLabel: "Upload Document",
    fixAction: "uploadDocument" as const,
    viewTarget: "driver-documents",
  }));
}

export function detectDriverAlphAlerts(
  driver: Driver,
  loads: Load[],
): DriverAlphAlert[] {
  const results: DriverAlphAlert[] = [];
  const operational = getDriverOperationalStatus(driver, loads);
  const onActiveLoad = driverHasActiveLoad(driver.id, loads);

  if (operational === "available" && driver.status === "active") {
    results.push({
      id: `${driver.id}-available`,
      severity: "info",
      message: `${driver.name.split(" ")[0]} is available — ready for next assignment`,
      fixLabel: "Assign Load",
      fixAction: "assignLoad",
    });
  }

  if (
    typeof driver.hoursRemaining === "number" &&
    driver.hoursRemaining <= 4 &&
    onActiveLoad
  ) {
    results.push({
      id: `${driver.id}-hours`,
      severity: driver.hoursRemaining <= 2 ? "critical" : "warning",
      message: `Hours running low — ${driver.hoursRemaining.toFixed(1)} driving hours left`,
      fixLabel: "Call Driver",
      fixAction: "callDriver",
    });
  }

  results.push(...complianceAlertsToAlph(detectDriverAlerts(driver)));

  if (driver.lastInspectionAt) {
    const daysSinceInspection = Math.floor(
      (Date.now() - new Date(driver.lastInspectionAt).getTime()) /
        (24 * 60 * 60 * 1000),
    );

    if (daysSinceInspection > 365) {
      results.push({
        id: `${driver.id}-inspection`,
        severity: "warning",
        message: "Annual vehicle inspection overdue",
        fixLabel: "View Timeline",
        fixAction: "viewTimeline",
        viewTarget: "driver-timeline",
      });
    }
  } else if (driver.status === "active" && !onActiveLoad) {
    results.push({
      id: `${driver.id}-inspection-missing`,
      severity: "warning",
      message: "No recent inspection on file — verify compliance",
      fixLabel: "View Documents",
      fixAction: "viewDocuments",
      viewTarget: "driver-documents",
    });
  }

  const unassignedLoads = loads.filter(
    (load) =>
      !load.driverId &&
      (load.status === "pending" || load.status === "dispatched"),
  );

  if (operational === "available" && unassignedLoads.length > 0) {
    const suggested = unassignedLoads[0];
    results.push({
      id: `${driver.id}-suggested-load`,
      severity: "info",
      message: `Suggested next load: ${suggested.reference} — ${suggested.origin.city} to ${suggested.destination.city}`,
      fixLabel: "Assign Load",
      fixAction: "assignLoad",
    });
  }

  const severityOrder: Record<DriverAlphAlertSeverity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };

  return results
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
    .slice(0, 4);
}
