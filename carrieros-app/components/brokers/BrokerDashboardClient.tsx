"use client";

import Link from "next/link";
import BrokerAlphAlertsStrip from "@/components/brokers/BrokerAlphAlertsStrip";
import BrokerCard from "@/components/brokers/BrokerCard";
import BrokerDashboardStats from "@/components/brokers/BrokerDashboardStats";
import BrokerSearchBar from "@/components/brokers/BrokerSearchBar";
import FadeIn from "@/components/ui/FadeIn";
import {
  buildBrokerDashboardStats,
  filterBrokersByQuery,
} from "@/lib/brokers/broker-board";
import type { BrokerAlphAlert } from "@/lib/brokers/broker-alph-alerts";
import type { Broker } from "@/lib/types";
import { useMemo, useState } from "react";

type BrokerDashboardClientProps = {
  brokers: Broker[];
  alphInsights: BrokerAlphAlert[];
};

export default function BrokerDashboardClient({
  brokers,
  alphInsights,
}: BrokerDashboardClientProps) {
  const [query, setQuery] = useState("");
  const stats = useMemo(() => buildBrokerDashboardStats(brokers), [brokers]);
  const filtered = useMemo(
    () => filterBrokersByQuery(brokers, query),
    [brokers, query],
  );

  return (
    <FadeIn className="space-y-6">
      <BrokerDashboardStats stats={stats} />

      {alphInsights.length > 0 ? (
        <BrokerAlphAlertsStrip
          alerts={alphInsights}
          title="Alph broker insights"
          subtitle="Recommended partners and credit signals across your book."
        />
      ) : null}

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[15px] font-semibold text-slate-900">All brokers</p>
          <Link
            href="/loads/new"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-[#2563EB] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            + Create Load
          </Link>
        </div>
        <BrokerSearchBar
          value={query}
          onChange={setQuery}
          resultCount={filtered.length}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[16px] bg-[#F8FAFC] px-6 py-12 text-center ring-1 ring-[#EAEAEA]">
          <p className="text-[15px] font-semibold text-slate-900">
            No brokers found
          </p>
          <p className="mt-1 text-[14px] text-slate-500">
            Try a different search or add a new broker relationship.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((broker) => (
            <BrokerCard key={broker.id} broker={broker} />
          ))}
        </div>
      )}
    </FadeIn>
  );
}
