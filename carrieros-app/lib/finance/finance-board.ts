import type {
  ExpenseCategory,
  ExpenseRecord,
  FinanceDashboardStats,
  FinanceInvoice,
  RevenueRecord,
} from "@/lib/types/finance";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/types/finance";
import {
  listBrokerPayments,
  listExpenses,
  listInvoices,
  listOwnerSettlements,
  listPayrollSettlements,
  listRevenue,
} from "@/lib/data/finance-store";

/** Reference "today" aligned with demo seed data */
export const FINANCE_TODAY = "2026-07-17";

function parseDate(iso: string): number {
  return new Date(`${iso.slice(0, 10)}T12:00:00Z`).getTime();
}

function startOfWeek(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  const day = d.getUTCDay();
  const diff = day === 0 ? 6 : day - 1; // Monday start
  d.setUTCDate(d.getUTCDate() - diff);
  return d.toISOString().slice(0, 10);
}

function startOfMonth(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

export function formatFinanceMoney(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(abs);
  return amount < 0 ? `−${formatted}` : formatted;
}

export function formatFinancePercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function buildFinanceDashboardStats(
  tenantId: string,
  today: string = FINANCE_TODAY,
): FinanceDashboardStats {
  const revenue = listRevenue(tenantId);
  const expenses = listExpenses(tenantId);
  const invoices = listInvoices(tenantId);
  const brokerPayments = listBrokerPayments(tenantId);
  const payroll = listPayrollSettlements(tenantId);

  const weekStart = startOfWeek(today);
  const monthStart = startOfMonth(today);
  const todayTs = parseDate(today);
  const weekTs = parseDate(weekStart);
  const monthTs = parseDate(monthStart);

  const sumRevenueInRange = (fromTs: number, toTs: number) =>
    revenue
      .filter((r) => {
        const t = parseDate(r.deliveredAt);
        return t >= fromTs && t <= toTs;
      })
      .reduce((sum, r) => sum + r.amount, 0);

  const todayRevenue = sumRevenueInRange(todayTs, todayTs);
  const weekRevenue = sumRevenueInRange(weekTs, todayTs);
  const monthRevenue = sumRevenueInRange(monthTs, todayTs);

  const outstandingInvoices = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue" || i.status === "partial")
    .reduce((sum, i) => sum + (i.amount - i.amountPaid), 0);

  const outstandingBrokerPayments = brokerPayments
    .filter(
      (p) =>
        p.status === "outstanding" ||
        p.status === "overdue" ||
        p.status === "partial",
    )
    .reduce((sum, p) => sum + (p.invoiceAmount - p.amountReceived + p.lateFees), 0);

  const driverPayrollDue = payroll
    .filter((p) => p.status === "ready" || p.status === "draft")
    .reduce((sum, p) => sum + p.netPay, 0);

  const monthExpenses = expenses.filter((e) => parseDate(e.occurredAt) >= monthTs);
  const fuelExpenses = monthExpenses
    .filter((e) => e.category === "fuel")
    .reduce((sum, e) => sum + e.amount, 0);
  const maintenanceExpenses = monthExpenses
    .filter((e) => e.category === "maintenance" || e.category === "repairs")
    .reduce((sum, e) => sum + e.amount, 0);

  const monthExpenseTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = monthRevenue - monthExpenseTotal;

  const cashIn = brokerPayments
    .filter((p) => p.receivedAt && parseDate(p.receivedAt) >= monthTs)
    .reduce((sum, p) => sum + p.amountReceived, 0);
  const cashOut =
    monthExpenseTotal +
    payroll
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.netPay, 0);
  const cashFlow = cashIn - cashOut + weekRevenue * 0.35;

  return {
    todayRevenue,
    weekRevenue,
    monthRevenue,
    outstandingInvoices,
    outstandingBrokerPayments,
    driverPayrollDue,
    fuelExpenses,
    maintenanceExpenses,
    netProfit,
    cashFlow,
  };
}

export type RevenueByEntity = { label: string; amount: number };
export type ExpenseByCategory = { category: ExpenseCategory; label: string; amount: number };

