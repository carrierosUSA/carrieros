"use client";

import Link from "next/link";
import AlphExecutiveSummaryCard from "@/components/executive/AlphExecutiveSummary";
import ExecutiveActivityTimeline from "@/components/executive/ExecutiveActivityTimeline";
import ExecutiveKpiGrid from "@/components/executive/ExecutiveKpiGrid";
import ExecutiveRecommendations from "@/components/executive/ExecutiveRecommendations";
import FadeIn from "@/components/ui/FadeIn";
import {
  buildWorkspaceActivity,
  buildWorkspaceRecommendations,
} from "@/lib/alph/workspace";
import type { AlphExecutiveSummary } from "@/lib/executive/executive-alph";
import type { ExecutiveBoard } from "@/lib/executive/executive-board";
import type { ExecutiveTrendsByRange } from "@/lib/executive/executive-trends";

export type ExecutiveDashboardData = {
  board: ExecutiveBoard;
  summary: AlphExecutiveSummary;
  trendsByRange: ExecutiveTrendsByRange;
};

type ExecutiveDashboardClientProps = {
  data: ExecutiveDashboardData;
};

/** Daily Home: business health + today’s ops. Deeper charts live in Reports. */
export default function ExecutiveDashboardClient({
  data,
}: ExecutiveDashboardClientProps) {
  const { board, summary } = data;
  const activity = buildWorkspaceActivity();
  const recommendations = buildWorkspaceRecommendations(summary);

  const financial = board.sections.find((s) => s.id === "financial");
  const operations = board.sections.find((s) => s.id === "operations");
  const compliance = board.sections.find((s) => s.id === "compliance");

  const dailyKpis = [
    ...(financial?.kpis.filter((k) =>
      ["revenue-today", "open-invoices", "outstanding"].includes(k.id),
    ) ?? []),
    ...(operations?.kpis.filter((k) =>
      [
        "loads-today",
        "trucks-available",
        "drivers-available",
        "deliveries-today",
      ].includes(k.id),
    ) ?? []),
  ];

  const expirationKpis =
    compliance?.kpis.filter((k) =>
      [
        "compliance-insurance",
        "compliance-cdl",
        "compliance-medical",
        "compliance-permits",
      ].includes(k.id),
    ) ?? [];

  const dailySection = {
    id: "daily",
    title: "Business health",
    description: "Today’s revenue, loads, trucks, and drivers",
    kpis: dailyKpis,
  };

  const expirationSection =
    expirationKpis.length > 0
      ? {
          id: "expirations",
          title: "Upcoming expirations",
          description: "Insurance, licenses, medical cards, and permits",
          kpis: expirationKpis,
        }
      : null;

  return (
    <FadeIn className="space-y-5 sm:space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
            Home
          </p>
          <h1 className="mt-1 text-[22px] font-bold tracking-[-0.03em] text-[#111827] sm:text-[24px]">
            Business Health
          </h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            {board.companyName} · today&apos;s revenue, loads, trucks, and drivers
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/loads/new" className="transpo-btn-primary text-[14px]">
            Create Load
          </Link>
          <Link href="/notifications" className="transpo-btn-secondary text-[14px]">
            Notifications
          </Link>
          <Link
            href="/?workspace=home"
            className="transpo-btn-secondary text-[14px]"
          >
            Ask Alph
          </Link>
        </div>
      </header>

      <AlphExecutiveSummaryCard summary={summary} />

      {dailySection.kpis.length > 0 ? (
        <ExecutiveKpiGrid sections={[dailySection]} />
      ) : null}

      {expirationSection ? (
        <ExecutiveKpiGrid sections={[expirationSection]} />
      ) : null}

      <section className="rounded-[16px] bg-[#F5F7FA] px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold text-[#111827]">
              Alerts, tasks &amp; activity
            </h2>
            <p className="mt-0.5 text-[13px] text-[#6B7280]">
              What needs attention today — Alph suggests, you decide.
            </p>
          </div>
          <Link
            href="/analytics"
            className="text-[13px] font-semibold text-[#2563EB]"
          >
            Deeper reports →
          </Link>
        </div>
      </section>

      <ExecutiveActivityTimeline activity={activity} />
      <ExecutiveRecommendations recommendations={recommendations} />
    </FadeIn>
  );
}
