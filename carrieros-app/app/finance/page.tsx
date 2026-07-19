import { Suspense } from "react";
import FinanceDashboardClient from "@/components/finance/FinanceDashboardClient";
import FinanceDashboardSkeleton from "@/components/finance/FinanceDashboardSkeleton";
import { parseFinanceTab } from "@/components/finance/FinanceTabs";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import { getActiveTenantId } from "@/lib/data/tenant";
import {
  getPendingRevenueWithoutInvoice,
  listBrokerPayments,
  listExpenses,
  listFactoringAccounts,
  listInvoices,
  listOwnerSettlements,
  listPayrollSettlements,
  listRevenue,
} from "@/lib/data/finance-store";
import { detectFinanceAlphAlerts } from "@/lib/finance/finance-alph-alerts";

type FinancePageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function FinancePage({ searchParams }: FinancePageProps) {
  const params = await searchParams;
  const tenantId = getActiveTenantId();
  const initialTab = parseFinanceTab(params.tab);

  const data = {
    tenantId,
    revenue: listRevenue(tenantId),
    expenses: listExpenses(tenantId),
    invoices: listInvoices(tenantId),
    brokerPayments: listBrokerPayments(tenantId),
    payroll: listPayrollSettlements(tenantId),
    settlements: listOwnerSettlements(tenantId),
    factoring: listFactoringAccounts(tenantId),
    alphAlerts: detectFinanceAlphAlerts(tenantId),
    missingInvoiceLoads: getPendingRevenueWithoutInvoice(tenantId),
  };

  return (
    <OperationalPageShell
      title="Finance"
      subtitle="Revenue, invoices, payroll, settlements, and cash flow — in one place."
      eyebrow="Accounting & Finance"
    >
      <Suspense fallback={<FinanceDashboardSkeleton />}>
        <FinanceDashboardClient data={data} initialTab={initialTab} />
      </Suspense>
    </OperationalPageShell>
  );
}
