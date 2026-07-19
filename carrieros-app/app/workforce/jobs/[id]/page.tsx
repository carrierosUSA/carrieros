import Link from "next/link";
import { notFound } from "next/navigation";
import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import JobDetailClient from "@/components/workforce/JobDetailClient";
import WorkforceSubNav from "@/components/workforce/WorkforceSubNav";
import {
  candidateStore,
  getCompanyById,
  getJobById,
  listByTenant,
} from "@/lib/data/workforce-store";
import { getActiveTenantId } from "@/lib/data/tenant";

export default async function WorkforceJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = getJobById(id);
  if (!job) notFound();
  const company = getCompanyById(job.companyId);
  if (!company) notFound();
  const candidates = listByTenant(candidateStore, getActiveTenantId());

  return (
    <PageShell
      eyebrow="Workforce"
      title={job.title}
      description={`${company.name} · ${job.region}`}
      action={
        <Link href="/workforce/jobs" className="transpo-btn-secondary">
          Back to jobs
        </Link>
      }
    >
      <WorkforceSubNav />
      <FadeIn>
        <JobDetailClient job={job} company={company} candidates={candidates} />
      </FadeIn>
    </PageShell>
  );
}
