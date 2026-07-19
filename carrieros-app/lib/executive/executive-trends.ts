import {
  listExpenses,
  listRevenue,
} from "@/lib/data/finance-store";
import { getActiveTenantId } from "@/lib/data/tenant";
import {
  buildFinanceDashboardStats,
  costPerMile,
  FINANCE_TODAY,
} from "@/lib/finance/finance-board";
import type { ExecutiveBoard } from "@/lib/executive/executive-board";

export type TrendPoint = {
  label: string;
  value: number;
};

export type TrendRangeId = "today" | "7d" | "30d" | "quarter" | "year";

export type ExecutiveTrends = {
  revenue: TrendPoint[];
  profit: TrendPoint[];
  loads: TrendPoint[];
  fuel: TrendPoint[];
  maintenance: TrendPoint[];
  costPerMile: TrendPoint[];
  fleetUtilization: TrendPoint[];
  onTimeDelivery: TrendPoint[];
  driverPerformance: TrendPoint[];
  brokerPerformance: TrendPoint[];
};

export type ExecutiveTrendsByRange = Record<TrendRangeId, ExecutiveTrends>;

export const TREND_RANGE_OPTIONS: Array<{ id: TrendRangeId; label: string }> = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "quarter", label: "Quarter" },
  { id: "year", label: "Year" },
];

function scaleSeries(
  base: number,
  factors: number[],
  labels: string[],
): TrendPoint[] {
  const safe = Math.max(Math.abs(base), 1);
  return factors.map((factor, index) => ({
    label: labels[index] ?? `P${index + 1}`,
    value: Math.round(safe * factor * (base < 0 ? -1 : 1)),
  }));
}

function performanceSeries(board: ExecutiveBoard, financeMonth: number): {
  driverPerformance: TrendPoint[];
  brokerPerformance: TrendPoint[];
} {
  return {
    driverPerformance:
      board.performance.drivers.length > 0
        ? board.performance.drivers.map((d) => ({
            label: d.label.split(" ")[0] ?? d.label,
            value: d.value,
          }))
        : [
            { label: "On-time", value: board.scores.onTimePercent },
            { label: "Util.", value: board.scores.driverUtilization },
            { label: "Safety", value: board.scores.safetyScore },
          ],
    brokerPerformance:
      board.performance.brokers.length > 0
        ? board.performance.brokers.map((b) => ({
            label: b.label.length > 14 ? `${b.label.slice(0, 12)}…` : b.label,
            value: b.value,
          }))
        : [
            { label: "Top lanes", value: Math.round(financeMonth * 0.4) },
            { label: "Spot", value: Math.round(financeMonth * 0.25) },
          ],
  };
}

