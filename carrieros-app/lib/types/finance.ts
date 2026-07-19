import type { TenantEntity } from "@/lib/types/base";

export interface Invoice extends TenantEntity {
  id: string;
  reference: string;
  status: string;
  amount: number;
  dueDate: string;
  loadId?: string;
}

export type LoadDocumentType =
  | "rate_confirmation"
  | "bol"
  | "final_pod"
  | "lumper_receipt"
  | "invoice"
  | "void_check";

export type LoadDocumentStatus = "missing" | "captured" | "scanned" | "approved";

export interface Document extends TenantEntity {
  id: string;
  type: string;
  status: string;
  expiresAt?: string;
  entityId: string;
  entityType: "load" | "driver" | "truck" | "company";
  loadId?: string;
}

export interface LoadDocumentRecord extends TenantEntity {
  id: string;
  loadId: string;
  type: LoadDocumentType;
  label: string;
  status: LoadDocumentStatus;
  fileName?: string;
  capturedAt?: string;
  scannedAt?: string;
  previewUrl?: string;
  sequence: number;
  required: boolean;
}

export interface InvoiceDraft extends TenantEntity {
  id: string;
  loadId: string;
  invoiceNumber: string;
  amount: number;
  status: "draft" | "ready";
  billTo: string;
  generatedAt: string;
}

export interface InvoicePacket extends TenantEntity {
  id: string;
  loadId: string;
  documentIds: string[];
  invoiceDraftId?: string;
  status: "missing_documents" | "ready_to_send";
  generatedPdfName?: string;
  readyMessage: string;
  updatedAt: string;
}

export const LOAD_DOCUMENT_SEQUENCE: Array<{
  type: LoadDocumentType;
  label: string;
  required: boolean;
}> = [
  { type: "rate_confirmation", label: "Rate Confirmation", required: true },
  { type: "bol", label: "BOL", required: true },
  { type: "final_pod", label: "Final POD", required: true },
  { type: "lumper_receipt", label: "Lumper Receipt", required: false },
  { type: "invoice", label: "Invoice", required: true },
  { type: "void_check", label: "Void Check", required: false },
];

export const LOAD_DOCUMENT_LABELS: Record<LoadDocumentType, string> = {
  rate_confirmation: "Rate Confirmation",
  bol: "BOL",
  final_pod: "Final POD",
  lumper_receipt: "Lumper Receipt",
  invoice: "Invoice",
  void_check: "Void Check",
};

/* ── Accounting & Finance module ─────────────────────────────────────────── */

export const REVENUE_STATUSES = [
  "pending",
  "invoiced",
  "paid",
  "overdue",
] as const;
export type RevenueStatus = (typeof REVENUE_STATUSES)[number];

export const REVENUE_STATUS_LABELS: Record<RevenueStatus, string> = {
  pending: "Pending",
  invoiced: "Invoiced",
  paid: "Paid",
  overdue: "Overdue",
};

export const EXPENSE_CATEGORIES = [
  "fuel",
  "maintenance",
  "tires",
  "toll",
  "hotel",
  "parking",
  "lumper",
  "scale",
  "repairs",
  "insurance",
  "office",
  "other",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  fuel: "Fuel",
  maintenance: "Maintenance",
  tires: "Tires",
  toll: "Toll",
  hotel: "Hotel",
  parking: "Parking",
  lumper: "Lumper",
  scale: "Scale",
  repairs: "Repairs",
  insurance: "Insurance",
  office: "Office",
  other: "Other",
};

export const FINANCE_INVOICE_STATUSES = [
  "draft",
  "sent",
  "paid",
  "overdue",
  "partial",
] as const;
export type FinanceInvoiceStatus = (typeof FINANCE_INVOICE_STATUSES)[number];

export const FINANCE_INVOICE_STATUS_LABELS: Record<FinanceInvoiceStatus, string> =
  {
    draft: "Draft",
    sent: "Sent",
    paid: "Paid",
    overdue: "Overdue",
    partial: "Partial",
  };

export const BROKER_PAYMENT_STATUSES = [
  "outstanding",
  "partial",
  "paid",
  "factored",
  "overdue",
] as const;
export type BrokerPaymentStatus = (typeof BROKER_PAYMENT_STATUSES)[number];

export const BROKER_PAYMENT_STATUS_LABELS: Record<BrokerPaymentStatus, string> =
  {
    outstanding: "Outstanding",
    partial: "Partial",
    paid: "Paid",
    factored: "Factored",
    overdue: "Overdue",
  };

export const DRIVER_PAY_METHODS = [
  "cpm",
  "percentage",
  "hourly",
  "salary",
] as const;
export type DriverPayMethod = (typeof DRIVER_PAY_METHODS)[number];

export const DRIVER_PAY_METHOD_LABELS: Record<DriverPayMethod, string> = {
  cpm: "CPM",
  percentage: "Percentage",
  hourly: "Hourly",
  salary: "Salary",
};

