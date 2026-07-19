import type {
  ExpenseRecord,
  FinanceAlphAlert,
  FinanceInvoice,
  RevenueRecord,
} from "@/lib/types/finance";
import {
  listBrokerPayments,
  listExpenses,
  listInvoices,
  listPayrollSettlements,
  listRevenue,
  getPendingRevenueWithoutInvoice,
} from "@/lib/data/finance-store";
import {
  buildFinanceDashboardStats,
  FINANCE_TODAY,
} from "@/lib/finance/finance-board";

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function findDuplicateExpenses(expenses: ExpenseRecord[]): ExpenseRecord[] {
  const seen = new Map<string, ExpenseRecord>();
  const duplicates: ExpenseRecord[] = [];

  for (const expense of expenses) {
    const key = [
      expense.category,
      expense.amount.toFixed(2),
      expense.occurredAt,
      expense.description.toLowerCase().trim(),
    ].join("|");

    if (seen.has(key)) {
      duplicates.push(expense);
    } else {
      seen.set(key, expense);
    }
  }

  return duplicates;
}

function unusualExpenses(expenses: ExpenseRecord[]): ExpenseRecord[] {
  const byCategory = new Map<string, number[]>();
  for (const e of expenses) {
    const list = byCategory.get(e.category) ?? [];
    list.push(e.amount);
    byCategory.set(e.category, list);
  }

  return expenses.filter((e) => {
    const amounts = byCategory.get(e.category) ?? [];
    if (amounts.length < 2) return e.amount >= 1500;
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    return e.amount >= avg * 2.5 && e.amount >= 800;
  });
}

function lowProfitLoads(revenue: RevenueRecord[]): RevenueRecord[] {
  return revenue.filter((r) => r.miles > 0 && r.amount / r.miles < 1.0);
}

export function detectFinanceAlphAlerts(
  tenantId: string,
  today: string = FINANCE_TODAY,
): FinanceAlphAlert[] {
  const alerts: FinanceAlphAlert[] = [];
  const invoices = listInvoices(tenantId);
  const brokerPayments = listBrokerPayments(tenantId);
  const expenses = listExpenses(tenantId);
  const revenue = listRevenue(tenantId);
  const payroll = listPayrollSettlements(tenantId);
  const stats = buildFinanceDashboardStats(tenantId, today);

  const overdueInvoices = invoices.filter((i) => i.status === "overdue");
  for (const invoice of overdueInvoices.slice(0, 2)) {
    alerts.push({
      id: `alph-overdue-${invoice.id}`,
      type: "overdue_invoice",
      severity: "critical",
      message: `${invoice.invoiceNumber} is overdue — ${formatMoney(invoice.amount - invoice.amountPaid)} from ${invoice.brokerName}`,
      fixLabel: "Send Reminder",
      fixAction: "sendReminder",
      relatedId: invoice.id,
    });
  }

  const lateBrokers = brokerPayments.filter((p) => p.status === "overdue");
  for (const payment of lateBrokers.slice(0, 2)) {
    alerts.push({
      id: `alph-late-broker-${payment.id}`,
      type: "late_paying_broker",
      severity: "warning",
      message: `${payment.brokerName} is late on ${payment.invoiceNumber}${payment.lateFees > 0 ? ` · ${formatMoney(payment.lateFees)} late fees` : ""}`,
      fixLabel: "View Payments",
      fixAction: "viewBrokerPayments",
      relatedId: payment.id,
    });
  }

  for (const expense of unusualExpenses(expenses).slice(0, 2)) {
    alerts.push({
      id: `alph-unusual-${expense.id}`,
      type: "unusual_expense",
      severity: "warning",
      message: `Unusual ${expense.category} expense — ${formatMoney(expense.amount)} · ${expense.description}`,
      fixLabel: "Review Expense",
      fixAction: "viewExpenses",
      relatedId: expense.id,
    });
  }

  for (const load of lowProfitLoads(revenue).slice(0, 2)) {
    const rpm = load.miles > 0 ? load.amount / load.miles : 0;
    alerts.push({
      id: `alph-low-profit-${load.id}`,
      type: "low_profit_load",
      severity: "warning",
      message: `Low-profit load ${load.loadReference} — $${rpm.toFixed(2)}/mi on ${load.miles} miles`,
      fixLabel: "View Revenue",
      fixAction: "viewRevenue",
      relatedId: load.id,
    });
  }

  if (stats.cashFlow < 0) {
    alerts.push({
      id: "alph-negative-cash-flow",
      type: "negative_cash_flow",
      severity: "critical",
      message: `Negative cash flow this period — ${formatMoney(stats.cashFlow)}. Review expenses and outstanding AR.`,
      fixLabel: "View Reports",
      fixAction: "viewReports",
    });
  }

  const avgNet =
    payroll.length > 0
      ? payroll.reduce((s, p) => s + p.netPay, 0) / payroll.length
      : 0;
  for (const row of payroll) {
    if (row.deductions > row.grossPay * 0.35 || (avgNet > 0 && row.netPay < avgNet * 0.55)) {
      alerts.push({
        id: `alph-payroll-${row.id}`,
        type: "payroll_anomaly",
        severity: "warning",
        message: `Payroll anomaly for ${row.driverName} — deductions ${formatMoney(row.deductions)}, net ${formatMoney(row.netPay)}`,
        fixLabel: "Review Payroll",
        fixAction: "viewPayroll",
        relatedId: row.id,
      });
    }
  }

  const missing = getPendingRevenueWithoutInvoice(tenantId);
  if (missing.length > 0) {
    alerts.push({
      id: "alph-missing-invoices",
      type: "missing_invoice",
      severity: missing.length >= 2 ? "critical" : "warning",
      message: `${missing.length} delivered load${missing.length === 1 ? "" : "s"} missing invoices — ${missing
        .slice(0, 3)
        .map((m) => m.loadReference)
        .join(", ")}`,
      fixLabel: "Create Invoice",
      fixAction: "createInvoice",
    });
  }

  const duplicates = findDuplicateExpenses(expenses);
  if (duplicates.length > 0) {
    const sample = duplicates[0];
    alerts.push({
      id: `alph-dup-${sample.id}`,
      type: "duplicate_expense",
      severity: "info",
      message: `Possible duplicate expense — ${formatMoney(sample.amount)} · ${sample.description}`,
      fixLabel: "Review Expenses",
      fixAction: "viewExpenses",
      relatedId: sample.id,
    });
  }

  // Deduplicate by id and cap
  const seen = new Set<string>();
  return alerts
    .filter((a) => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    })
    .slice(0, 8);
}

export function invoiceNeedsReminder(invoice: FinanceInvoice): boolean {
  return invoice.status === "overdue" || invoice.status === "sent";
}
