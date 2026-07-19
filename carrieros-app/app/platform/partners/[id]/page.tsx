import Link from "next/link";
import { notFound } from "next/navigation";
import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import PartnerDetailClient from "@/components/platform/PartnerDetailClient";
import PlatformSubNav from "@/components/platform/PlatformSubNav";
import { getPartner } from "@/lib/platform/store";

type Props = { params: Promise<{ id: string }> };

export default async function PlatformPartnerDetailPage({ params }: Props) {
  const { id } = await params;
  const partner = getPartner(id);
  if (!partner) notFound();

  return (
    <PageShell
      eyebrow="Partner Center"
      title={partner.name}
      description={`${partner.category} · ${partner.region}`}
      action={
        <Link href="/platform/partners" className="transpo-btn-secondary">
          All partners
        </Link>
      }
    >
      <PlatformSubNav />
      <FadeIn>
        <PartnerDetailClient partner={partner} />
      </FadeIn>
    </PageShell>
  );
}
