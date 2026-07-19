import {
  listAccidents,
  listClaims,
  listComplianceTimeline,
  listDotInspections,
  listDriverCompliance,
  listTrailerCompliance,
  listTruckCompliance,
} from "@/lib/data/compliance-store";
import type {
  ComplianceDashboardStats,
  ComplianceItemStatus,
  SafetyScoreTone,
} from "@/lib/types/compliance";

/** Reference "today" aligned with demo seed data */
export const COMPLIANCE_TODAY = "2026-07-17";

const ATTENTION_STATUSES: ComplianceItemStatus[] = [
  "expiring",
  "expired",
  "due",
  "failed",
  "pending",
];

export function isAttentionStatus(status: ComplianceItemStatus): boolean {
  return ATTENTION_STATUSES.includes(status);
}

export function safetyScoreTone(score: number): SafetyScoreTone {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "critical";
}

export function formatComplianceDate(iso?: string): string {
  if (!iso) return "—";
  const date = iso.slice(0, 10);
  const d = new Date(`${date}T12:00:00Z`);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatComplianceMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function computeFleetSafetyScore(tenantId: string): number {
  const drivers = listDriverCompliance(tenantId);
  const trucks = listTruckCompliance(tenantId);
  const trailers = listTrailerCompliance(tenantId);
  const inspections = listDotInspections(tenantId);
  const accidents = listAccidents(tenantId);

  let score = 100;

  const allItems = [...drivers, ...trucks, ...trailers];
  for (const item of allItems) {
    if (item.status === "expired" || item.status === "failed") score -= 4;
    else if (item.status === "due") score -= 2;
    else if (item.status === "expiring" || item.status === "pending") score -= 1;
  }

  for (const insp of inspections) {
    if (insp.result === "oos") score -= 6;
    else if (insp.result === "failed") score -= 3;
  }

  const openAccidents = accidents.filter((a) => a.status !== "closed").length;
  score -= openAccidents * 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function buildComplianceDashboardStats(
  tenantId: string,
): ComplianceDashboardStats {
  const drivers = listDriverCompliance(tenantId);
  const trucks = listTruckCompliance(tenantId);
  const trailers = listTrailerCompliance(tenantId);
  const inspections = listDotInspections(tenantId);
  const accidents = listAccidents(tenantId);
  const claims = listClaims(tenantId);

  const expiringDocuments = [...drivers, ...trucks, ...trailers].filter(
    (item) =>
      item.status === "expiring" ||
      item.status === "expired" ||
      item.status === "due",
  ).length;

  const failedInspections = inspections.filter(
    (i) => i.result === "failed" || i.result === "oos",
  ).length;

  const activeViolations = inspections.reduce(
    (sum, i) => sum + (i.result !== "passed" ? i.violations.length : 0),
    0,
  );

  const openAccidents = accidents.filter((a) => a.status !== "closed").length;
  const openClaims = claims.filter(
    (c) => c.status !== "settled" && c.status !== "denied",
  ).length;

  const attentionCount = [...drivers, ...trucks, ...trailers].filter((item) =>
    isAttentionStatus(item.status),
  ).length;

  return {
    fleetSafetyScore: computeFleetSafetyScore(tenantId),
    activeViolations,
    dotAlerts: attentionCount + failedInspections,
    expiringDocuments,
    failedInspections,
    openAccidents,
    openClaims,
  };
}

export function getRecentComplianceEvents(tenantId: string, limit = 8) {
  return listComplianceTimeline(tenantId).slice(0, limit);
}
