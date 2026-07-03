"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { DriverStatus } from "@/lib/types";
import { DRIVER_STATUS_LABELS, DRIVER_STATUSES } from "@/lib/types";

type DriverFiltersProps = {
  counts: Record<DriverStatus | "all", number>;
};

const filterOptions: Array<{ value: DriverStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  ...DRIVER_STATUSES.map((status) => ({
    value: status,
    label: DRIVER_STATUS_LABELS[status],
  })),
];

export default function DriverFilters({ counts }: DriverFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeStatus =
    (searchParams.get("status") as DriverStatus | "all" | null) ?? "all";
  const searchValue = searchParams.get("q") ?? "";

  function updateParams(nextStatus: DriverStatus | "all", nextSearch: string) {
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
        {filterOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => updateParams(option.value, searchValue)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              activeStatus === option.value
                ? "border-blue-500 bg-blue-600 text-white"
                : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800"
            }`}
          >
            {option.label}
            <span className="ml-2 text-xs opacity-80">{counts[option.value]}</span>
          </button>
        ))}
      </div>

      <input
        type="search"
        value={searchValue}
        onChange={(event) => updateParams(activeStatus, event.target.value)}
        placeholder="Search drivers by name, email, role, or location"
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-blue-500"
      />
    </div>
  );
}
