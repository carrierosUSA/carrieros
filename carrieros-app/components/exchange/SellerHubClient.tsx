"use client";

import Link from "next/link";
import VerifiedBadge from "@/components/exchange/VerifiedBadge";
import { formatMoney, type SellerHubData } from "@/lib/exchange/board";
import { ORDER_STATUS_LABELS, OFFER_STATUS_LABELS } from "@/lib/exchange/types";

export default function SellerHubClient({
  data,
}: {
  data: SellerHubData;
}) {
  if (!data.seller) {
    return <p className="text-[14px] text-[#6B7280]">Seller not found.</p>;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 rounded-[16px] bg-[#F8F9FB] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="transpo-section-title text-[18px]">{data.seller.name}</h2>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            {data.inventory.length} listings · {data.leads} open leads ·{" "}
            {formatMoney(data.revenueDemo)} demo revenue
          </p>
          <div className="mt-2">
            <VerifiedBadge seller={data.seller} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/exchange/ads" className="transpo-btn-primary">
            Advertising
          </Link>
          <Link href="/fleet" className="transpo-btn-secondary">
            Sync Fleet
          </Link>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[16px] bg-[#F8F9FB] p-4">
          <p className="transpo-label text-[13px] text-[#6B7280]">Inventory</p>
          <p className="transpo-number mt-1 text-[24px] font-bold">{data.inventory.length}</p>
        </div>
        <div className="rounded-[16px] bg-[#F8F9FB] p-4">
          <p className="transpo-label text-[13px] text-[#6B7280]">Orders</p>
          <p className="transpo-number mt-1 text-[24px] font-bold">{data.orders.length}</p>
        </div>
        <div className="rounded-[16px] bg-[#F8F9FB] p-4">
          <p className="transpo-label text-[13px] text-[#6B7280]">Rating</p>
          <p className="transpo-number mt-1 text-[24px] font-bold">
            {data.seller.rating.toFixed(1)}
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h3 className="transpo-section-title text-[17px]">Inventory</h3>
        <ul className="space-y-2">
          {data.inventory.map((listing) => (
            <li key={listing.id}>
              <Link
                href={`/exchange/listings/${listing.id}`}
                className="flex items-center justify-between gap-3 rounded-[12px] bg-[#F8F9FB] px-3 py-3 hover:bg-[#EFF6FF]"
              >
                <span className="truncate text-[14px] font-medium">{listing.title}</span>
                <span className="shrink-0 text-[13px] text-[#6B7280]">
                  {formatMoney(listing.price, listing.priceLabel)}
                  {listing.boosted ? " · Boosted" : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3">
          <h3 className="transpo-section-title text-[17px]">Leads & offers</h3>
          <ul className="space-y-2">
            {data.offers.map((offer) => (
              <li key={offer.id} className="rounded-[12px] bg-[#F8F9FB] px-3 py-3 text-[13px]">
                <p className="font-medium">
                  {formatMoney(offer.amount)} · {OFFER_STATUS_LABELS[offer.status]}
                </p>
                <p className="mt-0.5 text-[#6B7280]">
                  {offer.buyerName} · {offer.kind}
                </p>
              </li>
            ))}
          </ul>
        </section>
        <section className="space-y-3">
          <h3 className="transpo-section-title text-[17px]">Orders</h3>
          <ul className="space-y-2">
            {data.orders.map((order) => (
              <li key={order.id} className="rounded-[12px] bg-[#F8F9FB] px-3 py-3 text-[13px]">
                <p className="font-medium">{order.title}</p>
                <p className="mt-0.5 text-[#6B7280]">
                  {ORDER_STATUS_LABELS[order.status]} · {formatMoney(order.amount)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3">
          <h3 className="transpo-section-title text-[17px]">Messages</h3>
          <ul className="space-y-2">
            {data.messages.slice(0, 6).map((msg) => (
              <li key={msg.id} className="rounded-[12px] bg-[#F8F9FB] px-3 py-3 text-[13px]">
                <p className="font-medium">
                  {msg.from} → {msg.to}
                </p>
                <p className="mt-0.5 text-[#6B7280]">{msg.body}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="space-y-3">
          <h3 className="transpo-section-title text-[17px]">Reviews</h3>
          <ul className="space-y-2">
            {data.reviews.map((rev) => (
              <li key={rev.id} className="rounded-[12px] bg-[#F8F9FB] px-3 py-3 text-[13px]">
                <p className="font-medium">
                  {rev.rating.toFixed(1)} · {rev.author}
                </p>
                <p className="mt-0.5 text-[#6B7280]">{rev.body}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="space-y-3">
        <h3 className="transpo-section-title text-[17px]">Ad performance</h3>
        <ul className="space-y-2">
          {data.ads.map((ad) => (
            <li
              key={ad.id}
              className="flex justify-between rounded-[12px] bg-[#F8F9FB] px-3 py-3 text-[13px]"
            >
              <span className="font-medium">{ad.name}</span>
              <span className="text-[#6B7280]">
                {ad.clicks} clicks · {formatMoney(ad.spendDemo)} spend
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
