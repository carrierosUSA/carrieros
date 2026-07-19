"use client";

import { useState } from "react";
import Link from "next/link";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import { formatMoney } from "@/lib/exchange/board";
import {
  listAuditLog,
  listOrders,
  simulateDemoPayment,
  updateOrderStatus,
} from "@/lib/exchange/store";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_DEMO_DISCLAIMER,
  type ExchangeOrder,
  type OrderStatus,
} from "@/lib/exchange/types";

export default function OrdersClient({
  initialOrders,
  initialAudit,
}: {
  initialOrders: ExchangeOrder[];
  initialAudit: ReturnType<typeof listAuditLog>;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [audit, setAudit] = useState(initialAudit);
  const [notice, setNotice] = useState<string | null>(null);

  function refresh() {
    setOrders(listOrders());
    setAudit(listAuditLog());
  }

  return (
    <div className="space-y-5">
      <p className={`rounded-[12px] px-3 py-2 text-[13px] ${TRANSPO_COLORS.warning.bg} ${TRANSPO_COLORS.warning.text}`}>
        {PAYMENT_DEMO_DISCLAIMER}
      </p>

      <div className="space-y-3">
        {orders.map((order) => (
          <article key={order.id} className="rounded-[16px] bg-[#F8F9FB] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Link
                  href={`/exchange/listings/${order.listingId}`}
                  className="text-[16px] font-semibold hover:text-[#2563EB]"
                >
                  {order.title}
                </Link>
                <p className="mt-1 text-[13px] text-[#6B7280]">
                  {order.id} · {ORDER_STATUS_LABELS[order.status]}
                  {order.invoiceNumber ? ` · ${order.invoiceNumber}` : ""}
                  {order.poNumber ? ` · ${order.poNumber}` : ""}
                </p>
                {order.paymentDemoLabel ? (
                  <p className={`mt-1 text-[12px] ${TRANSPO_COLORS.info.text}`}>
                    {order.paymentDemoLabel}
                  </p>
                ) : null}
                {order.trackingNumber ? (
                  <p className="mt-1 text-[13px] text-[#334155]">
                    Tracking {order.trackingNumber}
                    {order.shippingCarrier ? ` via ${order.shippingCarrier}` : ""}
                  </p>
                ) : null}
              </div>
              <p className="transpo-number text-[20px] font-bold">{formatMoney(order.amount)}</p>
            </div>

            <ol className="mt-3 space-y-1 border-t border-[#E5E7EB]/60 pt-3">
              {order.events.map((ev, i) => (
                <li key={`${order.id}-${i}`} className="text-[13px] text-[#6B7280]">
                  {new Date(ev.at).toLocaleString()} — {ev.label}
                </li>
              ))}
            </ol>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="transpo-btn-secondary text-[13px]"
                onClick={() => {
                  const r = simulateDemoPayment(order.id, "demo_ach");
                  if (!("error" in r)) {
                    setNotice(r.paymentDemoLabel ?? "Demo ACH");
                    refresh();
                  }
                }}
              >
                Demo ACH
              </button>
              <button
                type="button"
                className="transpo-btn-secondary text-[13px]"
                onClick={() => {
                  const r = simulateDemoPayment(order.id, "demo_escrow");
                  if ("error" in r) setNotice(r.error);
                  else {
                    setNotice(r.paymentDemoLabel ?? "Escrow demo");
                    refresh();
                  }
                }}
              >
                Escrow demo
              </button>
              <button
                type="button"
                className="transpo-btn-secondary text-[13px]"
                onClick={() => {
                  updateOrderStatus(order.id, "shipped" as OrderStatus, "Marked shipped (demo)");
                  refresh();
                }}
              >
                Mark shipped
              </button>
              {order.returnEligible ? (
                <button
                  type="button"
                  className="transpo-btn-secondary text-[13px]"
                  onClick={() => {
                    updateOrderStatus(order.id, "return_requested", "Return requested");
                    refresh();
                  }}
                >
                  Request return
                </button>
              ) : null}
              {order.financingApplicationId ? (
                <Link href="/exchange/financing" className="transpo-btn-secondary text-[13px]">
                  Financing
                </Link>
              ) : null}
              {order.warrantyMonths ? (
                <span className="rounded-full bg-white px-3 py-1.5 text-[12px] text-[#6B7280]">
                  Warranty {order.warrantyMonths} mo
                </span>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="transpo-section-title text-[17px]">Transaction audit log</h2>
        <ul className="space-y-2">
          {audit.map((entry) => (
            <li key={entry.id} className="rounded-[12px] bg-[#F8F9FB] px-3 py-3 text-[13px]">
              <p className="font-medium text-[#111827]">{entry.summary}</p>
              <p className="mt-0.5 text-[#6B7280]">
                {new Date(entry.at).toLocaleString()} · {entry.actor} · {entry.action}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {notice ? (
        <p className={`rounded-[12px] px-3 py-2 text-[13px] ${TRANSPO_COLORS.info.bg} ${TRANSPO_COLORS.info.text}`}>
          {notice}
        </p>
      ) : null}
    </div>
  );
}
