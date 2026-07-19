"use client";

import { useState } from "react";
import Link from "next/link";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import { formatMoney } from "@/lib/exchange/board";
import { boostListing, listAds } from "@/lib/exchange/store";
import type { AdCampaign } from "@/lib/exchange/types";

const PLACEMENT_LABEL: Record<AdCampaign["placement"], string> = {
  homepage: "Homepage",
  search: "Search",
  category: "Category",
  video: "Video",
  sponsored_business: "Sponsored business",
};

export default function AdsClient({
  initial,
  boostableListingId = "lst-cascadia-21",
}: {
  initial: AdCampaign[];
  boostableListingId?: string;
}) {
  const [ads, setAds] = useState(initial);
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-[16px] bg-[#F8F9FB] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="transpo-section-title text-[17px]">Ad slots (demo)</h2>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            Featured listings, sponsored businesses, homepage and search promotions. Spend is
            simulated.
          </p>
        </div>
        <button
          type="button"
          className="transpo-btn-primary"
          onClick={() => {
            const result = boostListing(boostableListingId);
            if ("error" in result) setNotice(result.error);
            else {
              setAds(listAds());
              setNotice("Boost campaign created in demo inventory.");
            }
          }}
        >
          Boost a listing
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {ads.map((ad) => (
          <article key={ad.id} className="rounded-[16px] bg-[#F8F9FB] p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[15px] font-semibold">{ad.name}</p>
                <p className="mt-1 text-[13px] text-[#6B7280]">
                  {PLACEMENT_LABEL[ad.placement]} · {ad.status.replace("_", " ")}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  ad.status === "live_demo"
                    ? `${TRANSPO_COLORS.success.bg} ${TRANSPO_COLORS.success.text}`
                    : `${TRANSPO_COLORS.disabled.bg} ${TRANSPO_COLORS.disabled.text}`
                }`}
              >
                {ad.status}
              </span>
            </div>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-[13px]">
              <div>
                <dt className="text-[#6B7280]">Impressions</dt>
                <dd className="font-semibold">{ad.impressions.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-[#6B7280]">Clicks</dt>
                <dd className="font-semibold">{ad.clicks.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-[#6B7280]">Spend (demo)</dt>
                <dd className="font-semibold">{formatMoney(ad.spendDemo)}</dd>
              </div>
            </dl>
            {ad.listingId ? (
              <Link
                href={`/exchange/listings/${ad.listingId}`}
                className="mt-3 inline-block text-[13px] font-medium text-[#2563EB]"
              >
                View listing
              </Link>
            ) : null}
          </article>
        ))}
      </div>

      {notice ? (
        <p className={`rounded-[12px] px-3 py-2 text-[13px] ${TRANSPO_COLORS.info.bg} ${TRANSPO_COLORS.info.text}`}>
          {notice}
        </p>
      ) : null}
    </div>
  );
}