export function revenueByTruck(revenue: RevenueRecord[]): RevenueByEntity[] {
  const map = new Map<string, number>();
  for (const r of revenue) {
    const key = r.truckUnit ? `Unit ${r.truckUnit}` : "Unassigned";
    map.set(key, (map.get(key) ?? 0) + r.amount);
  }
  return [...map.entries()]
    .map(([label, amount]) => ({ label, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function revenueByDriver(revenue: RevenueRecord[]): RevenueByEntity[] {
  const map = new Map<string, number>();
  for (const r of revenue) {
    const key = r.driverName ?? "Unassigned";
    map.set(key, (map.get(key) ?? 0) + r.amount);
  }
  return [...map.entries()]
    .map(([label, amount]) => ({ label, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function revenueByBroker(revenue: RevenueRecord[]): RevenueByEntity[] {
  const map = new Map<string, number>();
  for (const r of revenue) {
    map.set(r.brokerName, (map.get(r.brokerName) ?? 0) + r.amount);
  }
  return [...map.entries()]
    .map(([label, amount]) => ({ label, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function expenseByCategory(expenses: ExpenseRecord[]): ExpenseByCategory[] {
  const map = new Map<ExpenseCategory, number>();
  for (const e of expenses) {
    map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
  }
  return [...map.entries()]
    .map(([category, amount]) => ({
      category,
      label: EXPENSE_CATEGORY_LABELS[category],
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function costPerMile(
  revenue: RevenueRecord[],
  expenses: ExpenseRecord[],
): number {
  const miles = revenue.reduce((sum, r) => sum + r.miles, 0);
  if (miles === 0) return 0;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  return totalExpenses / miles;
}

export function revenuePerMile(revenue: RevenueRecord[]): number {
  const miles = revenue.reduce((sum, r) => sum + r.miles, 0);
  if (miles === 0) return 0;
  return revenue.reduce((sum, r) => sum + r.amount, 0) / miles;
}

export function fuelAnalysis(expenses: ExpenseRecord[]): {
  total: number;
  trips: number;
  avgPerFill: number;
} {
  const fuel = expenses.filter((e) => e.category === "fuel");
  const total = fuel.reduce((sum, e) => sum + e.amount, 0);
  return {
    total,
    trips: fuel.length,
    avgPerFill: fuel.length ? total / fuel.length : 0,
  };
}

export function profitAndLoss(
  tenantId: string,
  today: string = FINANCE_TODAY,
): {
  revenue: number;
  expenses: number;
  payroll: number;
  grossProfit: number;
  netProfit: number;
} {
  const monthStart = startOfMonth(today);
  const monthTs = parseDate(monthStart);
  const todayTs = parseDate(today);

  const revenue = listRevenue(tenantId)
    .filter((r) => {
      const t = parseDate(r.deliveredAt);
      return t >= monthTs && t <= todayTs;
    })
    .reduce((sum, r) => sum + r.amount, 0);

  const expenses = listExpenses(tenantId)
    .filter((e) => parseDate(e.occurredAt) >= monthTs)
    .reduce((sum, e) => sum + e.amount, 0);

  const payroll = listPayrollSettlements(tenantId)
    .filter((p) => p.status !== "draft")
    .reduce((sum, p) => sum + p.netPay, 0);

  const grossProfit = revenue - expenses;
  const netProfit = grossProfit - payroll;

  return { revenue, expenses, payroll, grossProfit, netProfit };
}

export function ownerSettlementTotals(tenantId: string) {
  const settlements = listOwnerSettlements(tenantId);
  return {
    revenue: settlements.reduce((s, o) => s + o.revenue, 0),
    expenses: settlements.reduce((s, o) => s + o.expenses, 0),
    profit: settlements.reduce((s, o) => s + o.profit, 0),
  };
}

export function outstandingInvoiceCount(invoices: FinanceInvoice[]): number {
  return invoices.filter(
    (i) => i.status === "sent" || i.status === "overdue" || i.status === "partial",
  ).length;
}
