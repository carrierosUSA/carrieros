"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import TruckCard from "@/components/fleet/trucks/TruckCard";
import TruckSearchBar from "@/components/fleet/trucks/TruckSearchBar";
import FadeIn from "@/components/ui/FadeIn";
import { filterTrucksByQuery } from "@/lib/fleet/truck-board";
import type { Driver, Load, Truck } from "@/lib/types";

type TruckDashboardClientProps = {
  trucks: Truck[];
  loads: Load[];
  drivers: Driver[];
};

export default function TruckDashboardClient({
  trucks,
  loads,
  drivers,
}: TruckDashboardClientProps) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => filterTrucksByQuery(trucks, query),
    [trucks, query],
  );

  const driverById = useMemo(() => {
    const map = new Map<string, Driver>();
    for (const driver of drivers) {
      map.set(driver.id, driver);
    }
    return map;
  }, [drivers]);

  return (
    <FadeIn className="mt-6 space-y-4">
      <TruckSearchBar
        value={query}
        onChange={setQuery}
        resultCount={filtered.length}
      />

      {filtered.length === 0 ? (
        <div className="rounded-[16px] bg-[#F8F9FB] px-6 py-8 text-center">
          <p className="text-[15px] font-semibold text-[#111827]">No trucks found</p>
          <p className="mt-2 text-[14px] text-[#6B7280]">
            Nothing matches this search. Clear filters or add a truck to get started.
          </p>
          <Link
            href="/fleet/trucks/new"
            className="transpo-btn-primary mt-4 inline-flex"
          >
            Add Truck
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((truck) => {
            const driver = truck.driverId
              ? driverById.get(truck.driverId)
              : undefined;
            return (
              <TruckCard
                key={truck.id}
                truck={truck}
                loads={loads}
                driverName={driver?.name}
                driverPhone={driver?.phone}
              />
            );
          })}
        </div>
      )}
    </FadeIn>
  );
}
