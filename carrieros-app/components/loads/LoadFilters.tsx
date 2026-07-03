"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { LoadStatus } from "@/lib/types";
import { LOAD_STATUS_LABELS } from "@/lib/types";

type LoadFiltersProps = {
  counts: Record<LoadStatus | "all", number>;
};

const filterOptions: Array<{ value: LoadStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "pending", label: LOAD_STATUS_LABELS.pending },
  { value: "dispatched", label: LOAD_STATUS_LABELS.dispatched },
  { value: "picked_up", label: LOAD_STATUS_LABELS.picked_up },
  { value: "in_transit", label: LOAD_STATUS_LABELS.in_transit },
  { value: "delivered", label: LOAD_STATUS_LABELS.delivered },
  { value: "invoiced", label: LOAD_STATUS_LABELS.invoiced },
];

export default function LoadFilters({ counts }: LoadFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeStatus = (searchParams.get("status") as LoadStatus | "all" | null) ?? "all";
  const searchValue = searchParams.get("q") ?? "";

  function updateParams(nextStatus: LoadStatus | "all", nextSearch: string) {
    const params = new URLSearchParams();

    if (nextStatus !== "all") {
      params.set("status", nextStatus);
    }

    if (nextSearch.trim()) {
      params.set("q", nextSearch.trim());
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => {
          const isActive = activeStatus === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => updateParams(option.value, searchValue)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "border-blue-500 bg-blue-600 text-white"
                  : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800"
              }`}
            >
              {option.label}
              <span className="ml-2 text-xs opacity-80">{counts[option.value]}</span>
            </button>
          );
        })}
      </div>

      <input
        type="search"
        value={searchValue}
        onChange={(event) => updateParams(activeStatus, event.target.value)}
        placeholder="Search loads by reference, city, or state"
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-blue-500"
      />
    </div>
  );
}
