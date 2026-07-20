"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAiSafety } from "@/components/ai-safety/AiSafetyProvider";
import FadeIn from "@/components/ui/FadeIn";
import FinanceAlphAlertsStrip from "@/components/finance/FinanceAlphAlertsStrip";
import FinanceDashboardStats from "@/components/finance/FinanceDashboardStats";
import FinanceFeedbackToast from "@/components/finance/FinanceFeedbackToast";
import FinanceQuickActions from "@/components/finance/FinanceQuickActions";
import FinanceTabs, { parseFinanceTab } from "@/components/finance/FinanceTabs";
import BrokerPaymentsPanel from "@/components/finance/panels/BrokerPaymentsPanel";
import DriverPayrollPanel from "@/components/finance/panels/DriverPayrollPanel";
import ExpensesPanel from "@/components/finance/panels/ExpensesPanel";
import FactoringPanel from "@/components/finance/panels/FactoringPanel";
import InvoicesPanel from "@/components/finance/panels/InvoicesPanel";
import OwnerSettlementsPanel from "@/components/finance/panels/OwnerSettlementsPanel";
import ReportsPanel from "@/components/finance/panels/ReportsPanel";
import RevenuePanel from "@/components/finance/panels/RevenuePanel";
import { usePermissions } from "@/hooks/usePermissions";
import { DENIED_TOOLTIP } from "@/lib/permissions/check";
import {
  buildFinanceDashboardStats,
  formatFinanceMoney,
} from "@/lib/finance/finance-board";
import {
  downloadFinanceExcelCsv,
  downloadFinancePdfSummary,
} from "@/lib/finance/finance-export";
import type {
  BrokerPaymentRecord,
  DriverPayrollSettlement,
  ExpenseRecord,
  FactoringAccount,
  FinanceAlphAlert,
  FinanceInvoice,
  FinanceTab,
  OwnerSettlement,
  RevenueRecord,
} from "@/lib/types/finance";

export type FinanceDashboardData = {
  tenantId: string;
  revenue: RevenueRecord[];
  expenses: ExpenseRecord[];
  invoices: FinanceInvoice[];
  brokerPayments: BrokerPaymentRecord[];
  payroll: DriverPayrollSettlement[];
  settlements: OwnerSettlement[];
  factoring: FactoringAccount[];
  alphAlerts: FinanceAlphAlert[];
  missingInvoiceLoads: RevenueRecord[];
};

type FinanceDashboardClientProps = {
  data: FinanceDashboardData;
  initialTab: FinanceTab;
};

