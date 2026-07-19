import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import CompareClient from "@/components/exchange/CompareClient";
import ExchangeSubNav from "@/components/exchange/ExchangeSubNav";
import { listCompareListings } from "@/lib/exchange/store";

export default function ExchangeComparePage() {
  return (
    <PageShell
      eyebrow="Transpo Exchange™"
      title="Compare"
      description="Side-by-side price, warranty, seller rating, distance, shipping, availability, delivery, and verification."
    >
      <ExchangeSubNav />
      <FadeIn>
        <CompareClient initial={listCompareListings()} />
      </FadeIn>
    </PageShell>
  );
}
