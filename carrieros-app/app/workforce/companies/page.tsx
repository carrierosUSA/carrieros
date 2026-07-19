import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import CompaniesClient from "@/components/workforce/CompaniesClient";
import WorkforceSubNav from "@/components/workforce/WorkforceSubNav";
import { companyStore, listByTenant } from "@/lib/data/workforce-store";
import { getActiveTenantId } from "@/lib/data/tenant";

export default function WorkforceCompaniesPage() {
  const companies = listByTenant(companyStore, getActiveTenantId());

  return (
    <PageShell
      eyebrow="Workforce"
      title="Companies hiring"
      description="Carriers, brokers, shops, 3PLs, and industry employers with open roles."
    >
      <WorkforceSubNav />
      <FadeIn>
        <CompaniesClient companies={companies} />
      </FadeIn>
    </PageShell>
  );
}
