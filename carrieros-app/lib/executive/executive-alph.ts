import { getMaintenanceSnapshot } from "@/lib/data/maintenance-store";
import { getActiveTenantId } from "@/lib/data/tenant";
import {
  detectComplianceAlerts,
  detectComplianceAlphPredictions,
} from "@/lib/compliance/compliance-alph";
import { buildComplianceDashboardStats } from "@/lib/compliance/compliance-board";
import { detectFinanceAlphAlerts } from "@/lib/finance/finance-alph-alerts";
import {
  buildFinanceDashboardStats,
  formatFinanceMoney,
  FINANCE_TODAY,
} from "@/lib/finance/finance-board";
import { detectMaintenanceAlphAlerts } from "@/lib/fleet/maintenance-alph";
import { computeFleetHealthScore } from "@/lib/fleet/maintenance-board";
import { getDriverService } from "@/lib/services/drivers";
import { getFleetService } from "@/lib/services/fleet";
import { getLoadService } from "@/lib/services/loads";
import type { ExecutiveBoard } from "@/lib/executive/executive-board";

export type AlphSummaryItem = {
  id: string;
  text: string;
  href?: string;
  severity?: "info" | "warning" | "critical" | "success";
};

export type AlphExecutiveSummary = {
  greeting: string;
  subtitle: string;
  topPriorities: AlphSummaryItem[];
  risks: AlphSummaryItem[];
  opportunities: AlphSummaryItem[];
  financialHealth: AlphSummaryItem[];
  fleetHealth: AlphSummaryItem[];
};

/**
 * Morning briefing for owners — combines Alph signals from finance,
 * compliance, maintenance, dispatch capacity, and board KPIs.
 */
