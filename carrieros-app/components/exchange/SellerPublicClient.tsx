import Link from "next/link";
import ListingCard from "@/components/exchange/ListingCard";
import VerifiedBadge from "@/components/exchange/VerifiedBadge";
import type { ExchangeListing, ExchangeReview, ExchangeSeller } from "@/lib/exchange/types";

export default function SellerPublicClient({
  seller,
  listings,
  reviews,
}: {
  seller: ExchangeSeller;
  listings: ExchangeListing[];
  reviews: ExchangeReview[];
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-[16px] bg-[#F8F9FB] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="transpo-section-title text-[20px]">{seller.name}</h2>
            <p className="mt-1 text-[14px] text-[#6B7280]">
              {seller.city}, {seller.state} · Member since{" "}
              {new Date(seller.memberSince).toLocaleDateString()} · {seller.rating.toFixed(1)} (
              {seller.reviewCount} reviews)
            </p>
            <p className="mt-3 max-w-2xl text-[14px] text-[#334155]">{seller.bio}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {seller.specialties.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-white px-3 py-1 text-[12px] font-medium text-[#334155]"
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-3">
              <VerifiedBadge seller={seller} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/network" className="transpo-btn-secondary">
              Network
            </Link>
            <Link href="/wallet/trust" className="transpo-btn-secondary">
              Trust
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="transpo-section-title text-[17px]">Listings</h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} seller={seller} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="transpo-section-title text-[17px]">Reviews</h3>
        <ul className="space-y-2">
          {reviews.map((rev) => (
            <li key={rev.id} className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
              <p className="text-[14px] font-semibold">
                {rev.rating.toFixed(1)} · {rev.author}
              </p>
              <p className="mt-1 text-[13px] text-[#6B7280]">{rev.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
