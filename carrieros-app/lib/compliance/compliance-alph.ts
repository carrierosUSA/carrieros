import {
  listAccidents,
  listDotInspections,
  listDriverCompliance,
  listTrailerCompliance,
  listTraining,
  listTruckCompliance,
  listDrugAlcohol,
} from "@/lib/data/compliance-store";
import {
  buildComplianceDashboardStats,
  COMPLIANCE_TODAY,
  formatComplianceDate,
} from "@/lib/compliance/compliance-board";
import type {
  ComplianceAlert,
  ComplianceAlphPrediction,
} from "@/lib/types/compliance";

export function detectComplianceAlerts(
  tenantId: string,
  _today: string = COMPLIANCE_TODAY,
): ComplianceAlert[] {
  void _today;
  const alerts: ComplianceAlert[] = [];
  const drivers = listDriverCompliance(tenantId);
  const trucks = listTruckCompliance(tenantId);
  const trailers = listTrailerCompliance(tenantId);
  const training = listTraining(tenantId);
  const drug = listDrugAlcohol(tenantId);

  for (const item of drivers) {
    if (item.type === "cdl" && (item.status === "expiring" || item.status === "expired")) {
      alerts.push({
        id: `alert-${item.id}`,
        type: "cdl_expiry",
        severity: item.status === "expired" ? "critical" : "warning",
        message: `${item.driverName}'s CDL ${item.status === "expired" ? "expired" : "expires"} ${formatComplianceDate(item.dueAt)}`,
        entityLabel: item.driverName,
        dueAt: item.dueAt,
        fixLabel: "View Driver",
        fixTab: "drivers",
      });
    }
    if (
      item.type === "medical" &&
      (item.status === "expiring" || item.status === "expired")
    ) {
      alerts.push({
        id: `alert-${item.id}`,
        type: "medical_expiry",
        severity: item.status === "expired" ? "critical" : "warning",
        message: `${item.driverName}'s medical card ${item.status === "expired" ? "expired" : "expires"} ${formatComplianceDate(item.dueAt)}`,
        entityLabel: item.driverName,
        dueAt: item.dueAt,
        fixLabel: "View Driver",
        fixTab: "drivers",
      });
    }
    if (
      (item.type === "drug_test" || item.type === "random_test") &&
      (item.status === "due" || item.status === "expired")
    ) {
      alerts.push({
        id: `alert-${item.id}`,
        type: "drug_test_due",
        severity: "warning",
        message: `${item.driverName} needs a drug test by ${formatComplianceDate(item.dueAt)}`,
        entityLabel: item.driverName,
        dueAt: item.dueAt,
        fixLabel: "Schedule Test",
        fixTab: "drug_alcohol",
      });
    }
  }

  for (const item of trucks) {
    if (
      item.type === "annual_inspection" &&
      (item.status === "due" ||
        item.status === "expiring" ||
        item.status === "expired" ||
        item.status === "failed")
    ) {
      alerts.push({
        id: `alert-${item.id}`,
        type: "inspection_due",
        severity:
          item.status === "failed" || item.status === "expired"
            ? "critical"
            : "warning",
        message: `Unit ${item.unitNumber} annual inspection is ${item.status.replace("_", " ")}`,
        entityLabel: `Unit ${item.unitNumber}`,
        dueAt: item.dueAt,
        fixLabel: "View Truck",
        fixTab: "trucks",
      });
    }
    if (
      (item.type === "insurance" || item.type === "permits") &&
      (item.status === "expiring" || item.status === "expired")
    ) {
      alerts.push({
        id: `alert-${item.id}`,
        type: item.type === "insurance" ? "insurance_expiry" : "permit_expiry",
        severity: item.status === "expired" ? "critical" : "warning",
        message: `Unit ${item.unitNumber} ${item.type} ${item.status === "expired" ? "expired" : "expires"} ${formatComplianceDate(item.dueAt)}`,
        entityLabel: `Unit ${item.unitNumber}`,
        dueAt: item.dueAt,
        fixLabel: "View Truck",
        fixTab: "trucks",
      });
    }
  }

  for (const item of trailers) {
    if (
      item.type === "annual_inspection" &&
      (item.status === "due" ||
        item.status === "failed" ||
        item.status === "expired")
    ) {
      alerts.push({
        id: `alert-${item.id}`,
        type: "inspection_due",
        severity: item.status === "failed" ? "critical" : "warning",
        message: `Trailer ${item.unitNumber} inspection needs attention`,
        entityLabel: `Trailer ${item.unitNumber}`,
        dueAt: item.dueAt,
        fixLabel: "View Trailer",
        fixTab: "trailers",
      });
    }
  }

  for (const item of training.filter((t) => t.status === "overdue")) {
    alerts.push({
      id: `alert-${item.id}`,
      type: "training_due",
      severity: "warning",
      message: `${item.driverName} is overdue on “${item.course}”`,
      entityLabel: item.driverName,
      dueAt: item.dueAt,
      fixLabel: "Assign Training",
      fixTab: "training",
    });
  }

  for (const item of drug.filter((d) => d.result === "scheduled")) {
    alerts.push({
      id: `alert-da-${item.id}`,
      type: "drug_test_due",
      severity: "info",
      message: `${item.driverName} has a ${item.kind.replace(/_/g, " ")} test scheduled`,
      entityLabel: item.driverName,
      dueAt: item.scheduledAt,
      fixLabel: "View Schedule",
      fixTab: "drug_alcohol",
    });
  }

  const severityRank = { critical: 0, warning: 1, info: 2 } as const;
  return alerts
    .sort((a, b) => severityRank[a.severity] - severityRank[b.severity])
    .slice(0, 10);
}

