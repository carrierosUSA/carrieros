"use client";

import { useState } from "react";
import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";
import VerifiedBadge from "@/components/exchange/VerifiedBadge";
import { formatMoney } from "@/lib/exchange/board";
import {
  clearCompare,
  getSeller,
  listCompareListings,
  toggleCompare,
} from "@/lib/exchange/store";
import type { ExchangeListing } from "@/lib/exchange/types";
import { Scale } from "lucide-react";

export default function CompareClient({
  initial,
}: {
  initial: ExchangeListing[];
}) {
  const [listings, setListings] = useState(initial);

  function refresh() {
    setListings(listCompareListings());
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        icon={Scale}
        title="Nothing to compare yet"
        description="Multi-select listings from any catalog with the compare control, then return here."
        actionLabel="Browse equipment"
        actionHref="/exchange/equipment"
      />
    );
  }

  const rows: { label: string; value: (l: ExchangeListing) => string }[] = [
    {
      label: "Price",
      value: (l) => formatMoney(l.price, l.priceLabel),
    },
    {
      label: "Warranty",
      value: (l) => (l.warrantyMonths ? `${l.warrantyMonths} months` : "—"),
    },
    {
      label: "Seller rating",
      value: (l) => {
        const s = getSeller(l.sellerId);
        return s ? `${s.rating.toFixed(1)} (${s.reviewCount})` : "—";
      },
    },
    {
      label: "Distance",
      value: (l) => `${l.distanceMiles} mi`,
    },
    {
      label: "Shipping",
      value: (l) =>
        l.shippingAvailable
          ? l.shippingEstimate != null
            ? formatMoney(l.shippingEstimate)
            : "Available"
          : "Local / N/A",
    },
    {
      label: "Availability",
      value: (l) => l.availability.replaceAll("_", " "),
    },
    {
      label: "Delivery",
      value: (l) => (l.deliveryDays != null ? `~${l.deliveryDays} days` : "—"),
    },
    {
      label: "Verified",
      value: (l) => (getSeller(l.sellerId)?.verified ? "Yes" : "No"),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="transpo-btn-secondary"
          onClick={() => {
            clearCompare();
            refresh();
          }}
        >
          Clear all
        </button>
        <Link href="/exchange/ai" className="transpo-btn-secondary">
          Ask Alph
        </Link>
      </div>

      <div className="overflow-x-auto rounded-[16px] bg-[#F8F9FB] p-4">
        <table className="w-full min-w-[640px] border-separate border-spacing-y-2 text-left">
          <thead>
            <tr>
              <th className="w-36 px-2 text-[12px] font-medium text-[#6B7280]">Attribute</th>
              {listings.map((l) => (
                <th key={l.id} className="px-2 align-bottom">
                  <Link
                    href={`/exchange/listings/${l.id}`}
                    className="text-[14px] font-semibold text-[#111827] hover:text-[#2563EB]"
                  >
                    {l.title}
                  </Link>
                  <div className="mt-2">
                    {getSeller(l.sellerId) ? (
                      <VerifiedBadge seller={getSeller(l.sellerId)!} compact />
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="mt-2 text-[12px] font-medium text-[#6B7280] hover:text-[#DC2626]"
                    onClick={() => {
                      toggleCompare(l.id);
                      refresh();
                    }}
                  >
                    Remove
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="px-2 py-2 text-[13px] font-medium text-[#6B7280]">{row.label}</td>
                {listings.map((l) => (
                  <td key={l.id} className="rounded-[8px] bg-white px-3 py-2 text-[14px]">
                    {row.value(l)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
