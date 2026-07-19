import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import AiShoppingClient from "@/components/exchange/AiShoppingClient";
import ExchangeSubNav from "@/components/exchange/ExchangeSubNav";
import { searchForAi } from "@/lib/exchange/store";

export default function ExchangeAiPage() {
  const initialQuery = "Best reefer under $45k";
  const initialResults = searchForAi(initialQuery);

  return (
    <PageShell
      eyebrow="Transpo Exchange™"
      title="AI Shopping"
      description="Alph purchasing assistant — reefers, Cascadias, fuel cards, OEM parts, emergency tires, insurance, and maintenance."
    >
      <ExchangeSubNav />
      <FadeIn>
        <AiShoppingClient initialQuery={initialQuery} initialResults={initialResults} />
      </FadeIn>
    </PageShell>
  );
}