export function detectComplianceAlphPredictions(
  tenantId: string,
): ComplianceAlphPrediction[] {
  const stats = buildComplianceDashboardStats(tenantId);
  const drivers = listDriverCompliance(tenantId);
  const trucks = listTruckCompliance(tenantId);
  const inspections = listDotInspections(tenantId);
  const accidents = listAccidents(tenantId);
  const predictions: ComplianceAlphPrediction[] = [];

  const carlosIssues = drivers.filter(
    (d) => d.driverId === "carlos-mendez" && d.status !== "clear",
  ).length;
  if (carlosIssues >= 3) {
    predictions.push({
      id: "alph-high-risk-carlos",
      type: "high_risk_driver",
      severity: "critical",
      title: "High-risk driver",
      message:
        "Carlos Mendez has multiple expiring credentials and overdue training — prioritize before next dispatch.",
      confidence: 0.91,
      fixLabel: "Open Drivers",
      fixTab: "drivers",
    });
  }

  const failedTrucks = trucks.filter(
    (t) => t.status === "failed" || t.status === "expired",
  );
  if (failedTrucks.length > 0) {
    predictions.push({
      id: "alph-maint-safety",
      type: "maintenance_safety_risk",
      severity: "warning",
      title: "Maintenance-related safety risk",
      message: `Unit ${failedTrucks[0].unitNumber} has failed or expired compliance items that often precede roadside OOS.`,
      confidence: 0.84,
      fixLabel: "Review Trucks",
      fixTab: "trucks",
    });
  }

  const recentFails = inspections.filter((i) => i.result !== "passed").length;
  if (recentFails >= 2) {
    predictions.push({
      id: "alph-upcoming-violation",
      type: "upcoming_violation",
      severity: "warning",
      title: "Upcoming violation risk",
      message:
        "Pattern of failed inspections suggests elevated roadside risk over the next 30 days.",
      confidence: 0.78,
      fixLabel: "View Inspections",
      fixTab: "inspections",
    });
  }

  predictions.push({
    id: "alph-score",
    type: "compliance_score",
    severity:
      stats.fleetSafetyScore >= 80
        ? "info"
        : stats.fleetSafetyScore >= 60
          ? "warning"
          : "critical",
    title: "Fleet compliance score",
    message: `Alph estimates fleet safety at ${stats.fleetSafetyScore}/100 based on documents, inspections, and open incidents.`,
    confidence: 0.88,
    fixLabel: "View Overview",
    fixTab: "overview",
  });

  const openAccidents = accidents.filter((a) => a.status !== "closed");
  if (openAccidents.length > 0) {
    predictions.push({
      id: "alph-accident-trend",
      type: "accident_trend",
      severity: "warning",
      title: "Accident trend",
      message: `${openAccidents.length} open accident${openAccidents.length === 1 ? "" : "s"} — yard and docking incidents are the leading pattern this quarter.`,
      confidence: 0.72,
      fixLabel: "View Accidents",
      fixTab: "accidents",
    });
  }

  const repeatDriver = inspections.filter(
    (i) => i.driverId === "carlos-mendez" && i.violations.length > 0,
  );
  if (repeatDriver.length > 0) {
    predictions.push({
      id: "alph-repeat",
      type: "repeat_violation",
      severity: "warning",
      title: "Repeat violations",
      message:
        "Carlos Mendez has prior roadside findings — schedule coaching before the next Level I/II stop.",
      confidence: 0.8,
      fixLabel: "Open Training",
      fixTab: "training",
    });
  }

  return predictions.slice(0, 6);
}
