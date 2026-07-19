"use client";

import { useMemo, useState } from "react";
import TrailerCard from "@/components/fleet/trailers/TrailerCard";
import TrailerSearchBar from "@/components/fleet/trailers/TrailerSearchBar";
import FadeIn from "@/components/ui/FadeIn";
import { filterTrailersByQuery } from "@/lib/fleet/trailer-board";
import type { Load, Trailer, Truck } from "@/lib/types";

type TrailerDashboardClientProps = {
  trailers: Trailer[];
  loads: Load[];
  trucks: Truck[];
};

export default function TrailerDashboardClient({
  trailers,
  loads,
  trucks,
}: TrailerDashboardClientProps) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => filterTrailersByQuery(trailers, query),
    [trailers, query],
  );

  const truckLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const truck of trucks) {
      map.set(truck.id, `Unit ${truck.unitNumber}`);
    }
    return map;
  }, [trucks]);

  return (
    <FadeIn className="mt-6 space-y-4">
      <TrailerSearchBar
        value={query}
        onChange={setQuery}
        resultCount={filtered.length}
      />

      {filtered.length === 0 ? (
        <div className="rounded-[16px] bg-[#F8FAFC] px-6 py-12 text-center ring-1 ring-[#EAEAEA]">
          <p className="text-[15px] font-semibold text-slate-900">No trailers found</p>
          <p className="mt-1 text-[14px] text-slate-500">
            Try a different search or add a new trailer.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((trailer) => (
            <TrailerCard
              key={trailer.id}
              trailer={trailer}
              loads={loads}
              truckLabel={
                trailer.truckId
                  ? truckLabelById.get(trailer.truckId)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </FadeIn>
  );
}
