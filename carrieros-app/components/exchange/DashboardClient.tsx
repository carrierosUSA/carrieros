"use client";

import Link from "next/link";
import ListingCard from "@/components/exchange/ListingCard";
import VerifiedBadge from "@/components/exchange/VerifiedBadge";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import { formatMoney, type ExchangeDashboard } from "@/lib/exchange/board";
import { getSeller } from "@/lib/exchange/store";
import { ORDER_STATUS_LABELS } from "@/lib/exchange/types";
import { Sparkles } from "lucide-react";

const toneClass = {
  info: TRANSPO_COLORS.info,
  success: TRANSPO_COLORS.success,
  warning: TRANSPO_COLORS.warning,
} as const;

export default function DashboardClient({ data }: { data: ExchangeDashboard }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {data.kpis.map((kpi) => {
          const tone = toneClass[kpi.tone];
          return (
            <div key={kpi.label} className={`rounded-[16px] p-4 ${tone.bg}`}>
              <p className={`transpo-label text-[13px] ${tone.text}`}>{kpi.label}</p>
              <p className="transpo-number mt-1 text-[24px] font-bold text-[#111827]">
                {kpi.value}
              </p>
              <p className="mt-1 text-[12px] text-[#6B7280]">{kpi.hint}</p>
            </div>
          );
        })}
      </div>

      <section className="rounded-[16px] bg-gradient-to-br from-[#EFF6FF] to-[#F8F9FB] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#2563EB]">
              <Sparkles className="h-5 w-5" strokeWidth={2} />
            </span>
            <div>
              <h2 className="transpo-section-title text-[17px]">Alph shopping</h2>
              <p className="mt-1 text-[14px] text-[#6B7280]">
                Ask for reefers under $45k, Cascadias nearby, fuel cards, or emergency tires.
              </p>
            </div>
          </div>
          <Link href="/exchange/ai" className="transpo-btn-primary shrink-0">
            Open AI Shopping
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="transpo-section-title text-[17px]">Featured categories</h2>
          <Link href="/exchange/equipment" className="text-[13px] font-medium text-[#2563EB]">
            Browse all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {data.categories.map((cat) => (
            <Link
              key={cat.category}
              href={cat.href}
              className="rounded-[12px] bg-[#F8F9FB] px-3 py-3 transition hover:bg-[#EFF6FF]"
            >
              <p className="text-[14px] font-semibold text-[#111827]">{cat.label}</p>
              <p className="mt-0.5 text-[12px] text-[#6B7280]">{cat.count} listings</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="transpo-section-title text-[17px]">AI picks</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {data.aiPicks.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              seller={getSeller(listing.sellerId)}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3 rounded-[16px] bg-[#F8F9FB] p-4">
          <div className="flex items-center justify-between">
            <h2 className="transpo-section-title text-[17px]">Open orders</h2>
            <Link href="/exchange/orders" className="text-[13px] font-medium text-[#2563EB]">
              View orders
            </Link>
          </div>
          {data.openOrders.length === 0 ? (
            <p className="text-[14px] text-[#6B7280]">No open orders right now.</p>
          ) : (
            <ul className="space-y-2">
              {data.openOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between gap-3 rounded-[12px] bg-white px-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium text-[#111827]">{order.title}</p>
                    <p className="text-[12px] text-[#6B7280]">
                      {ORDER_STATUS_LABELS[order.status]}
                      {order.paymentDemoLabel ? ` · ${order.paymentDemoLabel}` : ""}
                    </p>
                  </div>
                  <p className="shrink-0 text-[14px] font-semibold">
                    {formatMoney(order.amount)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3 rounded-[16px] bg-[#F8F9FB] p-4">
          <div className="flex items-center justify-between">
            <h2 className="transpo-section-title text-[17px]">Saved</h2>
            <Link href="/exchange/buyer" className="text-[13px] font-medium text-[#2563EB]">
              Buyer Hub
            </Link>
          </div>
          {data.saved.length === 0 ? (
            <p className="text-[14px] text-[#6B7280]">Save listings from any catalog.</p>
          ) : (
            <ul className="space-y-2">
              {data.saved.map((listing) => (
                <li key={listing.id}>
                  <Link
                    href={`/exchange/listings/${listing.id}`}
                    className="flex items-center justify-between gap-3 rounded-[12px] bg-white px-3 py-3 hover:bg-[#EFF6FF]"
                  >
                    <span className="truncate text-[14px] font-medium">{listing.title}</span>
                    <span className="shrink-0 text-[13px] text-[#6B7280]">
                      {formatMoney(listing.price, listing.priceLabel)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {data.sellerSnippet ? (
        <section className="rounded-[16px] bg-[#F8F9FB] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="transpo-section-title text-[17px]">Seller performance</h2>
              <p className="mt-1 text-[14px] text-[#6B7280]">
                {data.sellerSnippet.seller.name} · {data.sellerSnippet.activeListings} active ·{" "}
                {formatMoney(data.sellerSnippet.revenueDemo)} demo GMV
              </p>
              <div className="mt-2">
                <VerifiedBadge seller={data.sellerSnippet.seller} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/exchange/seller" className="transpo-btn-primary">
                Seller Hub
              </Link>
              <Link href="/fleet" className="transpo-btn-secondary">
                List from Fleet
              </Link>
              <Link href="/workforce" className="transpo-btn-secondary">
                Hire via Workforce
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="transpo-section-title text-[17px]">Trending</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {data.trending.slice(0, 4).map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              seller={getSeller(listing.sellerId)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
