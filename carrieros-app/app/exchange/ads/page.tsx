import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import AdsClient from "@/components/exchange/AdsClient";
import ExchangeSubNav from "@/components/exchange/ExchangeSubNav";
import { listAds } from "@/lib/exchange/store";

export default function ExchangeAdsPage() {
  return (
    <PageShell
      eyebrow="Transpo Exchange™"
      title="Advertising"
      description="Featured listings, sponsored businesses, homepage and search promotions — demo ad slots and boosts."
    >
      <ExchangeSubNav />
      <FadeIn>
        <AdsClient initial={listAds()} />
      </FadeIn>
    </PageShell>
  );
}