export const PAYROLL_SETTLEMENT_STATUSES = [
  "draft",
  "ready",
  "paid",
] as const;
export type PayrollSettlementStatus =
  (typeof PAYROLL_SETTLEMENT_STATUSES)[number];

export const OWNER_SETTLEMENT_PERIODS = ["weekly", "monthly"] as const;
export type OwnerSettlementPeriod = (typeof OWNER_SETTLEMENT_PERIODS)[number];

export interface RevenueRecord extends TenantEntity {
  id: string;
  loadId: string;
  loadReference: string;
  brokerId?: string;
  brokerName: string;
  driverId?: string;
  driverName?: string;
  truckId?: string;
  truckUnit?: string;
  amount: number;
  miles: number;
  deliveredAt: string;
  status: RevenueStatus;
  invoiceId?: string;
}

export interface ExpenseRecord extends TenantEntity {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  occurredAt: string;
  truckId?: string;
  truckUnit?: string;
  driverId?: string;
  driverName?: string;
  loadId?: string;
  loadReference?: string;
  vendor?: string;
  receiptOnFile: boolean;
}

export interface InvoiceReminder {
  id: string;
  sentAt: string;
  channel: "email" | "sms";
  note: string;
}

export interface FinanceInvoice extends TenantEntity {
  id: string;
  invoiceNumber: string;
  loadId?: string;
  loadReference?: string;
  brokerId?: string;
  brokerName: string;
  amount: number;
  amountPaid: number;
  status: FinanceInvoiceStatus;
  issuedAt: string;
  dueDate: string;
  paidAt?: string;
  emailedAt?: string;
  pdfName?: string;
  reminders: InvoiceReminder[];
  notes?: string;
}

export interface BrokerPaymentRecord extends TenantEntity {
  id: string;
  brokerId: string;
  brokerName: string;
  invoiceId: string;
  invoiceNumber: string;
  invoiceAmount: number;
  amountReceived: number;
  dueDate: string;
  receivedAt?: string;
  status: BrokerPaymentStatus;
  quickPay: boolean;
  factoring: boolean;
  lateFees: number;
  paymentTerms: string;
}

export interface DriverPayrollSettlement extends TenantEntity {
  id: string;
  driverId: string;
  driverName: string;
  period: string;
  payMethod: DriverPayMethod;
  rateLabel: string;
  miles: number;
  basePay: number;
  bonus: number;
  detention: number;
  layover: number;
  lumperReimbursement: number;
  fuelAdvance: number;
  deductions: number;
  grossPay: number;
  netPay: number;
  status: PayrollSettlementStatus;
}

export interface OwnerSettlement extends TenantEntity {
  id: string;
  truckId: string;
  truckUnit: string;
  ownerName: string;
  period: OwnerSettlementPeriod;
  periodLabel: string;
  revenue: number;
  expenses: number;
  profit: number;
  settledAt?: string;
  status: "pending" | "settled";
}

export interface FactoringAccount extends TenantEntity {
  id: string;
  companyName: string;
  advancePercent: number;
  feePercent: number;
  reservePercent: number;
  reserveHeld: number;
  releasedFunds: number;
  outstandingAdvance: number;
  invoicesFactored: number;
  status: "active" | "paused";
  lastReleaseAt?: string;
}

export interface FinanceDashboardStats {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  outstandingInvoices: number;
  outstandingBrokerPayments: number;
  driverPayrollDue: number;
  fuelExpenses: number;
  maintenanceExpenses: number;
  netProfit: number;
  cashFlow: number;
}

export type FinanceAlphAlertType =
  | "overdue_invoice"
  | "late_paying_broker"
  | "unusual_expense"
  | "low_profit_load"
  | "negative_cash_flow"
  | "payroll_anomaly"
  | "missing_invoice"
  | "duplicate_expense";

export type FinanceAlphSeverity = "info" | "warning" | "critical";

export type FinanceAlphFixAction =
  | "viewInvoices"
  | "viewBrokerPayments"
  | "viewExpenses"
  | "viewRevenue"
  | "viewPayroll"
  | "viewReports"
  | "createInvoice"
  | "sendReminder";

export interface FinanceAlphAlert {
  id: string;
  type: FinanceAlphAlertType;
  severity: FinanceAlphSeverity;
  message: string;
  fixLabel: string;
  fixAction: FinanceAlphFixAction;
  relatedId?: string;
}

export type FinanceTab =
  | "overview"
  | "revenue"
  | "expenses"
  | "invoices"
  | "broker_payments"
  | "payroll"
  | "settlements"
  | "factoring"
  | "reports";

export const FINANCE_TABS: { id: FinanceTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "revenue", label: "Revenue" },
  { id: "expenses", label: "Expenses" },
  { id: "invoices", label: "Invoices" },
  { id: "broker_payments", label: "Broker Payments" },
  { id: "payroll", label: "Driver Payroll" },
  { id: "settlements", label: "Owner Settlements" },
  { id: "factoring", label: "Factoring" },
  { id: "reports", label: "Reports" },
];
