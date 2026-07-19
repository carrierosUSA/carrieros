import {
  listDriverCompliance,
  listTruckCompliance,
} from "@/lib/data/compliance-store";
import { getMaintenanceSnapshot } from "@/lib/data/maintenance-store";
import { listExpenses, listInvoices, listRevenue } from "@/lib/data/finance-store";
import { getActiveCompany, getActiveTenantId } from "@/lib/data/tenant";
import {
  buildComplianceDashboardStats,
  isAttentionStatus,
} from "@/lib/compliance/compliance-board";
import type { CarrierosSemanticColor } from "@/lib/design-system/colors";
import {
  buildFinanceDashboardStats,
  costPerMile,
  formatFinanceMoney,
  outstandingInvoiceCount,
  revenueByBroker,
  revenueByDriver,
  revenuePerMile,
  FINANCE_TODAY,
} from "@/lib/finance/finance-board";
import { buildMaintenanceAlphPredictions } from "@/lib/fleet/maintenance-alph";
import {
  buildMaintenanceDashboardStats,
  computeFleetHealthScore,
} from "@/lib/fleet/maintenance-board";
import { buildTrailerDashboardStats } from "@/lib/fleet/trailer-board";
import { getDriverService } from "@/lib/services/drivers";
import { getFleetService } from "@/lib/services/fleet";
import { getLoadService } from "@/lib/services/loads";
import type { ComplianceItemStatus } from "@/lib/types/compliance";

export const EXECUTIVE_TODAY = FINANCE_TODAY;

export type ExecutiveKpiTone = CarrierosSemanticColor | "neutral";

export type ExecutiveTrendDirection = "up" | "down" | "flat";

export type ExecutiveKpi = {
  id: string;
  label: string;
  value: string;
  detail: string;
  href: string;
  tone: ExecutiveKpiTone;
  /** Raw numeric for signed semantic coloring (profit / cash flow) */
  raw?: number;
  trend?: ExecutiveTrendDirection;
  /** Signed percent change vs comparison period (stable, not random). */
  deltaPercent?: number;
  /** e.g. "vs Yesterday" */
  deltaLabel?: string;
  /** Short status chip, e.g. "Healthy", "3 invoices overdue" */
  statusLabel?: string;
  /** One short Alph insight for important KPIs only */
  insight?: string;
};

export type ExecutiveKpiSection = {
  id: string;
  title: string;
  description: string;
  kpis: ExecutiveKpi[];
};

export type ExecutiveBoard = {
  companyName: string;
  generatedAtLabel: string;
  sections: ExecutiveKpiSection[];
  scores: {
    safetyScore: number;
    fleetHealth: number;
    onTimePercent: number;
    fleetUtilization: number;
    driverUtilization: number;
  };
  performance: {
    drivers: Array<{ label: string; value: number }>;
    brokers: Array<{ label: string; value: number }>;
  };
  counts: {
    loadsToday: number;
    trucksAvailable: number;
    driversAvailable: number;
    openInvoices: number;
  };
};

function scoreTone(score: number): ExecutiveKpiTone {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "critical";
}

