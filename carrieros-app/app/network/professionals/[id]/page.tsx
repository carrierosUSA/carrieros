import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import NetworkSubNav from "@/components/network/NetworkSubNav";
import ProfessionalDetailClient from "@/components/network/ProfessionalDetailClient";
import EmptyState from "@/components/ui/EmptyState";
import { getProfessionalDetail } from "@/lib/network/board";

export default async function NetworkProfessionalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = getProfessionalDetail(id);

  return (
    <PageShell
      eyebrow="Transpo Verified Network™"
      title={data?.member.displayName ?? "Career Passport"}
      description="Verified professional identity with employment, skills, and reputation signals."
      action={
        <Link
          href="/network/professionals"
          className="transpo-btn-primary text-[13px]"
        >
          All professionals
        </Link>
      }
    >
      <NetworkSubNav />
      <FadeIn>
        {data ? (
          <ProfessionalDetailClient data={data} />
        ) : (
          <EmptyState
            title="Professional not found"
            description="This Career Passport is not in the seed directory."
            actionLabel="Back to professionals"
            actionHref="/network/professionals"
          />
        )}
      </FadeIn>
    </PageShell>
  );
}
