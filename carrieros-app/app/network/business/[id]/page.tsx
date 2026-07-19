import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import BusinessDetailClient from "@/components/network/BusinessDetailClient";
import NetworkSubNav from "@/components/network/NetworkSubNav";
import EmptyState from "@/components/ui/EmptyState";
import { getBusinessDetail } from "@/lib/network/board";

export default async function NetworkBusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = getBusinessDetail(id);

  return (
    <PageShell
      eyebrow="Transpo Verified Network™"
      title={data?.member.displayName ?? "Business Passport"}
      description="Verified company identity with timeline, authority, and partner signals."
      action={
        <Link href="/network/business" className="transpo-btn-primary text-[13px]">
          All businesses
        </Link>
      }
    >
      <NetworkSubNav />
      <FadeIn>
        {data ? (
          <BusinessDetailClient data={data} />
        ) : (
          <EmptyState
            title="Company not found"
            description="This Business Passport is not in the seed directory."
            actionLabel="Back to businesses"
            actionHref="/network/business"
          />
        )}
      </FadeIn>
    </PageShell>
  );
}
