import FadeIn from "@/components/ui/FadeIn";
import PageShell from "@/components/ui/PageShell";
import ExchangeSubNav from "@/components/exchange/ExchangeSubNav";
import OrdersClient from "@/components/exchange/OrdersClient";
import { listAuditLog, listOrders } from "@/lib/exchange/store";

export default function ExchangeOrdersPage() {
  return (
    <PageShell
      eyebrow="Transpo Exchange™"
      title="Orders"
      description="Quote requests, POs, invoices, demo payments, escrow holds, shipping, returns, and warranty."
    >
      <ExchangeSubNav />
      <FadeIn>
        <OrdersClient initialOrders={listOrders()} initialAudit={listAuditLog()} />
      </FadeIn>
    </PageShell>
  );
}
