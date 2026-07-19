"use client";

import Link from "next/link";
import { formatMoney, type BuyerHubData } from "@/lib/exchange/board";
import { ORDER_STATUS_LABELS, OFFER_STATUS_LABELS } from "@/lib/exchange/types";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";

export default function BuyerHubClient({
  data,
}: {
  data: BuyerHubData;
}) {
  return (
    <div className="space-y-6">
      <p className={`rounded-[12px] px-3 py-2 text-[13px] ${TRANSPO_COLORS.info.bg} ${TRANSPO_COLORS.info.text}`}>
        Role note: buyer actions require verified sellers for escrow demo. Identity verification via{" "}
        <Link href="/wallet/trust" className="font-semibold underline">
          Trust
        </Link>{" "}
        /{" "}
        <Link href="/wallet" className="font-semibold underline">
          Wallet
        </Link>
        .
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3 rounded-[16px] bg-[#F8F9FB] p-4">
          <h2 className="transpo-section-title text-[17px]">Saved searches</h2>
          <ul className="space-y-2">
            {data.savedSearches.map((ss) => (
              <li key={ss.id} className="rounded-[12px] bg-white px-3 py-3 text-[13px]">
                <p className="font-medium">{ss.name}</p>
                <p className="mt-0.5 text-[#6B7280]">
                  {ss.query}
                  {ss.maxPrice ? ` · ≤ ${formatMoney(ss.maxPrice)}` : ""}
                  {ss.verifiedOnly ? " · verified" : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
        <section className="space-y-3 rounded-[16px] bg-[#F8F9FB] p-4">
          <div className="flex items-center justify-between">
            <h2 className="transpo-section-title text-[17px]">Favorites</h2>
            <Link href="/exchange/compare" className="text-[13px] font-medium text-[#2563EB]">
              Compare ({data.compare.length})
            </Link>
          </div>
          <ul className="space-y-2">
            {data.favorites.map((listing) => (
              <li key={listing.id}>
                <Link
                  href={`/exchange/listings/${listing.id}`}
                  className="flex justify-between rounded-[12px] bg-white px-3 py-3 text-[13px] hover:bg-[#EFF6FF]"
                >
                  <span className="font-medium">{listing.title}</span>
                  <span className="text-[#6B7280]">
                    {formatMoney(listing.price, listing.priceLabel)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="transpo-section-title text-[17px]">Quotes & offers</h2>
          <ul className="space-y-2">
            {data.offers.map((offer) => (
              <li key={offer.id} className="rounded-[12px] bg-[#F8F9FB] px-3 py-3 text-[13px]">
                <p className="font-medium">
                  {formatMoney(offer.amount)} · {OFFER_STATUS_LABELS[offer.status]}
                </p>
                <Link
                  href={`/exchange/listings/${offer.listingId}`}
                  className="mt-0.5 text-[#2563EB]"
                >
                  View listing
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="space-y-3">
          <h2 className="transpo-section-title text-[17px]">Orders & invoices</h2>
          <ul className="space-y-2">
            {data.orders.map((order) => (
              <li key={order.id} className="rounded-[12px] bg-[#F8F9FB] px-3 py-3 text-[13px]">
                <p className="font-medium">{order.title}</p>
                <p className="mt-0.5 text-[#6B7280]">
                  {ORDER_STATUS_LABELS[order.status]}
                  {order.invoiceNumber ? ` · ${order.invoiceNumber}` : ""}
                  {order.trackingNumber ? ` · ${order.trackingNumber}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="transpo-section-title text-[17px]">Messages</h2>
          <ul className="space-y-2">
            {data.messages.slice(0, 8).map((msg) => (
              <li key={msg.id} className="rounded-[12px] bg-[#F8F9FB] px-3 py-3 text-[13px]">
                <p className="font-medium">{msg.from}</p>
                <p className="mt-0.5 text-[#6B7280]">{msg.body}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="space-y-3">
          <h2 className="transpo-section-title text-[17px]">Warranty & returns</h2>
          <ul className="space-y-2">
            {data.orders
              .filter((o) => o.warrantyMonths || o.returnEligible)
              .map((order) => (
                <li key={order.id} className="rounded-[12px] bg-[#F8F9FB] px-3 py-3 text-[13px]">
                  <p className="font-medium">{order.title}</p>
                  <p className="mt-0.5 text-[#6B7280]">
                    {order.warrantyMonths ? `${order.warrantyMonths} mo warranty` : ""}
                    {order.returnEligible ? " · returns eligible" : ""}
                  </p>
                </li>
              ))}
          </ul>
          <Link href="/exchange/financing" className="text-[13px] font-medium text-[#2563EB]">
            Financing applications ({data.financing.length})
          </Link>
        </section>
      </div>
    </div>
  );
}
