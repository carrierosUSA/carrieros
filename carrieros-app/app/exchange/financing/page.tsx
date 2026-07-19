import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import ExchangeSubNav from "@/components/exchange/ExchangeSubNav";
import FinancingClient from "@/components/exchange/FinancingClient";
import { listFinancing } from "@/lib/exchange/store";

export default function ExchangeFinancingPage() {
  return (
    <PageShell
      eyebrow="Transpo Exchange™"
      title="Financing"
      description="Equipment, trailer, working capital, fleet loans, fuel advances, and business loans — demo underwriting pipeline."
    >
      <ExchangeSubNav />
      <FadeIn>
        <FinancingClient initial={listFinancing()} />
      </FadeIn>
    </PageShell>
  );
}