export async function buildAlphExecutiveSummary(
  board: ExecutiveBoard,
  tenantId: string = getActiveTenantId(),
  today: string = FINANCE_TODAY,
): Promise<AlphExecutiveSummary> {
  const loadService = getLoadService();
  const driverService = getDriverService();
  const fleetService = getFleetService();

  const [loads, driverMetrics, fleetMetrics, trucks, trailers] =
    await Promise.all([
      loadService.listLoads(tenantId),
      driverService.getDriverMetrics(tenantId),
      fleetService.getFleetMetrics(tenantId),
      fleetService.listTrucks(tenantId),
      fleetService.listTrailers(tenantId),
    ]);

  const financeAlerts = detectFinanceAlphAlerts(tenantId, today);
  const complianceAlerts = detectComplianceAlerts(tenantId, today);
  const compliancePredictions = detectComplianceAlphPredictions(tenantId);
  const finance = buildFinanceDashboardStats(tenantId, today);
  const compliance = buildComplianceDashboardStats(tenantId);

  const snapshot = getMaintenanceSnapshot();
  const maintenanceAlerts = detectMaintenanceAlphAlerts({
    trucks,
    trailers,
    pmSchedules: snapshot.pmSchedules,
    workOrders: snapshot.workOrders,
    repairs: snapshot.repairs,
    parts: snapshot.parts,
    tires: snapshot.tires,
  });
  const fleetHealthScore = computeFleetHealthScore(trucks, trailers, {
    pmSchedules: snapshot.pmSchedules,
    workOrders: snapshot.workOrders,
    repairs: snapshot.repairs,
    parts: snapshot.parts,
  });

  const pendingAssignment = loads.find((l) => !l.driverId || !l.truckId);
  const deliveredNotInvoiced = loads.find(
    (l) => l.status === "delivered" && !l.invoiceId,
  );
  const attentionLoads = loads.filter(
    (l) => l.complianceStatus === "attention",
  );

  const topPriorities: AlphSummaryItem[] = [];

  if (pendingAssignment) {
    topPriorities.push({
      id: "assign-load",
      text: `Assign crew on ${pendingAssignment.reference} before the window slips`,
      href: `/loads/${pendingAssignment.id}`,
      severity: "warning",
    });
  }
  if (deliveredNotInvoiced) {
    topPriorities.push({
      id: "invoice-load",
      text: `Invoice ${deliveredNotInvoiced.reference} — delivery is complete`,
      href: `/loads/${deliveredNotInvoiced.id}`,
      severity: "warning",
    });
  }
  for (const alert of financeAlerts.slice(0, 2)) {
    topPriorities.push({
      id: alert.id,
      text: alert.message,
      href: "/finance",
      severity: alert.severity === "critical" ? "critical" : "warning",
    });
  }
  for (const alert of complianceAlerts.slice(0, 2)) {
    if (topPriorities.length >= 4) break;
    topPriorities.push({
      id: alert.id,
      text: alert.message,
      href: "/compliance",
      severity: alert.severity === "critical" ? "critical" : "warning",
    });
  }
  if (topPriorities.length === 0) {
    topPriorities.push({
      id: "all-clear",
      text: "No urgent actions — operations are running clean this morning",
      href: "/loads",
      severity: "success",
    });
  }

  const risks: AlphSummaryItem[] = [];
  for (const alert of maintenanceAlerts.slice(0, 3)) {
    risks.push({
      id: alert.id,
      text: alert.message,
      href: "/fleet/maintenance",
      severity: alert.severity,
    });
  }
  for (const pred of compliancePredictions.slice(0, 2)) {
    if (risks.length >= 4) break;
    risks.push({
      id: pred.id,
      text: pred.message,
      href: "/compliance",
      severity: pred.severity === "critical" ? "critical" : "warning",
    });
  }
  if (attentionLoads.length > 0) {
    risks.push({
      id: "attention-loads",
      text: `${attentionLoads.length} load${attentionLoads.length === 1 ? "" : "s"} need dispatcher attention`,
      href: "/loads",
      severity: "warning",
    });
  }
  if (risks.length === 0) {
    risks.push({
      id: "risk-clear",
      text: "No elevated fleet or safety risks flagged",
      severity: "success",
    });
  }

  const opportunities: AlphSummaryItem[] = [];
  if (board.counts.trucksAvailable > 0 && board.counts.driversAvailable > 0) {
    opportunities.push({
      id: "capacity",
      text: `${board.counts.trucksAvailable} truck${board.counts.trucksAvailable === 1 ? "" : "s"} and ${board.counts.driversAvailable} driver${board.counts.driversAvailable === 1 ? "" : "s"} ready for new freight`,
      href: "/marketplace",
      severity: "info",
    });
  }
  if (board.scores.onTimePercent >= 90) {
    opportunities.push({
      id: "on-time-pitch",
      text: `${board.scores.onTimePercent}% on-time — lean on this with brokers for better lanes`,
      href: "/brokers",
      severity: "success",
    });
  }
  if (finance.monthRevenue > 0 && finance.netProfit / finance.monthRevenue > 0.2) {
    opportunities.push({
      id: "margin",
      text: "Strong margin this month — consider expanding high-RPM lanes",
      href: "/analytics",
      severity: "success",
    });
  }
  if (opportunities.length === 0) {
    opportunities.push({
      id: "fill-capacity",
      text: "Review Marketplace for empty miles and backhaul opportunities",
      href: "/marketplace",
      severity: "info",
    });
  }

  const financialHealth: AlphSummaryItem[] = [
    {
      id: "rev-mtd",
      text: `Month revenue ${formatFinanceMoney(finance.monthRevenue)} · profit ${formatFinanceMoney(finance.netProfit)}`,
      href: "/finance",
      severity: finance.netProfit >= 0 ? "success" : "critical",
    },
    {
      id: "cash",
      text: `Cash flow ${formatFinanceMoney(finance.cashFlow)} with ${formatFinanceMoney(finance.outstandingBrokerPayments)} outstanding from brokers`,
      href: "/finance",
      severity: finance.outstandingBrokerPayments > 5000 ? "warning" : "info",
    },
  ];
  if (board.counts.openInvoices > 0) {
    financialHealth.push({
      id: "invoices",
      text: `${board.counts.openInvoices} open invoice${board.counts.openInvoices === 1 ? "" : "s"} still collecting`,
      href: "/finance?tab=invoices",
      severity: "warning",
    });
  }

  const fleetHealth: AlphSummaryItem[] = [
    {
      id: "fleet-score",
      text: `Fleet health ${fleetHealthScore.score}/100 — ${fleetHealthScore.summary}`,
      href: "/fleet/maintenance",
      severity:
        fleetHealthScore.score >= 80
          ? "success"
          : fleetHealthScore.score >= 60
            ? "warning"
            : "critical",
    },
    {
      id: "safety-score",
      text: `Safety score ${compliance.fleetSafetyScore}/100 · ${compliance.expiringDocuments} documents need review`,
      href: "/compliance",
      severity:
        compliance.fleetSafetyScore >= 80
          ? "success"
          : compliance.fleetSafetyScore >= 60
            ? "warning"
            : "critical",
    },
    {
      id: "capacity-now",
      text: `${fleetMetrics.availableTrucks} trucks available · ${driverMetrics.activeDrivers} drivers on duty`,
      href: "/fleet",
      severity: "info",
    },
  ];

  return {
    greeting: "Alph morning briefing",
    subtitle: `${board.companyName} · ${board.generatedAtLabel}`,
    topPriorities: topPriorities.slice(0, 4),
    risks: risks.slice(0, 4),
    opportunities: opportunities.slice(0, 3),
    financialHealth: financialHealth.slice(0, 3),
    fleetHealth: fleetHealth.slice(0, 3),
  };
}
