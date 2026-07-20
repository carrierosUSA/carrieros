"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { X } from "lucide-react";
import FleetInventoryList from "@/components/fleet/FleetInventoryList";
import FleetOverviewStrip from "@/components/fleet/FleetOverviewStrip";
import EmptyState from "@/components/ui/EmptyState";
import FadeIn from "@/components/ui/FadeIn";
import {
  buildFleetInventoryRows,
  buildFleetOverviewCards,
  filterMatchesRow,
  getFilterLabel,
  searchFleetRows,
  sortRowsForFilter,
  type FleetFilter,
} from "@/lib/fleet/fleet-dashboard";
import type {
  Driver,
  Load,
  MaintenanceRecord,
  Trailer,
  Truck,
} from "@/lib/types";

type FleetDashboardClientProps = {
  trucks: Truck[];
  trailers: Trailer[];
  loads: Load[];
  drivers: Driver[];
  maintenance: MaintenanceRecord[];
  /** Deep-link from Home truck status chips */
  initialFilter?: FleetFilter;
  /** When set with a status filter, also require this equipment group (e.g. trucks). */
  equipmentConstraint?: string;
};

export default function FleetDashboardClient({
  trucks,
  trailers,
  loads,
  drivers,
  maintenance,
  initialFilter = null,
  equipmentConstraint,
}: FleetDashboardClientProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FleetFilter>(initialFilter);

  const rows = useMemo(
    () =>
      buildFleetInventoryRows({
        trucks,
        trailers,
        loads,
        drivers,
        maintenance,
      }),
    [trucks, trailers, loads, drivers, maintenance],
  );

  const overviewCards = useMemo(() => buildFleetOverviewCards(rows), [rows]);
  const filterLabel = getFilterLabel(filter, overviewCards);
  const shopFilterActive =
    filter?.kind === "status" && filter.id === "in_shop";

  const visibleRows = useMemo(() => {
    const filtered = rows.filter((row) => {
      if (!filterMatchesRow(row, filter)) return false;
      if (!equipmentConstraint) return true;
      if (equipmentConstraint === "trucks") return row.assetKind === "truck";
      return row.equipmentGroupId === equipmentConstraint;
    });
    const searched = searchFleetRows(filtered, query);
    return sortRowsForFilter(searched, filter);
  }, [rows, filter, query, equipmentConstraint]);

  const clearFilters = () => {
    setFilter(null);
    setQuery("");
  };

  return (
    <FadeIn className="space-y-6">
      <FleetOverviewStrip
        cards={overviewCards}
        activeFilter={filter}
        onSelect={setFilter}
      />

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-[#111827]">
              Fleet inventory
            </h2>
            <p className="mt-0.5 text-[13px] text-[#6B7280]">
              Trucks and trailers in one place — status, assignments, shop, and compliance.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/fleet/trucks/new"
              className="inline-flex h-9 items-center justify-center rounded-full bg-[#2563EB] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
            >
              Add Truck
            </Link>
            <Link
              href="/fleet/trailers/new"
              className="inline-flex h-9 items-center justify-center rounded-full bg-[#F8FAFC] px-4 text-[13px] font-semibold text-[#334155] ring-1 ring-[#EAEAEA] transition hover:bg-white"
            >
              Add Trailer
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative min-w-0 flex-1">
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden
            >
              ⌕
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search unit, VIN, plate, driver, load, type, location, status…"
              className="h-10 w-full rounded-xl bg-[#F8FAFC] pl-9 pr-4 text-[14px] text-slate-900 ring-1 ring-[#EAEAEA] transition placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#93C5FD]"
            />
          </div>
          <p className="shrink-0 text-[13px] font-medium text-slate-500">
            {visibleRows.length} unit{visibleRows.length === 1 ? "" : "s"}
          </p>
        </div>

        {filterLabel ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-3 py-1.5 text-[13px] font-semibold text-[#2563EB]">
              {filterLabel}
              <button
                type="button"
                aria-label="Clear filter"
                onClick={() => setFilter(null)}
                className="grid h-5 w-5 place-items-center rounded-full text-[#2563EB] transition hover:bg-white"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </span>
            <button
              type="button"
              onClick={() => setFilter(null)}
              className="text-[13px] font-medium text-[#6B7280] transition hover:text-[#111827]"
            >
              Clear filter
            </button>
            {shopFilterActive ? (
              <p className="w-full text-[13px] text-[#9A3412] sm:w-auto">
                Shop queue — maintenance status highlighted; use row actions to add work.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {visibleRows.length === 0 ? (
        <EmptyState
          title="No equipment matches"
          description="Try a different search or clear the active filter to see the full fleet."
          actionLabel={filter || query ? "Clear filters" : "Add Truck"}
          actionHref={filter || query ? undefined : "/fleet/trucks/new"}
          onAction={filter || query ? clearFilters : undefined}
        />
      ) : (
        <FleetInventoryList
          rows={visibleRows}
          emphasizeMaintenance={shopFilterActive}
        />
      )}
    </FadeIn>
  );
}
