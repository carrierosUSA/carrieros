import Link from "next/link";
import { notFound } from "next/navigation";
import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import CompanyDetailClient from "@/components/workforce/CompanyDetailClient";
import WorkforceSubNav from "@/components/workforce/WorkforceSubNav";
import { getCompanyById, jobStore, listByTenant } from "@/lib/data/workforce-store";
import { getActiveTenantId } from "@/lib/data/tenant";

export default async function WorkforceCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = getCompanyById(id);
  if (!company) notFound();
  const jobs = listByTenant(jobStore, getActiveTenantId()).filter(
    (j) => j.companyId === company.id && j.status === "open",
  );

  return (
    <PageShell
      eyebrow="Workforce"
      title={company.name}
      description={company.tagline}
      action={
        <Link href="/workforce/companies" className="transpo-btn-secondary">
          Back to companies
        </Link>
      }
    >
      <WorkforceSubNav />
      <FadeIn>
        <CompanyDetailClient company={company} jobs={jobs} />
      </FadeIn>
    </PageShell>
  );
}
