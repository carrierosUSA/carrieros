import Link from "next/link";
import { notFound } from "next/navigation";
import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import ExchangeSubNav from "@/components/exchange/ExchangeSubNav";
import ListingDetailClient from "@/components/exchange/ListingDetailClient";
import { getListing, getSeller } from "@/lib/exchange/store";

export default async function ExchangeListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = getListing(id);
  if (!listing) notFound();
  const seller = getSeller(listing.sellerId);
  if (!seller) notFound();

  return (
    <PageShell
      eyebrow="Transpo Exchange™"
      title={listing.title}
      description={listing.summary}
      action={
        <Link href={`/exchange/sellers/${seller.id}`} className="transpo-btn-secondary">
          View seller
        </Link>
      }
    >
      <ExchangeSubNav />
      <FadeIn>
        <ListingDetailClient listing={listing} seller={seller} />
      </FadeIn>
    </PageShell>
  );
}
