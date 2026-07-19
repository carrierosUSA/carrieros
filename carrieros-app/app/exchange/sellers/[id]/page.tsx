import { notFound } from "next/navigation";
import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import ExchangeSubNav from "@/components/exchange/ExchangeSubNav";
import SellerPublicClient from "@/components/exchange/SellerPublicClient";
import { getSeller, listListingsBySeller, listReviews } from "@/lib/exchange/store";

export default async function ExchangeSellerPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const seller = getSeller(id);
  if (!seller) notFound();

  return (
    <PageShell
      eyebrow="Transpo Exchange™"
      title={seller.name}
      description={`${seller.city}, ${seller.state} · ${seller.kind.replaceAll("_", " ")} on Transpo Exchange™`}
    >
      <ExchangeSubNav />
      <FadeIn>
        <SellerPublicClient
          seller={seller}
          listings={listListingsBySeller(seller.id)}
          reviews={listReviews(seller.id)}
        />
      </FadeIn>
    </PageShell>
  );
}
