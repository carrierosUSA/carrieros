"use client";

import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import DriverCard from "@/components/drivers/DriverCard";
import DriverSearchBar from "@/components/drivers/DriverSearchBar";
import EmptyState from "@/components/ui/EmptyState";
import FadeIn from "@/components/ui/FadeIn";
import { filterDriversByQuery } from "@/lib/drivers/driver-board";
import type { Driver, Load } from "@/lib/types";

type DriverDashboardClientProps = {
  drivers: Driver[];
  loads: Load[];
};

export default function DriverDashboardClient({
  drivers,
  loads,
}: DriverDashboardClientProps) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => filterDriversByQuery(drivers, query),
    [drivers, query],
  );

  return (
    <FadeIn className="space-y-4">
      <DriverSearchBar
        value={query}
        onChange={setQuery}
        resultCount={filtered.length}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={query ? "No drivers match" : "No drivers yet"}
          description={
            query
              ? "Try a different search, or clear the filter to see your full roster."
              : "Add your first driver to start assigning loads and tracking compliance."
          }
          actionLabel="Add Driver"
          actionHref="/drivers/hiring/new"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((driver) => (
            <DriverCard key={driver.id} driver={driver} loads={loads} />
          ))}
        </div>
      )}
    </FadeIn>
  );
}
