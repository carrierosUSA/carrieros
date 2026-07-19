"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ListingCard from "@/components/exchange/ListingCard";
import CreateListingDrawer from "@/components/exchange/CreateListingDrawer";
import EmptyState from "@/components/ui/EmptyState";
import {
  isFavorite,
  listCompareIds,
  listListings,
  toggleCompare,
  toggleFavorite,
} from "@/lib/exchange/store";
import type {
  ExchangeCategory,
  ExchangeListing,
  ExchangeSeller,
  ListingCondition,
} from "@/lib/exchange/types";
import { LISTING_CONDITION_LABELS } from "@/lib/exchange/types";
import { PackageSearch } from "lucide-react";

export default function CatalogBrowseClient({
  initialListings,
  sellersById,
  category,
  channel,
  emptyTitle,
  emptyDescription,
  showCreate = true,
  softLinks,
}: {
  initialListings: ExchangeListing[];
  sellersById: Record<string, ExchangeSeller>;
  category?: ExchangeCategory;
  channel?: "government" | "enterprise" | "public";
  emptyTitle?: string;
  emptyDescription?: string;
  showCreate?: boolean;
  softLinks?: { label: string; href: string }[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [maxDistance, setMaxDistance] = useState("");
  const [condition, setCondition] = useState<ListingCondition | "">("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [favTick, setFavTick] = useState(0);
  const [compareTick, setCompareTick] = useState(0);

  const listings = useMemo(() => {
    void favTick;
    void compareTick;
    return listListings({
      category,
      channel,
      query: query || undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      maxDistance: maxDistance ? Number(maxDistance) : undefined,
      condition: condition || undefined,
      verifiedOnly: verifiedOnly || undefined,
    });
  }, [
    category,
    channel,
    query,
    maxPrice,
    maxDistance,
    condition,
    verifiedOnly,
    favTick,
    compareTick,
    initialListings.length,
  ]);

  const compareCount = listCompareIds().length;

  return (
    <div className="space-y-4">
      {softLinks?.length ? (
        <div className="flex flex-wrap gap-2">
          {softLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full bg-[#EFF6FF] px-4 py-2 text-[13px] font-medium text-[#2563EB]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 rounded-[16px] bg-[#F8F9FB] p-4 lg:flex-row lg:items-end">
        <label className="min-w-0 flex-1 space-y-1.5">
          <span className="transpo-label text-[13px]">Search</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Make, model, part, service…"
            className="w-full rounded-[12px] bg-white px-3 py-2.5 text-[14px] outline-none ring-1 ring-[#E5E7EB] focus:ring-[#BFDBFE]"
          />
        </label>
        <label className="w-full space-y-1.5 sm:w-32">
          <span className="transpo-label text-[13px]">Max price</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Any"
            className="w-full rounded-[12px] bg-white px-3 py-2.5 text-[14px] outline-none ring-1 ring-[#E5E7EB]"
          />
        </label>
        <label className="w-full space-y-1.5 sm:w-32">
          <span className="transpo-label text-[13px]">Distance mi</span>
          <input
            type="number"
            value={maxDistance}
            onChange={(e) => setMaxDistance(e.target.value)}
            placeholder="Any"
            className="w-full rounded-[12px] bg-white px-3 py-2.5 text-[14px] outline-none ring-1 ring-[#E5E7EB]"
          />
        </label>
        <label className="w-full space-y-1.5 sm:w-44">
          <span className="transpo-label text-[13px]">Condition</span>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value as ListingCondition | "")}
            className="w-full rounded-[12px] bg-white px-3 py-2.5 text-[14px] outline-none ring-1 ring-[#E5E7EB]"
          >
            <option value="">Any</option>
            {(Object.keys(LISTING_CONDITION_LABELS) as ListingCondition[]).map((c) => (
              <option key={c} value={c}>
                {LISTING_CONDITION_LABELS[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 pb-2.5 text-[13px] font-medium text-[#334155]">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="h-4 w-4 rounded border-[#CBD5E1]"
          />
          Verified only
        </label>
        <div className="flex flex-wrap gap-2 pb-0.5">
          {showCreate ? (
            <button type="button" className="transpo-btn-primary" onClick={() => setDrawerOpen(true)}>
              Create listing
            </button>
          ) : null}
          <Link
            href="/exchange/compare"
            className="transpo-btn-secondary"
            title={compareCount ? `${compareCount} selected` : "Select listings to compare"}
          >
            Compare{compareCount ? ` (${compareCount})` : ""}
          </Link>
        </div>
      </div>

      {listings.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title={emptyTitle ?? "No listings match"}
          description={
            emptyDescription ??
            "Try widening price, distance, or verification filters — or create a listing."
          }
          actionLabel={showCreate ? "Create listing" : undefined}
          onAction={showCreate ? () => setDrawerOpen(true) : undefined}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              seller={sellersById[listing.sellerId]}
              favorite={isFavorite(listing.id)}
              compared={listCompareIds().includes(listing.id)}
              onToggleFavorite={(id) => {
                toggleFavorite(id);
                setFavTick((n) => n + 1);
              }}
              onToggleCompare={(id) => {
                toggleCompare(id);
                setCompareTick((n) => n + 1);
              }}
            />
          ))}
        </div>
      )}

      <CreateListingDrawer
        open={drawerOpen}
        defaultCategory={category}
        onClose={() => setDrawerOpen(false)}
        onCreated={(id) => {
          startTransition(() => {
            setFavTick((n) => n + 1);
            router.push(`/exchange/listings/${id}`);
          });
        }}
      />
    </div>
  );
}
