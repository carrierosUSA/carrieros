"use client";

import { useState } from "react";
import Link from "next/link";
import AiPolicyNotice from "@/components/ai-safety/AiPolicyNotice";
import ListingCard from "@/components/exchange/ListingCard";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import { getSeller, searchForAi } from "@/lib/exchange/store";
import type { ExchangeListing } from "@/lib/exchange/types";
import { Sparkles } from "lucide-react";

const CHIPS = [
  "Best reefer under $45k",
  "Used Cascadias within 300 miles",
  "Compare three fuel cards",
  "OEM turbochargers",
  "Emergency tires nearby",
  "Recommend insurance",
  "Compare maintenance providers",
];

export default function AiShoppingClient({
  initialQuery,
  initialResults,
}: {
  initialQuery?: string;
  initialResults?: ExchangeListing[];
}) {
  const [query, setQuery] = useState(initialQuery ?? CHIPS[0]);
  const [results, setResults] = useState<ExchangeListing[]>(
    initialResults ?? searchForAi(CHIPS[0]),
  );

  function run(q: string) {
    setQuery(q);
    setResults(searchForAi(q));
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[16px] bg-gradient-to-br from-[#EFF6FF] to-[#F8F9FB] p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#2563EB]">
            <Sparkles className="h-5 w-5" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="transpo-section-title text-[17px]">Alph purchasing assistant</h2>
            <p className="mt-1 text-[14px] text-[#6B7280]">
              Natural-language shopping across Transpo Exchange™ inventory. Demo heuristics — not a
              live model call. Purchases always need your confirmation.
            </p>
            <div className="mt-2">
              <AiPolicyNotice variant="assist" />
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") run(query);
                }}
                className="min-w-0 flex-1 rounded-[12px] bg-white px-3 py-2.5 text-[14px] ring-1 ring-[#E5E7EB]"
                placeholder="Ask Alph what to buy…"
              />
              <button type="button" className="transpo-btn-primary" onClick={() => run(query)}>
                Shop
              </button>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => run(chip)}
              className={`rounded-full px-3 py-1.5 text-[13px] font-medium ${
                query === chip
                  ? `${TRANSPO_COLORS.info.bg} ${TRANSPO_COLORS.info.text}`
                  : "bg-white text-[#334155] shadow-[inset_0_0_0_1px_#E5E7EB]"
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-between">
        <p className="text-[14px] text-[#6B7280]">
          {results.length} result{results.length === 1 ? "" : "s"} for “{query}”
        </p>
        <Link href="/exchange/compare" className="text-[13px] font-medium text-[#2563EB]">
          Open compare
        </Link>
      </div>

      {results.length === 0 ? (
        <p className="rounded-[16px] bg-[#F8F9FB] p-6 text-[14px] text-[#6B7280]">
          No matches. Try another chip or browse Equipment.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              seller={getSeller(listing.sellerId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
