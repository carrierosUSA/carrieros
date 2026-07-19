import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import ExchangeSubNav from "@/components/exchange/ExchangeSubNav";
import InsightsClient from "@/components/exchange/InsightsClient";
import { getInsights } from "@/lib/exchange/board";

export default function ExchangeInsightsPage() {
  return (
    <PageShell
      eyebrow="Transpo Exchange™"
      title="Insights"
      description="Market trends, equipment value, demand forecasts, seasonal pricing, and Alph purchase recommendations."
    >
      <ExchangeSubNav />
      <FadeIn>
        <InsightsClient insights={getInsights()} />
      </FadeIn>
    </PageShell>
  );
}
