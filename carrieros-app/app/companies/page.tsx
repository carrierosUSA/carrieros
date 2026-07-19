import { Suspense } from "react";
import CompanyDashboardClient from "@/components/companies/CompanyDashboardClient";
import CompanyDashboardSkeleton from "@/components/companies/CompanyDashboardSkeleton";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import { detectDashboardCompanyAlphInsights } from "@/lib/companies/company-alph-alerts";
import { listCompaniesByTenant } from "@/lib/data/companies";
import { getActiveTenantId } from "@/lib/data/tenant";

export default function CompaniesPage() {
  const tenantId = getActiveTenantId();
  const companies = listCompaniesByTenant(tenantId);
  const alphInsights = detectDashboardCompanyAlphInsights(companies);

  return (
    <OperationalPageShell
      title="Companies"
      subtitle="One directory for brokers, shippers, vendors, and partners."
      eyebrow="Company Management"
    >
      <Suspense fallback={<CompanyDashboardSkeleton />}>
        <CompanyDashboardClient
          companies={companies}
          alphInsights={alphInsights}
        />
      </Suspense>
    </OperationalPageShell>
  );
}
