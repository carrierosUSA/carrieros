import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import DashboardClient from "@/components/exchange/DashboardClient";
import ExchangeSubNav from "@/components/exchange/ExchangeSubNav";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getExchangeDashboard } from "@/lib/exchange/board";
import Link from "next/link";

export default function ExchangeDashboardPage() {
  const tenantId = getActiveTenantId();
  const data = getExchangeDashboard(tenantId);

  return (
    <PageShell
      eyebrow="Transpo Exchange™"
      title="Commerce overview"
      description="Buy, sell, rent, hire services, and negotiate across North America’s trucking marketplace."
      action={
        <Link href="/exchange/ai" className="transpo-btn-primary">
          AI Shopping
        </Link>
      }
    >
      <ExchangeSubNav />
      <FadeIn>
        <DashboardClient data={data} />
      </FadeIn>
    </PageShell>
  );
}
