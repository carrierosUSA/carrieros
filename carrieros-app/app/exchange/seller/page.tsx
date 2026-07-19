import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import ExchangeSubNav from "@/components/exchange/ExchangeSubNav";
import SellerHubClient from "@/components/exchange/SellerHubClient";
import { getSellerHubData } from "@/lib/exchange/board";

export default function ExchangeSellerHubPage() {
  const data = getSellerHubData();

  return (
    <PageShell
      eyebrow="Transpo Exchange™"
      title="Seller Hub"
      description="Inventory, orders, revenue, leads, messages, reviews, analytics, and advertising performance."
    >
      <ExchangeSubNav />
      <FadeIn>
        <SellerHubClient data={data} />
      </FadeIn>
    </PageShell>
  );
}