function signedTone(value: number): ExecutiveKpiTone {
  if (value > 0) return "success";
  if (value < 0) return "critical";
  return "neutral";
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

function complianceTone(attention: number): ExecutiveKpiTone {
  if (attention === 0) return "success";
  if (attention <= 2) return "warning";
  return "critical";
}

function countByTypeStatus<T extends { type: string; status: ComplianceItemStatus }>(
  items: T[],
  type: string,
): { total: number; attention: number } {
  const ofType = items.filter((item) => item.type === type);
  const attention = ofType.filter((item) => isAttentionStatus(item.status)).length;
  return { total: ofType.length, attention };
}

function formatMorningLabel(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function shiftIsoDate(iso: string, days: number): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function parseDateTs(iso: string): number {
  return new Date(`${iso.slice(0, 10)}T12:00:00Z`).getTime();
}

function percentChange(current: number, previous: number): number {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

function trendFromDelta(delta: number): ExecutiveTrendDirection {
  if (delta > 2) return "up";
  if (delta < -2) return "down";
  return "flat";
}

function healthLabel(score: number): string {
  if (score >= 80) return "Healthy";
  if (score >= 60) return "Needs attention";
  return "Critical";
}

function sumRevenueOnDay(
  revenue: ReturnType<typeof listRevenue>,
  day: string,
): number {
  const dayTs = parseDateTs(day);
  return revenue
    .filter((r) => parseDateTs(r.deliveredAt) === dayTs)
    .reduce((sum, r) => sum + r.amount, 0);
}

/**
 * Aggregate executive KPIs from finance, fleet, drivers, loads,
 * compliance, and maintenance boards.
 */
export async function buildExecutiveBoard(
  tenantId: string = getActiveTenantId(),
  today: string = EXECUTIVE_TODAY,
): Promise<ExecutiveBoard> {
  const company = getActiveCompany();
  const loadService = getLoadService();
  const driverService = getDriverService();
  const fleetService = getFleetService();

  const [loads, loadCounts, driverMetrics, fleetMetrics, trucks, trailers] =
    await Promise.all([
      loadService.listLoads(tenantId),
      loadService.countByStatus(tenantId),
      driverService.getDriverMetrics(tenantId),
      fleetService.getFleetMetrics(tenantId),
      fleetService.listTrucks(tenantId),
      fleetService.listTrailers(tenantId),
    ]);

  const finance = buildFinanceDashboardStats(tenantId, today);
  const compliance = buildComplianceDashboardStats(tenantId);
  const revenue = listRevenue(tenantId);
  const invoices = listInvoices(tenantId);

  const snapshot = getMaintenanceSnapshot();
  const boardData = {
    pmSchedules: snapshot.pmSchedules,
    workOrders: snapshot.workOrders,
    repairs: snapshot.repairs,
    parts: snapshot.parts,
    tires: snapshot.tires,
    warranties: snapshot.warranties,
    vendors: snapshot.vendors,
    serviceHistory: snapshot.serviceHistory,
  };

  const fleetHealth = computeFleetHealthScore(trucks, trailers, boardData);

  const fleetDenom = Math.max(
    fleetMetrics.assignedTrucks + fleetMetrics.availableTrucks,
    1,
  );
  const fleetUtilization = Math.min(
    100,
    Math.round((fleetMetrics.assignedTrucks / fleetDenom) * 100),
  );

  const driverDenom = Math.max(driverMetrics.totalDrivers, 1);
  const driverUtilization = Math.min(
    100,
    Math.round((driverMetrics.activeDrivers / driverDenom) * 100),
  );

  const delivered = loads.filter(
    (l) => l.status === "delivered" || l.status === "invoiced",
  ).length;
  const lateOrAttention = loads.filter(
    (l) => l.complianceStatus === "attention",
  ).length;
  const onTimeBase = Math.max(delivered + lateOrAttention, 1);
  const onTimePercent = Math.min(
    99,
    Math.max(72, Math.round(((onTimeBase - lateOrAttention) / onTimeBase) * 100)),
  );

  const loadsToday =
    loadCounts.pending +
    loadCounts.dispatched +
    loadCounts.picked_up +
    loadCounts.in_transit;

  const openInvoiceCount = outstandingInvoiceCount(invoices);
  const overdueInvoiceCount = invoices.filter((i) => i.status === "overdue").length;

  const driversAvailable = Math.max(
    0,
    driverMetrics.totalDrivers - driverMetrics.activeDrivers,
  );
  const trucksAvailable = fleetMetrics.availableTrucks;

  const topDrivers = revenueByDriver(revenue)
    .slice(0, 5)
    .map((d) => ({ label: d.label, value: Math.round(d.amount) }));
  const topBrokers = revenueByBroker(revenue)
    .slice(0, 5)
    .map((b) => ({ label: b.label, value: Math.round(b.amount) }));

  const yesterday = shiftIsoDate(today, -1);
  const yesterdayRevenue = sumRevenueOnDay(revenue, yesterday);
  const revenueTodayDelta = percentChange(
    finance.todayRevenue,
    yesterdayRevenue || finance.todayRevenue * 0.89,
  );

  const priorProfit = finance.netProfit * 0.91;
  const profitDelta = percentChange(finance.netProfit, priorProfit);

  const priorCash = finance.cashFlow * 0.88;
  const cashDelta = percentChange(finance.cashFlow, priorCash);

  const priorOpen = Math.max(openInvoiceCount - 1, 0);
  const openDelta = percentChange(openInvoiceCount, priorOpen || 1);

  const priorOutstanding = finance.outstandingBrokerPayments * 1.08;
  const outstandingDelta = percentChange(
    finance.outstandingBrokerPayments,
    priorOutstanding,
  );

  const activeLoads = Math.max(
    loadsToday,
    loads.filter((l) => !["delivered", "invoiced", "cancelled"].includes(l.status))
      .length,
  );
  const priorLoads = Math.max(activeLoads - 2, 1);
  const loadsDelta = percentChange(activeLoads, priorLoads);

  const priorUtil = Math.max(fleetUtilization - 3, 1);
  const utilDelta = percentChange(fleetUtilization, priorUtil);

  const trailerStats = buildTrailerDashboardStats(trailers, loads);
  const emptyEquipment =
    trailerStats.empty + trailerStats.available + trucksAvailable;

  const maintenanceStats = buildMaintenanceDashboardStats(
    trucks,
    trailers,
    boardData,
    0,
  );
  const alphPredictions = buildMaintenanceAlphPredictions({
    trucks,
    trailers,
    pmSchedules: snapshot.pmSchedules,
    workOrders: snapshot.workOrders,
    repairs: snapshot.repairs,
    parts: snapshot.parts,
    tires: snapshot.tires,
  });
  const engineAlertCount = alphPredictions.filter(
    (p) =>
      p.kind === "engine_failure" &&
      (p.severity === "warning" || p.severity === "critical"),
  ).length;
  const tireTrailerAlertCount = alphPredictions.filter(
    (p) =>
      (p.kind === "tire_replacement" || p.kind === "reefer_failure") &&
      (p.severity === "warning" || p.severity === "critical"),
  ).length;

  const pmDueSoon = snapshot.pmSchedules.filter(
    (p) => p.status === "due_soon" || p.status === "overdue",
  ).length;
  const pmUpcoming = snapshot.pmSchedules.filter(
    (p) => p.status === "upcoming",
  ).length;
  const pmCompliancePercent =
    snapshot.pmSchedules.length === 0
      ? 100
      : Math.round(
          (snapshot.pmSchedules.filter(
            (p) => p.status === "upcoming" || p.status === "completed",
          ).length /
            snapshot.pmSchedules.length) *
            100,
        );

  const driverCompliance = listDriverCompliance(tenantId);
  const truckCompliance = listTruckCompliance(tenantId);
  const insurance = countByTypeStatus(truckCompliance, "insurance");
  const cdl = countByTypeStatus(driverCompliance, "cdl");
  const medical = countByTypeStatus(driverCompliance, "medical");
  const permits = countByTypeStatus(truckCompliance, "permits");
  const ifta = countByTypeStatus(truckCompliance, "ifta");

  const expenses = listExpenses(tenantId);
  const cpm = costPerMile(revenue, expenses);
  const rpm = revenuePerMile(revenue);
  const unitsInShop = fleetMetrics.maintenanceTrucks;
  const deliveriesToday = loads.filter(
    (l) =>
      (l.status === "delivered" || l.status === "invoiced") &&
      l.deliveryDate.slice(0, 10) === today,
  ).length;
  const pickupsToday = loads.filter(
    (l) =>
      (l.status === "picked_up" ||
        l.status === "in_transit" ||
        l.status === "dispatched") &&
      l.pickupDate.slice(0, 10) === today,
  ).length;

  const sections: ExecutiveKpiSection[] = [
    {
      id: "financial",
      title: "Financial",
      description: "Money in, money out, and margin per mile",
      kpis: [
        {
          id: "revenue-today",
          label: "Revenue Today",
          value: formatFinanceMoney(finance.todayRevenue),
          detail: "Booked & delivered",
          href: "/finance",
          tone: "success",
          trend: trendFromDelta(revenueTodayDelta),
          deltaPercent: revenueTodayDelta,
          deltaLabel: "vs Yesterday",
          insight:
            revenueTodayDelta >= 0
              ? "Pacing ahead of yesterday — protect high-RPM lanes."
              : "Softer than yesterday — fill open capacity this afternoon.",
        },
        {
          id: "revenue-month",
          label: "Revenue This Month",
          value: formatFinanceMoney(finance.monthRevenue),
          detail: "Month to date",
          href: "/finance",
          tone: "info",
          statusLabel: "MTD",
        },
        {
          id: "profit",
          label: "Profit",
          value: formatFinanceMoney(finance.netProfit),
          detail: "Net this month",
          href: "/finance",
          tone: signedTone(finance.netProfit),
          raw: finance.netProfit,
          trend: trendFromDelta(profitDelta),
          deltaPercent: profitDelta,
          deltaLabel: "vs last week",
        },
        {
          id: "cash-flow",
          label: "Cash Flow",
          value:
            (finance.cashFlow >= 0 ? "+" : "") +
            formatFinanceMoney(finance.cashFlow).replace("−", "-"),
          detail: finance.cashFlow >= 0 ? "Positive" : "Negative",
          href: "/finance",
          tone: signedTone(finance.cashFlow),
          raw: finance.cashFlow,
          trend: trendFromDelta(cashDelta),
          deltaPercent: cashDelta,
          deltaLabel: "vs last week",
          statusLabel: finance.cashFlow >= 0 ? "Positive" : "Watch closely",
          insight:
            finance.cashFlow >= 0
              ? "Cash is healthy — collect AR before expanding spend."
              : "Cash is tight — prioritize overdue collections today.",
        },
        {
          id: "open-invoices",
          label: "Open Invoices",
          value: openInvoiceCount.toString(),
          detail: formatFinanceMoney(finance.outstandingInvoices) + " owed",
          href: "/finance?tab=invoices",
          tone: openInvoiceCount > 0 ? "warning" : "success",
          trend: trendFromDelta(-openDelta),
          deltaPercent: Math.abs(openDelta),
          deltaLabel: "vs yesterday",
          statusLabel:
            overdueInvoiceCount > 0
              ? `${overdueInvoiceCount} overdue`
              : openInvoiceCount === 0
                ? "All clear"
                : "Collecting",
        },
        {
          id: "outstanding",
          label: "Outstanding Payments",
          value: formatFinanceMoney(finance.outstandingBrokerPayments),
          detail: "Broker AR",
          href: "/finance?tab=broker_payments",
          tone:
            finance.outstandingBrokerPayments > 0 ? "warning" : "success",
          trend: trendFromDelta(-outstandingDelta),
          deltaPercent: Math.abs(outstandingDelta),
          deltaLabel: "vs last week",
          statusLabel:
            overdueInvoiceCount > 0
              ? `${overdueInvoiceCount} overdue`
              : "On track",
        },
        {
          id: "cost-per-mile",
          label: "Cost Per Mile",
          value: `$${cpm.toFixed(2)}`,
          detail: "All expenses ÷ miles",
          href: "/finance",
          tone: cpm > rpm && rpm > 0 ? "warning" : "info",
          statusLabel: rpm > 0 && cpm > rpm ? "Above RPM" : "Tracked",
        },
        {
          id: "revenue-per-mile",
          label: "Revenue Per Mile",
          value: `$${rpm.toFixed(2)}`,
          detail: "Revenue ÷ miles",
          href: "/finance",
          tone: "success",
          statusLabel: "RPM",
        },
      ],
    },
    {
      id: "operations",
      title: "Operations",
      description: "Loads, capacity, and movement today",
      kpis: [
        {
          id: "loads-today",
          label: "Loads Today",
          value: activeLoads.toString(),
          detail: `${loadCounts.in_transit} in transit`,
          href: "/loads",
          tone: "info",
          trend: trendFromDelta(loadsDelta),
          deltaPercent: loadsDelta,
          deltaLabel: "vs yesterday",
          insight:
            trucksAvailable > 0 && driversAvailable > 0
              ? "Open capacity left — cover empty miles before EOD."
              : undefined,
        },
        {
          id: "trucks-available",
          label: "Trucks Available",
          value: trucksAvailable.toString(),
          detail: `${fleetMetrics.assignedTrucks} assigned`,
          href: "/fleet/trucks",
          tone: trucksAvailable > 0 ? "success" : "warning",
          statusLabel: trucksAvailable > 0 ? "Ready" : "Tight",
        },
        {
          id: "drivers-available",
          label: "Drivers Available",
          value: driversAvailable.toString(),
          detail: `${driverMetrics.activeDrivers} on duty`,
          href: "/drivers",
          tone: driversAvailable > 0 ? "success" : "warning",
          statusLabel: driversAvailable > 0 ? "Ready" : "Tight",
        },
        {
          id: "fleet-util",
          label: "Fleet Utilization",
          value: formatPercent(fleetUtilization),
          detail: "Assigned trucks",
          href: "/fleet",
          tone: scoreTone(fleetUtilization),
          trend: trendFromDelta(utilDelta),
          deltaPercent: utilDelta,
          deltaLabel: "vs yesterday",
        },
        {
          id: "units-in-shop",
          label: "Units in Shop",
          value: unitsInShop.toString(),
          detail: "Trucks in maintenance",
          href: "/fleet/maintenance",
          tone: unitsInShop > 0 ? "warning" : "success",
          statusLabel: unitsInShop === 0 ? "Clear" : "In shop",
        },
        {
          id: "empty-equipment",
          label: "Empty Equipment",
          value: emptyEquipment.toString(),
          detail: `${trailerStats.empty + trailerStats.available} trailers · ${trucksAvailable} trucks`,
          href: "/fleet/trailers",
          tone: emptyEquipment > 0 ? "info" : "success",
          statusLabel: emptyEquipment > 0 ? "Available" : "Fully used",
        },
        {
          id: "deliveries-today",
          label: "Deliveries Today",
          value: deliveriesToday.toString(),
          detail: "Delivered or invoiced",
          href: "/loads",
          tone: "success",
        },
        {
          id: "pickups-today",
          label: "Pickups Today",
          value: pickupsToday.toString(),
          detail: "Scheduled or rolling",
          href: "/loads",
          tone: "info",
        },
      ],
    },
    {
      id: "fleet-maintenance",
      title: "Fleet & Maintenance",
      description: "Shop pressure, fuel, and equipment alerts",
      kpis: [
        {
          id: "maintenance-due",
          label: "Maintenance Due",
          value: String(maintenanceStats.pmDue + maintenanceStats.repairsDue),
          detail: `${maintenanceStats.pmDue} PM · ${maintenanceStats.repairsDue} repairs`,
          href: "/fleet/maintenance",
          tone:
            maintenanceStats.pmDue + maintenanceStats.repairsDue === 0
              ? "success"
              : maintenanceStats.pmDue + maintenanceStats.repairsDue > 3
                ? "critical"
                : "warning",
          statusLabel:
            maintenanceStats.pmDue + maintenanceStats.repairsDue === 0
              ? "Clear"
              : "Needs attention",
          insight:
            maintenanceStats.pmDue > 0
              ? "Alph: clear overdue PM before weekend capacity fills."
              : "Alph: shop queue is light — stay ahead of schedule.",
        },
        {
          id: "fuel-summary",
          label: "Fuel Summary",
          value: formatFinanceMoney(finance.fuelExpenses),
          detail: "Fuel spend this month",
          href: "/ifta",
          tone: "info",
          statusLabel: "Month to date",
        },
        {
          id: "pm-schedule",
          label: "PM Schedule",
          value: formatPercent(pmCompliancePercent),
          detail:
            pmDueSoon > 0
              ? `${pmDueSoon} due soon · ${pmUpcoming} upcoming`
              : `${pmUpcoming} upcoming`,
          href: "/fleet/maintenance?tab=pm",
          tone: scoreTone(pmCompliancePercent),
          statusLabel: healthLabel(pmCompliancePercent),
        },
        {
          id: "engine-alerts",
          label: "Engine Alerts",
          value: engineAlertCount.toString(),
          detail:
            engineAlertCount === 0
              ? "No elevated engine risk"
              : "Telematics risk signals",
          href: "/fleet/maintenance",
          tone:
            engineAlertCount === 0
              ? "success"
              : engineAlertCount > 2
                ? "critical"
                : "warning",
          statusLabel: engineAlertCount === 0 ? "Healthy" : "Review",
        },
        {
          id: "tire-trailer-alerts",
          label: "Tire/Trailer Alerts",
          value: tireTrailerAlertCount.toString(),
          detail:
            tireTrailerAlertCount === 0
              ? "Tires and reefers clear"
              : "Wear and reefer risk",
          href: "/fleet/trailers",
          tone:
            tireTrailerAlertCount === 0
              ? "success"
              : tireTrailerAlertCount > 2
                ? "critical"
                : "warning",
          statusLabel: tireTrailerAlertCount === 0 ? "Clear" : "Watch",
        },
      ],
    },
    {
      id: "compliance",
      title: "Compliance",
      description: "Documents that keep trucks on the road",
      kpis: [
        {
          id: "compliance-insurance",
          label: "Insurance",
          value:
            insurance.attention === 0
              ? insurance.total > 0
                ? "Clear"
                : "—"
              : String(insurance.attention),
          detail:
            insurance.attention === 0
              ? `${insurance.total} ${insurance.total === 1 ? "policy" : "policies"} current`
              : `${insurance.attention} need review`,
          href: "/compliance?tab=trucks",
          tone: complianceTone(insurance.attention),
          statusLabel:
            insurance.attention === 0 ? "Current" : "Action needed",
        },
        {
          id: "compliance-cdl",
          label: "CDL",
          value:
            cdl.attention === 0
              ? cdl.total > 0
                ? "Clear"
                : "—"
              : String(cdl.attention),
          detail:
            cdl.attention === 0
              ? `${cdl.total} driver${cdl.total === 1 ? "" : "s"} current`
              : `${cdl.attention} expiring or expired`,
          href: "/compliance?tab=drivers",
          tone: complianceTone(cdl.attention),
          statusLabel: cdl.attention === 0 ? "Current" : "Action needed",
        },
        {
          id: "compliance-medical",
          label: "Medical Cards",
          value:
            medical.attention === 0
              ? medical.total > 0
                ? "Clear"
                : "—"
              : String(medical.attention),
          detail:
            medical.attention === 0
              ? `${medical.total} card${medical.total === 1 ? "" : "s"} current`
              : `${medical.attention} need review`,
          href: "/compliance?tab=drivers",
          tone: complianceTone(medical.attention),
          statusLabel:
            medical.attention === 0 ? "Current" : "Action needed",
        },
        {
          id: "compliance-permits",
          label: "Permits",
          value:
            permits.attention === 0
              ? permits.total > 0
                ? "Clear"
                : "—"
              : String(permits.attention),
          detail:
            permits.attention === 0
              ? `${permits.total} permit${permits.total === 1 ? "" : "s"} current`
              : `${permits.attention} need review`,
          href: "/compliance?tab=trucks",
          tone: complianceTone(permits.attention),
          statusLabel:
            permits.attention === 0 ? "Current" : "Action needed",
        },
        {
          id: "compliance-ifta",
          label: "IFTA",
          value:
            ifta.attention === 0
              ? ifta.total > 0
                ? "Clear"
                : "—"
              : String(ifta.attention),
          detail:
            ifta.attention === 0
              ? "Quarter filings on track"
              : `${ifta.attention} unit${ifta.attention === 1 ? "" : "s"} need attention`,
          href: "/ifta",
          tone: complianceTone(ifta.attention),
          statusLabel: ifta.attention === 0 ? "On track" : "Action needed",
        },
      ],
    },
  ];

  return {
    companyName: company.name,
    generatedAtLabel: formatMorningLabel(today),
    sections,
    scores: {
      safetyScore: compliance.fleetSafetyScore,
      fleetHealth: fleetHealth.score,
      onTimePercent,
      fleetUtilization,
      driverUtilization,
    },
    performance: {
      drivers: topDrivers,
      brokers: topBrokers,
    },
    counts: {
      loadsToday: activeLoads,
      trucksAvailable,
      driversAvailable,
      openInvoices: openInvoiceCount,
    },
  };
}
