"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AiPolicyNotice from "@/components/ai-safety/AiPolicyNotice";
import EmptyState from "@/components/ui/EmptyState";
import {
  getMigrationSummary,
  subscribeMigrationStore,
} from "@/lib/migration/store";
import type { AlphMigrationSummary } from "@/lib/migration/types";

export default function MigrationSummaryClient({ summaryId }: { summaryId: string }) {
  const [summary, setSummary] = useState<AlphMigrationSummary | null>(null);

  useEffect(() => {
    const sync = () => setSummary(getMigrationSummary(summaryId) ?? null);
    sync();
    return subscribeMigrationStore(sync);
  }, [summaryId]);

  if (!summary) {
    return (
      <EmptyState
        title="Summary not found"
        description="Complete an import to generate a post-import Alph summary."
        actionLabel="Start migration"
        actionHref="/platform/migration/new"
      />
    );
  }

  const blocks: { title: string; body: string }[] = [
    { title: "Business", body: summary.business },
    { title: "Fleet", body: summary.fleet },
    { title: "Drivers", body: summary.drivers },
    { title: "Customers", body: summary.customers },
    { title: "Brokers", body: summary.brokers },
    { title: "Revenue trends", body: summary.revenueTrends },
    { title: "Utilization", body: summary.utilization },
  ];

  return (
    <div className="space-y-6">
      <AiPolicyNotice variant="assist" />
      <p className="rounded-[12px] bg-[#EFF6FF] px-4 py-3 text-[14px] text-[#1E3A8A]">
        Decision support only — Alph does not certify books, compliance, or approve financial
        records as correct.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {blocks.map((b) => (
          <article key={b.title} className="rounded-[16px] bg-[#F8F9FB] p-4">
            <h2 className="text-[14px] font-semibold text-[#111827]">{b.title}</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-[#334155]">{b.body}</p>
          </article>
        ))}
      </div>

      <section className="grid gap-3 md:grid-cols-2">
        <div className="rounded-[16px] bg-[#F8F9FB] p-4">
          <h2 className="text-[14px] font-semibold text-[#111827]">Top customers</h2>
          <ul className="mt-2 space-y-1">
            {summary.topCustomers.map((c) => (
              <li key={c} className="text-[14px] text-[#334155]">
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[16px] bg-[#F8F9FB] p-4">
          <h2 className="text-[14px] font-semibold text-[#111827]">Top brokers</h2>
          <ul className="mt-2 space-y-1">
            {summary.topBrokers.map((c) => (
              <li key={c} className="text-[14px] text-[#334155]">
                {c}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[16px] bg-[#F8F9FB] p-4">
          <h2 className="text-[14px] font-semibold text-[#111827]">Missing info</h2>
          <ul className="mt-2 space-y-1">
            {summary.missingInfo.map((m) => (
              <li key={m} className="text-[13px] text-[#334155]">
                {m}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[16px] bg-[#F8F9FB] p-4">
          <h2 className="text-[14px] font-semibold text-[#111827]">Data issues</h2>
          <ul className="mt-2 space-y-1">
            {summary.dataIssues.map((m) => (
              <li key={m} className="text-[13px] text-[#334155]">
                {m}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[16px] bg-[#F8F9FB] p-4">
          <h2 className="text-[14px] font-semibold text-[#111827]">Suggested improvements</h2>
          <ul className="mt-2 space-y-1">
            {summary.suggestedImprovements.map((m) => (
              <li key={m} className="text-[13px] text-[#334155]">
                {m}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Link href={`/platform/migration/${summary.runId}`} className="transpo-btn-secondary">
          Import details
        </Link>
        <Link href="/drivers" className="transpo-btn-secondary">
          Review Drivers
        </Link>
        <Link href="/fleet" className="transpo-btn-secondary">
          Review Fleet
        </Link>
        <Link href="/platform/migration" className="transpo-btn-primary">
          Migration Center
        </Link>
      </div>
    </div>
  );
}
