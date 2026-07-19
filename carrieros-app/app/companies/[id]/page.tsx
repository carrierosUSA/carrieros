import { Suspense } from "react";
import CompanyDetailShell from "@/components/companies/CompanyDetailShell";
import CompanyDetailSkeleton from "@/components/companies/CompanyDetailSkeleton";
import { parseCompanyTab } from "@/components/companies/CompanyDetailTabs";
import { detectCompanyAlphAlerts } from "@/lib/companies/company-alph-alerts";
import { getCompanyLoads } from "@/lib/companies/company-board";
import { requireCompany } from "@/lib/companies/require-company";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getLoadService } from "@/lib/services/loads";

type CompanyDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function CompanyDetailPage({
  params,
  searchParams,
}: CompanyDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const company = requireCompany(id);
  const tenantId = getActiveTenantId();
  const loads = await getLoadService().listLoads(tenantId);
  const companyLoads = getCompanyLoads(company, loads);
  const activeTab = parseCompanyTab(query.tab);
  const alphAlerts = detectCompanyAlphAlerts(company);

  return (
    <div className="w-full rounded-[16px] bg-white p-4 text-[#111827] sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1560px]">
        <Suspense fallback={<CompanyDetailSkeleton />}>
          <CompanyDetailShell
            company={company}
            loads={companyLoads}
            activeTab={activeTab}
            alphAlerts={alphAlerts}
          />
        </Suspense>
      </div>
    </div>
  );
}