export default function FinanceDashboardClient({
  data,
  initialTab,
}: FinanceDashboardClientProps) {
  const { runAiSuggestedAction } = useAiSafety();
  const searchParams = useSearchParams();
  const activeTab = parseFinanceTab(searchParams.get("tab") ?? initialTab);
  const { can, cannotReason } = usePermissions();
  const canExportFinance = can("button.finance.export");
  const exportDeniedReason =
    cannotReason("button.finance.export") ?? DENIED_TOOLTIP;

  const [revenue, setRevenue] = useState(data.revenue);
  const [expenses, setExpenses] = useState(data.expenses);
  const [invoices, setInvoices] = useState(data.invoices);
  const [brokerPayments, setBrokerPayments] = useState(data.brokerPayments);
  const [payroll, setPayroll] = useState(data.payroll);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [localAlerts, setLocalAlerts] = useState(data.alphAlerts);

  const pathname = usePathname();
  const router = useRouter();

  const showFeedback = useCallback((message: string) => {
    setFeedback(message);
  }, []);

  const dismissFeedback = useCallback(() => setFeedback(null), []);

  const goToTab = useCallback(
    (tab: FinanceTab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === "overview") {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const missingInvoiceLoads = useMemo(() => {
    const invoiceLoadIds = new Set(
      invoices.filter((i) => i.loadId).map((i) => i.loadId as string),
    );
    return revenue.filter(
      (r) =>
        (r.status === "pending" || r.status === "invoiced") &&
        !invoiceLoadIds.has(r.loadId) &&
        !r.invoiceId,
    );
  }, [invoices, revenue]);

  const stats = useMemo(() => {
    // Recompute lightly from local state for interactive feedback
    const outstandingInvoices = invoices
      .filter(
        (i) =>
          i.status === "sent" || i.status === "overdue" || i.status === "partial",
      )
      .reduce((sum, i) => sum + (i.amount - i.amountPaid), 0);
    const outstandingBrokerPayments = brokerPayments
      .filter(
        (p) =>
          p.status === "outstanding" ||
          p.status === "overdue" ||
          p.status === "partial",
      )
      .reduce(
        (sum, p) => sum + (p.invoiceAmount - p.amountReceived + p.lateFees),
        0,
      );
    const driverPayrollDue = payroll
      .filter((p) => p.status === "ready" || p.status === "draft")
      .reduce((sum, p) => sum + p.netPay, 0);

    const base = buildFinanceDashboardStats(data.tenantId);
    return {
      ...base,
      outstandingInvoices,
      outstandingBrokerPayments,
      driverPayrollDue,
      fuelExpenses: expenses
        .filter((e) => e.category === "fuel")
        .reduce((s, e) => s + e.amount, 0),
      maintenanceExpenses: expenses
        .filter((e) => e.category === "maintenance" || e.category === "repairs")
        .reduce((s, e) => s + e.amount, 0),
    };
  }, [brokerPayments, data.tenantId, expenses, invoices, payroll]);

  function handleCreateInvoice() {
    goToTab("invoices");
    if (missingInvoiceLoads.length === 0) {
      showFeedback("No delivered loads waiting for invoices");
      return;
    }
    createInvoicesFromLoads(missingInvoiceLoads.slice(0, 1));
  }

  function handleAiGenerate() {
    if (missingInvoiceLoads.length === 0) {
      showFeedback("All delivered loads already have invoices");
      return;
    }
    void runAiSuggestedAction({
      kind: "invoice_approve",
      suggestion: `Generate ${missingInvoiceLoads.length} invoice${
        missingInvoiceLoads.length === 1 ? "" : "s"
      } from delivered loads`,
      confidence: "review_recommended",
      reason:
        "Alph prepared invoice drafts from delivered loads. Approving creates and sends them.",
      dataUsed: missingInvoiceLoads
        .slice(0, 5)
        .map((l) => l.loadReference),
      source: "finance-ai-invoice",
      onConfirm: () => createInvoicesFromLoads(missingInvoiceLoads),
    });
  }

  function createInvoicesFromLoads(loads: RevenueRecord[]) {
    const created: FinanceInvoice[] = loads.map((load, index) => {
      const invoiceNumber = `INV-${load.loadReference.replace(/^LD-/, "")}`;
      return {
        tenantId: data.tenantId,
        id: `inv-ai-${Date.now()}-${index}`,
        invoiceNumber,
        loadId: load.loadId,
        loadReference: load.loadReference,
        brokerId: load.brokerId,
        brokerName: load.brokerName,
        amount: load.amount,
        amountPaid: 0,
        status: "sent" as const,
        issuedAt: "2026-07-17",
        dueDate: "2026-08-16",
        emailedAt: "2026-07-17",
        pdfName: `${invoiceNumber}.pdf`,
        reminders: [],
        notes: "Generated by Alph AI Invoice Generator",
      };
    });

    setInvoices((prev) => [...created, ...prev]);
    setRevenue((prev) =>
      prev.map((r) =>
        loads.some((l) => l.id === r.id)
          ? { ...r, status: "invoiced" as const, invoiceId: created.find((c) => c.loadId === r.loadId)?.id }
          : r,
      ),
    );
    setLocalAlerts((prev) =>
      prev.filter((a) => a.type !== "missing_invoice"),
    );
    goToTab("invoices");
    showFeedback(
      loads.length === 1
        ? `Invoice ${created[0].invoiceNumber} created`
        : `${created.length} invoices generated`,
    );
  }

  function handleEmailInvoice(invoice: FinanceInvoice) {
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === invoice.id
          ? { ...i, emailedAt: "2026-07-17", status: i.status === "draft" ? "sent" : i.status }
          : i,
      ),
    );
    showFeedback(`Emailed ${invoice.invoiceNumber} to ${invoice.brokerName}`);
  }

  function handleDownloadPdf(invoice: FinanceInvoice) {
    downloadFinancePdfSummary(invoice.invoiceNumber, [
      `Bill to: ${invoice.brokerName}`,
      `Load: ${invoice.loadReference ?? "—"}`,
      `Amount: ${formatFinanceMoney(invoice.amount)}`,
      `Due: ${invoice.dueDate}`,
      `Status: ${invoice.status}`,
    ]);
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === invoice.id
          ? { ...i, pdfName: i.pdfName ?? `${i.invoiceNumber}.pdf` }
          : i,
      ),
    );
    showFeedback(`Downloaded ${invoice.invoiceNumber}.pdf`);
  }

  function handleSendReminder(invoice: FinanceInvoice) {
    const reminder = {
      id: `rem-${Date.now()}`,
      sentAt: "2026-07-17",
      channel: "email" as const,
      note: "Payment reminder sent",
    };
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === invoice.id
          ? { ...i, reminders: [...i.reminders, reminder] }
          : i,
      ),
    );
    setLocalAlerts((prev) =>
      prev.filter((a) => a.relatedId !== invoice.id || a.type !== "overdue_invoice"),
    );
    showFeedback(`Reminder sent for ${invoice.invoiceNumber}`);
  }

  function handleRecordPayment(payment: BrokerPaymentRecord) {
    setBrokerPayments((prev) =>
      prev.map((p) =>
        p.id === payment.id
          ? {
              ...p,
              amountReceived: p.invoiceAmount,
              lateFees: 0,
              status: "paid" as const,
              receivedAt: "2026-07-17",
            }
          : p,
      ),
    );
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === payment.invoiceId
          ? {
              ...i,
              amountPaid: i.amount,
              status: "paid" as const,
              paidAt: "2026-07-17",
            }
          : i,
      ),
    );
    showFeedback(`Payment recorded for ${payment.invoiceNumber}`);
  }

  function handleAddExpense() {
    const expense: ExpenseRecord = {
      tenantId: data.tenantId,
      id: `exp-${Date.now()}`,
      category: "other",
      description: "Manual expense entry",
      amount: 125,
      occurredAt: "2026-07-17",
      vendor: "Office",
      receiptOnFile: false,
    };
    setExpenses((prev) => [expense, ...prev]);
    goToTab("expenses");
    showFeedback("Expense recorded — $125");
  }

  function handleRunPayroll() {
    setPayroll((prev) =>
      prev.map((p) =>
        p.status === "ready" ? { ...p, status: "paid" as const } : p,
      ),
    );
    goToTab("payroll");
    showFeedback("Payroll run complete — ready settlements marked paid");
  }

  function handleExportPdf() {
    downloadFinancePdfSummary("Finance Summary", [
      `Today's revenue: ${formatFinanceMoney(stats.todayRevenue)}`,
      `This week: ${formatFinanceMoney(stats.weekRevenue)}`,
      `This month: ${formatFinanceMoney(stats.monthRevenue)}`,
      `Outstanding invoices: ${formatFinanceMoney(stats.outstandingInvoices)}`,
      `Broker payments due: ${formatFinanceMoney(stats.outstandingBrokerPayments)}`,
      `Payroll due: ${formatFinanceMoney(stats.driverPayrollDue)}`,
      `Net profit: ${formatFinanceMoney(stats.netProfit)}`,
      `Cash flow: ${formatFinanceMoney(stats.cashFlow)}`,
      `Invoices: ${invoices.length}`,
      `Expenses: ${expenses.length}`,
    ]);
    showFeedback("Finance PDF summary downloaded");
  }

  function handleExportExcel() {
    downloadFinanceExcelCsv(
      "transpo-finance-export.csv",
      ["Type", "Reference", "Party", "Amount", "Status", "Date"],
      [
        ...revenue.map((r) => [
          "Revenue",
          r.loadReference,
          r.brokerName,
          String(r.amount),
          r.status,
          r.deliveredAt,
        ]),
        ...expenses.map((e) => [
          "Expense",
          e.id,
          e.vendor ?? e.category,
          String(e.amount),
          e.category,
          e.occurredAt,
        ]),
        ...invoices.map((i) => [
          "Invoice",
          i.invoiceNumber,
          i.brokerName,
          String(i.amount),
          i.status,
          i.dueDate,
        ]),
      ],
    );
    showFeedback("Excel CSV exported");
  }

  function handleAlphFix(alert: FinanceAlphAlert) {
    switch (alert.fixAction) {
      case "viewInvoices":
        goToTab("invoices");
        break;
      case "viewBrokerPayments":
        goToTab("broker_payments");
        break;
      case "viewExpenses":
        goToTab("expenses");
        break;
      case "viewRevenue":
        goToTab("revenue");
        break;
      case "viewPayroll":
        goToTab("payroll");
        break;
      case "viewReports":
        goToTab("reports");
        break;
      case "createInvoice":
        handleAiGenerate();
        break;
      case "sendReminder": {
        const invoice = invoices.find((i) => i.id === alert.relatedId);
        if (invoice) {
          handleSendReminder(invoice);
          goToTab("invoices");
        } else {
          goToTab("invoices");
        }
        break;
      }
      default:
        break;
    }
  }

  const quickActions = [
    {
      id: "create-invoice",
      label: "Create Invoice",
      primary: true,
      onClick: handleCreateInvoice,
    },
    {
      id: "record-payment",
      label: "Record Payment",
      onClick: () => {
        const next = brokerPayments.find(
          (p) =>
            p.status === "outstanding" ||
            p.status === "overdue" ||
            p.status === "partial",
        );
        if (next) {
          handleRecordPayment(next);
          goToTab("broker_payments");
        } else {
          showFeedback("No outstanding broker payments");
          goToTab("broker_payments");
        }
      },
    },
    {
      id: "add-expense",
      label: "Add Expense",
      onClick: handleAddExpense,
    },
    {
      id: "run-payroll",
      label: "Run Payroll",
      onClick: handleRunPayroll,
    },
    {
      id: "export-pdf",
      label: "Export PDF",
      onClick: handleExportPdf,
      disabled: !canExportFinance,
      title: canExportFinance ? "Export PDF summary" : exportDeniedReason,
    },
    {
      id: "export-excel",
      label: "Export Excel",
      onClick: handleExportExcel,
      disabled: !canExportFinance,
      title: canExportFinance ? "Export Excel CSV" : exportDeniedReason,
    },
    {
      id: "email-invoice",
      label: "Email Invoice",
      onClick: () => {
        const next = invoices.find(
          (i) => i.status === "sent" || i.status === "draft" || i.status === "overdue",
        );
        if (next) {
          handleEmailInvoice(next);
          goToTab("invoices");
        } else {
          showFeedback("No invoices ready to email");
        }
      },
    },
    {
      id: "send-reminder",
      label: "Send Payment Reminder",
      onClick: () => {
        const next = invoices.find(
          (i) => i.status === "overdue" || i.status === "sent",
        );
        if (next) {
          handleSendReminder(next);
          goToTab("invoices");
        } else {
          showFeedback("No invoices need reminders");
        }
      },
    },
  ];

  return (
    <FadeIn className="space-y-6">
      <FinanceFeedbackToast message={feedback} onDismiss={dismissFeedback} />

      <FinanceDashboardStats stats={stats} />

      <FinanceQuickActions actions={quickActions} />

      {localAlerts.length > 0 ? (
        <FinanceAlphAlertsStrip
          alerts={localAlerts}
          onFix={handleAlphFix}
        />
      ) : null}

      <FinanceTabs activeTab={activeTab} />

      {activeTab === "overview" ? (
        <div className="space-y-6">
          <RevenuePanel revenue={revenue.slice(0, 5)} />
          <InvoicesPanel
            invoices={invoices.slice(0, 4)}
            missingLoads={missingInvoiceLoads}
            onCreateInvoice={handleCreateInvoice}
            onAiGenerate={handleAiGenerate}
            onEmail={handleEmailInvoice}
            onDownloadPdf={handleDownloadPdf}
            onSendReminder={handleSendReminder}
          />
        </div>
      ) : null}

      {activeTab === "revenue" ? <RevenuePanel revenue={revenue} /> : null}

      {activeTab === "expenses" ? (
        <ExpensesPanel expenses={expenses} onAddExpense={handleAddExpense} />
      ) : null}

      {activeTab === "invoices" ? (
        <InvoicesPanel
          invoices={invoices}
          missingLoads={missingInvoiceLoads}
          onCreateInvoice={handleCreateInvoice}
          onAiGenerate={handleAiGenerate}
          onEmail={handleEmailInvoice}
          onDownloadPdf={handleDownloadPdf}
          onSendReminder={handleSendReminder}
        />
      ) : null}

      {activeTab === "broker_payments" ? (
        <BrokerPaymentsPanel
          payments={brokerPayments}
          onRecordPayment={handleRecordPayment}
        />
      ) : null}

      {activeTab === "payroll" ? (
        <DriverPayrollPanel
          settlements={payroll}
          onRunPayroll={handleRunPayroll}
        />
      ) : null}

      {activeTab === "settlements" ? (
        <OwnerSettlementsPanel settlements={data.settlements} />
      ) : null}

      {activeTab === "factoring" ? (
        <FactoringPanel accounts={data.factoring} />
      ) : null}

      {activeTab === "reports" ? (
        <ReportsPanel
          tenantId={data.tenantId}
          revenue={revenue}
          expenses={expenses}
        />
      ) : null}
    </FadeIn>
  );
}