function buildRange(
  board: ExecutiveBoard,
  finance: ReturnType<typeof buildFinanceDashboardStats>,
  fuelMonth: number,
  maintenanceMonth: number,
  loadCount: number,
  cpm: number,
  range: TrendRangeId,
): ExecutiveTrends {
  const perf = performanceSeries(board, finance.monthRevenue);
  const fuelBase = Math.max(fuelMonth, finance.fuelExpenses, 1);
  const maintBase = Math.max(maintenanceMonth, finance.maintenanceExpenses, 1);
  const util = Math.max(board.scores.fleetUtilization, 1);
  const onTime = Math.max(board.scores.onTimePercent, 1);
  const cpmBase = Math.max(cpm, 0.5);

  const opsTrends = (factors: number[], labels: string[]) => ({
    costPerMile: scaleSeries(cpmBase, factors, labels),
    fleetUtilization: scaleSeries(util, factors, labels),
    onTimeDelivery: scaleSeries(onTime, factors, labels),
  });

  switch (range) {
    case "today":
      return {
        revenue: scaleSeries(
          finance.todayRevenue || finance.weekRevenue / 7,
          [0.12, 0.28, 0.45, 0.62, 0.78, 0.9, 1],
          ["6a", "9a", "12p", "2p", "4p", "6p", "Now"],
        ),
        profit: scaleSeries(
          finance.netProfit / 20,
          [0.35, 0.55, 0.72, 0.88, 1],
          ["AM", "Mid", "PM", "Eve", "Now"],
        ),
        loads: scaleSeries(
          loadCount,
          [0.4, 0.55, 0.7, 0.85, 0.95, 1],
          ["6a", "9a", "12p", "3p", "6p", "Now"],
        ),
        fuel: scaleSeries(fuelBase / 20, [0.4, 0.65, 0.85, 1], ["AM", "Mid", "PM", "Now"]),
        maintenance: scaleSeries(
          maintBase / 20,
          [0.5, 0.7, 0.85, 1],
          ["AM", "Mid", "PM", "Now"],
        ),
        ...opsTrends([0.92, 0.94, 0.96, 0.98, 1], ["AM", "Mid", "PM", "Eve", "Now"]),
        ...perf,
      };
    case "7d":
      return {
        revenue: scaleSeries(
          finance.weekRevenue || finance.monthRevenue * 0.25,
          [0.55, 0.7, 0.82, 0.9, 0.95, 0.88, 1],
          ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        ),
        profit: scaleSeries(
          finance.netProfit / 4,
          [0.55, 0.7, 0.82, 0.9, 0.95, 0.88, 1],
          ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        ),
        loads: scaleSeries(
          loadCount,
          [0.55, 0.7, 0.82, 0.9, 0.95, 0.88, 1],
          ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        ),
        fuel: scaleSeries(
          fuelBase / 4,
          [0.55, 0.7, 0.82, 0.9, 0.95, 0.88, 1],
          ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        ),
        maintenance: scaleSeries(
          maintBase / 4,
          [0.45, 0.6, 0.75, 0.85, 0.92, 0.8, 1],
          ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        ),
        ...opsTrends(
          [0.9, 0.92, 0.94, 0.96, 0.97, 0.95, 1],
          ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        ),
        ...perf,
      };
    case "30d":
      return {
        revenue: scaleSeries(
          finance.monthRevenue,
          [0.22, 0.42, 0.62, 0.82, 1],
          ["W1", "W2", "W3", "W4", "W5"],
        ),
        profit: scaleSeries(
          finance.netProfit,
          [0.42, 0.58, 0.76, 0.9, 1],
          ["W1", "W2", "W3", "W4", "W5"],
        ),
        loads: scaleSeries(
          loadCount * 4,
          [0.5, 0.65, 0.78, 0.9, 1],
          ["W1", "W2", "W3", "W4", "W5"],
        ),
        fuel: scaleSeries(fuelBase, [0.28, 0.48, 0.72, 0.88, 1], ["W1", "W2", "W3", "W4", "W5"]),
        maintenance: scaleSeries(
          maintBase,
          [0.35, 0.52, 0.78, 0.9, 1],
          ["W1", "W2", "W3", "W4", "W5"],
        ),
        ...opsTrends([0.88, 0.91, 0.94, 0.97, 1], ["W1", "W2", "W3", "W4", "W5"]),
        ...perf,
      };
    case "quarter":
      return {
        revenue: scaleSeries(
          finance.monthRevenue * 3,
          [0.28, 0.55, 0.78, 1],
          ["M1", "M2", "M3", "Now"],
        ),
        profit: scaleSeries(
          finance.netProfit * 3,
          [0.32, 0.58, 0.8, 1],
          ["M1", "M2", "M3", "Now"],
        ),
        loads: scaleSeries(
          loadCount * 12,
          [0.4, 0.62, 0.84, 1],
          ["M1", "M2", "M3", "Now"],
        ),
        fuel: scaleSeries(
          fuelBase * 3,
          [0.35, 0.6, 0.82, 1],
          ["M1", "M2", "M3", "Now"],
        ),
        maintenance: scaleSeries(
          maintBase * 3,
          [0.3, 0.55, 0.8, 1],
          ["M1", "M2", "M3", "Now"],
        ),
        ...opsTrends([0.9, 0.93, 0.96, 1], ["M1", "M2", "M3", "Now"]),
        ...perf,
      };
    case "year":
      return {
        revenue: scaleSeries(
          finance.monthRevenue * 12,
          [0.08, 0.16, 0.28, 0.38, 0.48, 0.58, 0.68, 0.78, 0.86, 0.92, 0.97, 1],
          ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
        ),
        profit: scaleSeries(
          finance.netProfit * 12,
          [0.1, 0.18, 0.3, 0.4, 0.5, 0.58, 0.66, 0.74, 0.82, 0.9, 0.96, 1],
          ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
        ),
        loads: scaleSeries(
          loadCount * 48,
          [0.12, 0.2, 0.32, 0.42, 0.52, 0.6, 0.68, 0.76, 0.84, 0.9, 0.96, 1],
          ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
        ),
        fuel: scaleSeries(
          fuelBase * 12,
          [0.1, 0.18, 0.28, 0.38, 0.48, 0.56, 0.64, 0.72, 0.8, 0.88, 0.94, 1],
          ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
        ),
        maintenance: scaleSeries(
          maintBase * 12,
          [0.12, 0.22, 0.32, 0.4, 0.5, 0.58, 0.66, 0.74, 0.82, 0.9, 0.96, 1],
          ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
        ),
        ...opsTrends(
          [0.86, 0.88, 0.9, 0.91, 0.92, 0.93, 0.94, 0.95, 0.96, 0.97, 0.98, 1],
          ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
        ),
        ...perf,
      };
  }
}

/**
 * Lightweight trend series derived from live board totals.
 * Shape varies by date range until historical time-series exist.
 */
export function buildExecutiveTrends(
  board: ExecutiveBoard,
  tenantId: string = getActiveTenantId(),
  today: string = FINANCE_TODAY,
): ExecutiveTrendsByRange {
  const finance = buildFinanceDashboardStats(tenantId, today);
  const expenses = listExpenses(tenantId);

  const fuelMonth = expenses
    .filter((e) => e.category === "fuel")
    .reduce((sum, e) => sum + e.amount, 0);
  const maintenanceMonth = expenses
    .filter((e) => e.category === "maintenance" || e.category === "repairs")
    .reduce((sum, e) => sum + e.amount, 0);

  const loadCount = Math.max(board.counts.loadsToday, listRevenue(tenantId).length, 4);
  const cpm = costPerMile(listRevenue(tenantId), expenses);

  return {
    today: buildRange(board, finance, fuelMonth, maintenanceMonth, loadCount, cpm, "today"),
    "7d": buildRange(board, finance, fuelMonth, maintenanceMonth, loadCount, cpm, "7d"),
    "30d": buildRange(board, finance, fuelMonth, maintenanceMonth, loadCount, cpm, "30d"),
    quarter: buildRange(
      board,
      finance,
      fuelMonth,
      maintenanceMonth,
      loadCount,
      cpm,
      "quarter",
    ),
    year: buildRange(board, finance, fuelMonth, maintenanceMonth, loadCount, cpm, "year"),
  };
}

/** Convenience accessor for the default 30-day view (legacy callers). */
export function getDefaultTrends(byRange: ExecutiveTrendsByRange): ExecutiveTrends {
  return byRange["30d"];
}
