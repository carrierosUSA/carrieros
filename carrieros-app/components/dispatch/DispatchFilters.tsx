"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  buildLoadsHref,
  DISPATCH_TABS,
  type DispatchSearchParams,
  type DispatchTab,
  isDispatchTab,
} from "@/lib/dispatch/load-board";
import type { Broker } from "@/lib/types";
import type { Driver } from "@/lib/types";

type DispatchFiltersProps = {
  params: DispatchSearchParams;
  drivers: Pick<Driver, "id" | "name">[];
  brokers: Pick<Broker, "id" | "name">[];
};

const filterClassName =
  "h-10 shrink-0 rounded-[12px] bg-white px-3 text-[13px] font-medium text-[#334155] shadow-[inset_0_0_0_1px_#DDE2EA] outline-none transition hover:shadow-[inset_0_0_0_1px_#BFDBFE] focus:shadow-[0_0_0_2px_rgba(147,197,253,0.8)]";

export default function DispatchFilters({
  params,
  drivers,
  brokers,
}: DispatchFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const activeTab: DispatchTab = isDispatchTab(params.tab) ? params.tab : "all";

  function navigate(updates: Partial<DispatchSearchParams>) {
    startTransition(() => {
      router.push(
        buildLoadsHref(params, { ...updates, page: updates.page ?? "1" }),
      );
    });
  }

  return (
    <div className="shrink-0 bg-white px-4 py-3 lg:px-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[240px] flex-1">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]"
            aria-hidden
          >
            <path
              d="M9 16A7 7 0 1 0 9 2a7 7 0 0 0 0 14Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M14.5 14.5L18 18"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="search"
            defaultValue={params.q ?? ""}
            placeholder="Search load #, broker, city, driver…"
            aria-label="Search loads"
            className="h-10 w-full rounded-[12px] bg-[#F8F9FB] pl-10 pr-3 text-[14px] font-medium text-[#111827] outline-none transition placeholder:text-[#94A3B8] focus:bg-white focus:shadow-[0_0_0_2px_rgba(147,197,253,0.8)]"
            onKeyDown={(event) => {
              if (event.key !== "Enter") {
                return;
              }
              navigate({ q: event.currentTarget.value.trim() || undefined });
            }}
          />
        </div>

        <select
          value={activeTab}
          onChange={(event) => {
            const value = event.target.value as DispatchTab;
            navigate({ tab: value === "all" ? undefined : value });
          }}
          className={`${filterClassName} w-[132px]`}
          aria-label="Status filter"
        >
          <option value="all">All status</option>
          {DISPATCH_TABS.filter((tab) => tab.id !== "all").map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
            </option>
          ))}
        </select>

        <select
          value={params.broker ?? ""}
          onChange={(event) =>
            navigate({ broker: event.target.value || undefined })
          }
          className={`${filterClassName} max-w-[148px]`}
          aria-label="Broker filter"
        >
          <option value="">All brokers</option>
          {brokers.map((broker) => (
            <option key={broker.id} value={broker.id}>
              {broker.name}
            </option>
          ))}
        </select>

        <select
          value={params.driver ?? ""}
          onChange={(event) =>
            navigate({ driver: event.target.value || undefined })
          }
          className={`${filterClassName} max-w-[140px]`}
          aria-label="Driver filter"
        >
          <option value="">All drivers</option>
          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={params.from ?? ""}
          onChange={(event) =>
            navigate({ from: event.target.value || undefined })
          }
          className={`${filterClassName} w-[140px]`}
          aria-label="Date filter"
        />

        {isPending ? (
          <span className="inline-flex h-10 items-center px-2 text-[13px] font-semibold text-[#2563EB]">
            Updating…
          </span>
        ) : null}
      </div>
    </div>
  );
}
