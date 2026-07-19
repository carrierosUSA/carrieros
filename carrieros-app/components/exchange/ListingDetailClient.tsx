"use client";

import { useState } from "react";
import Link from "next/link";
import FraudFlags from "@/components/exchange/FraudFlags";
import VerifiedBadge from "@/components/exchange/VerifiedBadge";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import { formatMoney } from "@/lib/exchange/board";
import {
  boostListing,
  counterOffer,
  createOffer,
  isFavorite,
  listOffers,
  resolveOffer,
  simulateDemoPayment,
  toggleFavorite,
  updateOrderStatus,
  listOrders,
} from "@/lib/exchange/store";
import type { ExchangeListing, ExchangeOffer, ExchangeSeller } from "@/lib/exchange/types";
import {
  ESCROW_DEMO_DISCLAIMER,
  LISTING_CONDITION_LABELS,
  OFFER_STATUS_LABELS,
  PAYMENT_DEMO_DISCLAIMER,
} from "@/lib/exchange/types";
import ActionTooltip from "@/components/ui/ActionTooltip";

export default function ListingDetailClient({
  listing: initial,
  seller,
}: {
  listing: ExchangeListing;
  seller: ExchangeSeller;
}) {
  const [listing, setListing] = useState(initial);
  const [favorite, setFavorite] = useState(isFavorite(initial.id));
  const [offers, setOffers] = useState(() => listOffers(initial.id));
  const [offerAmount, setOfferAmount] = useState(
    String(Math.round(initial.price * 0.95) || 0),
  );
  const [offerKind, setOfferKind] = useState<ExchangeOffer["kind"]>("standard");
  const [offerMsg, setOfferMsg] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const relatedOrder = listOrders().find((o) => o.listingId === listing.id);

  function refreshOffers() {
    setOffers(listOffers(listing.id));
  }

  function submitOffer() {
    setError(null);
    const result = createOffer({
      listingId: listing.id,
      amount: Number(offerAmount) || 0,
      kind: offerKind,
      message: offerMsg,
    });
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setNotice("Offer sent. Negotiation state is live in the local store.");
    refreshOffers();
  }

  function onBoost() {
    const result = boostListing(listing.id);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setListing({ ...listing, boosted: true, sponsored: true });
    setNotice("Listing boosted into a demo ad slot. See Advertising.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-4">
        <div
          className="h-56 w-full rounded-[16px] sm:h-72"
          style={{
            background: `linear-gradient(135deg, hsl(${listing.imageHue} 55% 42%), hsl(${(listing.imageHue + 40) % 360} 40% 28%))`,
          }}
          aria-hidden
        />
        <div>
          <div className="flex flex-wrap gap-2">
            {listing.featured ? (
              <span className={`rounded-full px-3 py-1 text-[12px] font-medium ${TRANSPO_COLORS.info.bg} ${TRANSPO_COLORS.info.text}`}>
                Featured
              </span>
            ) : null}
            {listing.aiScore ? (
              <span className={`rounded-full px-3 py-1 text-[12px] font-medium ${TRANSPO_COLORS.success.bg} ${TRANSPO_COLORS.success.text}`}>
                Alph score {listing.aiScore}
              </span>
            ) : null}
          </div>
          <h2 className="transpo-section-title mt-2 text-[20px]">{listing.title}</h2>
          <p className="mt-1 text-[14px] text-[#6B7280]">{listing.summary}</p>
          <p className="mt-3 text-[15px] leading-relaxed text-[#334155]">{listing.description}</p>
        </div>

        {Object.keys(listing.specs).length ? (
          <dl className="grid grid-cols-2 gap-3 rounded-[16px] bg-[#F8F9FB] p-4 sm:grid-cols-3">
            {Object.entries(listing.specs).map(([k, v]) => (
              <div key={k}>
                <dt className="transpo-label text-[12px] text-[#6B7280]">{k}</dt>
                <dd className="mt-0.5 text-[14px] font-medium text-[#111827]">{v}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <FraudFlags flags={listing.fraudFlags} />

        <section className="space-y-3 rounded-[16px] bg-[#F8F9FB] p-4">
          <h3 className="transpo-card-title text-[16px]">Smart negotiation</h3>
          <p className="text-[13px] text-[#6B7280]">
            Offer, counter, fleet, and fleet pricing with Alph suggested amounts.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="transpo-label text-[13px]">Your offer (USD)</span>
              <input
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="w-full rounded-[12px] bg-white px-3 py-2.5 text-[14px] ring-1 ring-[#E5E7EB]"
              />
            </label>
            <label className="space-y-1.5">
              <span className="transpo-label text-[13px]">Pricing kind</span>
              <select
                value={offerKind}
                onChange={(e) => setOfferKind(e.target.value as ExchangeOffer["kind"])}
                className="w-full rounded-[12px] bg-white px-3 py-2.5 text-[14px] ring-1 ring-[#E5E7EB]"
              >
                <option value="standard">Standard</option>
                <option value="bulk">Bulk</option>
                <option value="fleet">Fleet</option>
                <option value="volume">Volume</option>
                <option value="contract">Contract</option>
              </select>
            </label>
          </div>
          <label className="block space-y-1.5">
            <span className="transpo-label text-[13px]">Message</span>
            <textarea
              value={offerMsg}
              onChange={(e) => setOfferMsg(e.target.value)}
              rows={2}
              className="w-full rounded-[12px] bg-white px-3 py-2.5 text-[14px] ring-1 ring-[#E5E7EB]"
            />
          </label>
          <button type="button" className="transpo-btn-primary" onClick={submitOffer}>
            Send offer
          </button>
          {offers.length ? (
            <ul className="space-y-3 pt-2">
              {offers.map((offer) => (
                <li key={offer.id} className="rounded-[12px] bg-white p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[14px] font-semibold">
                      {formatMoney(offer.amount)} · {OFFER_STATUS_LABELS[offer.status]}
                    </p>
                    {offer.aiSuggestedAmount ? (
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${TRANSPO_COLORS.info.bg} ${TRANSPO_COLORS.info.text}`}>
                        Alph suggests {formatMoney(offer.aiSuggestedAmount)}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[12px] text-[#6B7280]">
                    {offer.kind} · {offer.history.length} events
                  </p>
                  {["sent", "countered"].includes(offer.status) ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="transpo-btn-secondary text-[13px]"
                        onClick={() => {
                          counterOffer(
                            offer.id,
                            Math.round(offer.amount * 1.03),
                            "seller",
                            "Seller counter",
                          );
                          refreshOffers();
                        }}
                      >
                        Seller counter
                      </button>
                      <button
                        type="button"
                        className="transpo-btn-secondary text-[13px]"
                        onClick={() => {
                          resolveOffer(offer.id, "accepted");
                          refreshOffers();
                          setNotice("Offer accepted — order created (demo payment/escrow path).");
                        }}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className="transpo-btn-secondary text-[13px]"
                        onClick={() => {
                          resolveOffer(offer.id, "declined");
                          refreshOffers();
                        }}
                      >
                        Decline
                      </button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>

      <aside className="space-y-4">
        <div className="rounded-[16px] bg-[#F8F9FB] p-5">
          <p className="transpo-number text-[28px] font-bold">
            {formatMoney(listing.price, listing.priceLabel)}
          </p>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            {LISTING_CONDITION_LABELS[listing.condition]} · {listing.locationCity},{" "}
            {listing.locationState} · {listing.distanceMiles} mi
          </p>
          {listing.shippingAvailable ? (
            <p className="mt-2 text-[13px] text-[#334155]">
              Shipping estimate{" "}
              {listing.shippingEstimate != null
                ? formatMoney(listing.shippingEstimate)
                : "quote"}
              {listing.deliveryDays != null ? ` · ~${listing.deliveryDays} days` : ""}
            </p>
          ) : (
            <p className="mt-2 text-[13px] text-[#334155]">Local / on-site service</p>
          )}
          {listing.warrantyMonths ? (
            <p className="mt-1 text-[13px] text-[#334155]">
              Warranty {listing.warrantyMonths} months
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="transpo-btn-secondary"
              onClick={() => {
                setFavorite(toggleFavorite(listing.id));
              }}
            >
              {favorite ? "Saved" : "Save"}
            </button>
            <button
              type="button"
              className="transpo-btn-secondary"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.clipboard) {
                  void navigator.clipboard.writeText(
                    `${typeof window !== "undefined" ? window.location.href : listing.id}`,
                  );
                  setNotice("Link copied.");
                }
              }}
            >
              Share
            </button>
            <button type="button" className="transpo-btn-secondary" onClick={onBoost}>
              Boost (demo ad)
            </button>
            <Link href="/exchange/compare" className="transpo-btn-secondary">
              Compare
            </Link>
          </div>
        </div>

        <div className="rounded-[16px] bg-[#F8F9FB] p-5">
          <Link
            href={`/exchange/sellers/${seller.id}`}
            className="text-[16px] font-semibold text-[#111827] hover:text-[#2563EB]"
          >
            {seller.name}
          </Link>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            {seller.city}, {seller.state} · {seller.rating.toFixed(1)} ({seller.reviewCount}{" "}
            reviews) · responds in ~{seller.responseHours}h
          </p>
          <div className="mt-3">
            <VerifiedBadge seller={seller} />
          </div>
          <p className="mt-3 text-[13px] text-[#334155]">{seller.bio}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/network" className="text-[13px] font-medium text-[#2563EB]">
              Network identity
            </Link>
            <Link href="/wallet/trust" className="text-[13px] font-medium text-[#2563EB]">
              Trust verification
            </Link>
          </div>
        </div>

        <div className="rounded-[16px] bg-[#F8F9FB] p-5">
          <h3 className="transpo-card-title text-[16px]">Checkout (architecture-ready)</h3>
          <p className={`mt-2 text-[12px] ${TRANSPO_COLORS.warning.text}`}>
            {PAYMENT_DEMO_DISCLAIMER}
          </p>
          <p className={`mt-1 text-[12px] ${TRANSPO_COLORS.info.text}`}>
            {ESCROW_DEMO_DISCLAIMER}
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <ActionTooltip
              label="Demo card"
              reason={
                seller.verified
                  ? undefined
                  : "Large demo payments recommend a verified seller — continue at your own risk."
              }
            >
              <button
                type="button"
                className="transpo-btn-primary w-full"
                onClick={() => {
                  if (!relatedOrder) {
                    const created = createOffer({
                      listingId: listing.id,
                      amount: listing.price,
                      message: "Buy now → demo checkout",
                    });
                    if (!("error" in created)) {
                      resolveOffer(created.id, "accepted");
                    }
                  }
                  const order = listOrders().find((o) => o.listingId === listing.id);
                  if (order) {
                    const result = simulateDemoPayment(order.id, "demo_card");
                    if ("error" in result) setError(result.error);
                    else setNotice(result.paymentDemoLabel ?? "Demo payment recorded");
                  }
                }}
              >
                Pay with demo card
              </button>
            </ActionTooltip>
            <ActionTooltip
              label="Escrow demo"
              disabled={!seller.verified}
              reason={
                seller.verified
                  ? undefined
                  : "Escrow demo requires a verified seller. Complete Trust verification."
              }
            >
              <button
                type="button"
                disabled={!seller.verified}
                className="transpo-btn-secondary w-full disabled:opacity-50"
                onClick={() => {
                  let order = listOrders().find((o) => o.listingId === listing.id);
                  if (!order) {
                    const created = createOffer({
                      listingId: listing.id,
                      amount: listing.price,
                    });
                    if (!("error" in created)) resolveOffer(created.id, "accepted");
                    order = listOrders().find((o) => o.listingId === listing.id);
                  }
                  if (order) {
                    const result = simulateDemoPayment(order.id, "demo_escrow");
                    if ("error" in result) setError(result.error);
                    else {
                      updateOrderStatus(order.id, "escrow_demo", "Escrow demo hold");
                      setNotice(result.paymentDemoLabel ?? "Escrow demo");
                    }
                  }
                }}
              >
                Escrow hold (demo)
              </button>
            </ActionTooltip>
            <Link href="/exchange/financing" className="transpo-btn-secondary w-full text-center">
              Apply for financing
            </Link>
            <Link href="/exchange/orders" className="text-center text-[13px] font-medium text-[#2563EB]">
              View orders & audit trail
            </Link>
          </div>
        </div>

        {notice ? (
          <p className={`rounded-[12px] px-3 py-2 text-[13px] ${TRANSPO_COLORS.success.bg} ${TRANSPO_COLORS.success.text}`}>
            {notice}
          </p>
        ) : null}
        {error ? (
          <p className={`rounded-[12px] px-3 py-2 text-[13px] ${TRANSPO_COLORS.critical.bg} ${TRANSPO_COLORS.critical.text}`}>
            {error}
          </p>
        ) : null}
      </aside>
    </div>
  );
}
