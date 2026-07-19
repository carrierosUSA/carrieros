"use client";

import Link from "next/link";
import { Heart, Scale } from "lucide-react";
import VerifiedBadge from "@/components/exchange/VerifiedBadge";
import { formatMoney } from "@/lib/exchange/board";
import type { ExchangeListing, ExchangeSeller } from "@/lib/exchange/types";
import { LISTING_CONDITION_LABELS } from "@/lib/exchange/types";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";

export default function ListingCard({
  listing,
  seller,
  favorite,
  compared,
  onToggleFavorite,
  onToggleCompare,
}: {
  listing: ExchangeListing;
  seller?: ExchangeSeller;
  favorite?: boolean;
  compared?: boolean;
  onToggleFavorite?: (id: string) => void;
  onToggleCompare?: (id: string) => void;
}) {
  return (
    <article className="group flex flex-col rounded-[16px] bg-[#F8F9FB] p-4 transition hover:bg-[#F1F5F9]">
      <div
        className="mb-3 h-28 w-full rounded-[12px]"
        style={{
          background: `linear-gradient(135deg, hsl(${listing.imageHue} 55% 42%), hsl(${(listing.imageHue + 40) % 360} 40% 28%))`,
        }}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {listing.sponsored ? (
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${TRANSPO_COLORS.info.bg} ${TRANSPO_COLORS.info.text}`}>
                Sponsored
              </span>
            ) : null}
            {listing.boosted ? (
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${TRANSPO_COLORS.warning.bg} ${TRANSPO_COLORS.warning.text}`}>
                Boosted
              </span>
            ) : null}
            {listing.aiScore && listing.aiScore >= 90 ? (
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${TRANSPO_COLORS.success.bg} ${TRANSPO_COLORS.success.text}`}>
                AI pick
              </span>
            ) : null}
          </div>
          <h3 className="transpo-card-title mt-1 text-[15px] leading-snug">
            <Link href={`/exchange/listings/${listing.id}`} className="hover:text-[#2563EB]">
              {listing.title}
            </Link>
          </h3>
          <p className="mt-1 text-[13px] text-[#6B7280]">{listing.summary}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          {onToggleFavorite ? (
            <button
              type="button"
              aria-label={favorite ? "Remove favorite" : "Save favorite"}
              onClick={() => onToggleFavorite(listing.id)}
              className="rounded-full p-2 text-[#6B7280] hover:bg-white hover:text-[#DC2626]"
            >
              <Heart
                className="h-4 w-4"
                strokeWidth={2}
                fill={favorite ? "#DC2626" : "none"}
                color={favorite ? "#DC2626" : "currentColor"}
              />
            </button>
          ) : null}
          {onToggleCompare ? (
            <button
              type="button"
              aria-label={compared ? "Remove from compare" : "Add to compare"}
              onClick={() => onToggleCompare(listing.id)}
              className={`rounded-full p-2 hover:bg-white ${compared ? TRANSPO_COLORS.info.text : "text-[#6B7280]"}`}
            >
              <Scale className="h-4 w-4" strokeWidth={2} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <p className="transpo-number text-[18px] font-bold text-[#111827]">
            {formatMoney(listing.price, listing.priceLabel)}
          </p>
          <p className="mt-0.5 text-[12px] text-[#6B7280]">
            {LISTING_CONDITION_LABELS[listing.condition]} · {listing.locationCity},{" "}
            {listing.locationState} · {listing.distanceMiles} mi
          </p>
        </div>
        {seller ? <VerifiedBadge seller={seller} compact /> : null}
      </div>
    </article>
  );
}
