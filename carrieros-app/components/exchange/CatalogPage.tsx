import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import CatalogBrowseClient from "@/components/exchange/CatalogBrowseClient";
import ExchangeSubNav from "@/components/exchange/ExchangeSubNav";
import { listListings, listSellers } from "@/lib/exchange/store";
import type { ExchangeCategory } from "@/lib/exchange/types";
import { EXCHANGE_CATEGORY_LABELS } from "@/lib/exchange/types";

export default function CatalogPage({
  category,
  channel,
  title,
  description,
  softLinks,
}: {
  category?: ExchangeCategory;
  channel?: "government" | "enterprise" | "public";
  title?: string;
  description?: string;
  softLinks?: { label: string; href: string }[];
}) {
  const listings = listListings({ category, channel });
  const sellersById = Object.fromEntries(listSellers().map((s) => [s.id, s]));
  const label = category ? EXCHANGE_CATEGORY_LABELS[category] : title ?? "Catalog";

  return (
    <PageShell
      eyebrow="Transpo Exchange™"
      title={title ?? label}
      description={
        description ??
        `Browse verified ${label.toLowerCase()} listings — filter by price, distance, condition, and seller trust.`
      }
    >
      <ExchangeSubNav />
      <FadeIn>
        <CatalogBrowseClient
          initialListings={listings}
          sellersById={sellersById}
          category={category}
          channel={channel}
          softLinks={softLinks}
        />
      </FadeIn>
    </PageShell>
  );
}
