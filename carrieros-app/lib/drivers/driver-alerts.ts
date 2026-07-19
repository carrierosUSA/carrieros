import type { Driver } from "@/lib/types";

export type DriverAlertType =
  | "cdl_expiry"
  | "medical_expiry"
  | "drug_test_due"
  | "annual_review_due";

export type DriverAlertSeverity = "warning" | "critical";

export type DriverAlert = {
  id: string;
  type: DriverAlertType;
  severity: DriverAlertSeverity;
  label: string;
  detail: string;
  dueDate?: string;
};

const EXPIRY_WARNING_DAYS = 90;
const EXPIRY_CRITICAL_DAYS = 30;

function daysUntil(dateStr: string, now = Date.now()): number {
  return Math.ceil((new Date(dateStr).getTime() - now) / (24 * 60 * 60 * 1000));
}

function expirySeverity(days: number): DriverAlertSeverity {
  if (days <= EXPIRY_CRITICAL_DAYS) {
    return "critical";
  }

  if (days <= EXPIRY_WARNING_DAYS) {
    return "warning";
  }

  return "warning";
}

function formatDueLabel(days: number): string {
  if (days < 0) {
    return `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`;
  }

  if (days === 0) {
    return "Expires today";
  }

  return `Due in ${days} day${days === 1 ? "" : "s"}`;
}

export function detectDriverAlerts(driver: Driver): DriverAlert[] {
  const alerts: DriverAlert[] = [];
  const cdlDays = daysUntil(driver.licenseExpiresAt);

  if (cdlDays <= EXPIRY_WARNING_DAYS) {
    alerts.push({
      id: `${driver.id}-cdl`,
      type: "cdl_expiry",
      severity: expirySeverity(cdlDays),
      label: "CDL Expiry",
      detail: formatDueLabel(cdlDays),
      dueDate: driver.licenseExpiresAt,
    });
  }

  const medicalDays = daysUntil(driver.medicalExpiresAt);

  if (medicalDays <= EXPIRY_WARNING_DAYS) {
    alerts.push({
      id: `${driver.id}-medical`,
      type: "medical_expiry",
      severity: expirySeverity(medicalDays),
      label: "Medical Expiry",
      detail: formatDueLabel(medicalDays),
      dueDate: driver.medicalExpiresAt,
    });
  }

  if (driver.drugTestDueAt) {
    const drugDays = daysUntil(driver.drugTestDueAt);

    if (drugDays <= EXPIRY_WARNING_DAYS) {
      alerts.push({
        id: `${driver.id}-drug`,
        type: "drug_test_due",
        severity: expirySeverity(drugDays),
        label: "Drug Test Due",
        detail: formatDueLabel(drugDays),
        dueDate: driver.drugTestDueAt,
      });
    }
  }

  if (driver.annualReviewDueAt) {
    const reviewDays = daysUntil(driver.annualReviewDueAt);

    if (reviewDays <= EXPIRY_WARNING_DAYS) {
      alerts.push({
        id: `${driver.id}-review`,
        type: "annual_review_due",
        severity: expirySeverity(reviewDays),
        label: "Annual Review Due",
        detail: formatDueLabel(reviewDays),
        dueDate: driver.annualReviewDueAt,
      });
    }
  }

  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}
