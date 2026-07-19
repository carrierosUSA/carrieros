import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import BuyerHubClient from "@/components/exchange/BuyerHubClient";
import ExchangeSubNav from "@/components/exchange/ExchangeSubNav";
import { getBuyerHubData } from "@/lib/exchange/board";

export default function ExchangeBuyerHubPage() {
  const data = getBuyerHubData();

  return (
    <PageShell
      eyebrow="Transpo Exchange™"
      title="Buyer Hub"
      description="Saved searches, favorites, quotes, orders, invoices, deliveries, warranty, returns, and messages."
    >
      <ExchangeSubNav />
      <FadeIn>
        <BuyerHubClient data={data} />
      </FadeIn>
    </PageShell>
  );
}
