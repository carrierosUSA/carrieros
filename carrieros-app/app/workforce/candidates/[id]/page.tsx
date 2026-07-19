import Link from "next/link";
import { notFound } from "next/navigation";
import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import CandidateDetailClient from "@/components/workforce/CandidateDetailClient";
import WorkforceSubNav from "@/components/workforce/WorkforceSubNav";
import { getCandidateById } from "@/lib/data/workforce-store";
import { candidateFullName } from "@/lib/workforce/board";

export default async function WorkforceCandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidate = getCandidateById(id);
  if (!candidate) notFound();

  return (
    <PageShell
      eyebrow="Workforce"
      title={candidateFullName(candidate)}
      description={candidate.headline}
      action={
        <Link href="/workforce/candidates" className="transpo-btn-secondary">
          Back to candidates
        </Link>
      }
    >
      <WorkforceSubNav />
      <FadeIn>
        <CandidateDetailClient candidate={candidate} />
      </FadeIn>
    </PageShell>
  );
}
