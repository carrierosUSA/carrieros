"use client";

import Link from "next/link";
import { Search, Sparkles } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import { getCurrentSession } from "@/lib/auth/session";
import {
  buildWorkspaceRecommendations,
  greetingForNow,
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

const QUICK_ACTIONS = [
  { label: "Create load", href: "/loads/new" },
  { label: "Assign driver", href: "/loads?assign=1" },
  { label: "Upload POD", href: "/documents?upload=pod" },
  { label: "Create invoice", href: "/finance?tab=invoices" },
  { label: "Ask Alph", href: "/?workspace=home" },
] as const;

/** Daily Home: simple command center over existing executive data. */
export default function ExecutiveDashboardClient({
  data,
}: ExecutiveDashboardClientProps) {
  const { board, summary } = data;
  const session = getCurrentSession();
  const greeting = greetingForNow(session.name);
  const recommendations = buildWorkspaceRecommendations(summary);

  const financial = board.sections.find((s) => s.id === "financial");
  const operations = board.sections.find((s) => s.id === "operations");
  const compliance = board.sections.find((s) => s.id === "compliance");

  const kpiById = (id: string) =>
    [...(financial?.kpis ?? []), ...(operations?.kpis ?? []), ...(compliance?.kpis ?? [])].find(
      (k) => k.id === id,
    );

  const todayCards = [
    {
      id: "loads",
      label: "Loads in progress",
      value: kpiById("loads-today")?.value ?? "—",
      href: "/loads?tab=in_transit",
    },
    {
      id: "drivers",
      label: "Drivers available",
      value: kpiById("drivers-available")?.value ?? "—",
      href: "/drivers",
    },
    {
      id: "equipment",
      label: "Equipment available",
      value: kpiById("trucks-available")?.value ?? "—",
      href: "/fleet/trucks",
    },
    {
      id: "documents",
      label: "Documents missing",
      value: summary.topPriorities.some((p) => /pod|document/i.test(p.text))
        ? "Action needed"
        : "None",
      href: "/documents",
    },
    {
      id: "cash",
      label: "Cash requiring attention",
      value: kpiById("outstanding")?.value ?? kpiById("open-invoices")?.value ?? "—",
      href: "/finance?tab=invoices",
    },
  ];

  const nextAction =
    recommendations[0] ??
    (summary.topPriorities[0]
      ? {
          id: summary.topPriorities[0].id,
          text: summary.topPriorities[0].text,
          reason: "Highest impact on today’s operations.",
          href: summary.topPriorities[0].href ?? "/loads",
          resolveHref: summary.topPriorities[0].href ?? "/loads",
          priority: "high" as const,
        }
      : null);

  const exceptions = [
    ...summary.risks.filter((p) => p.severity === "critical" || p.severity === "warning"),
    ...summary.topPriorities.filter((p) => p.severity === "critical"),
  ]
    .filter(
      (item, index, all) => all.findIndex((x) => x.id === item.id) === index,
    )
    .slice(0, 4);

  const alphPrompt = nextAction
    ? `Help me handle: ${nextAction.text}`
    : "What should I do next today?";

  return (
    <FadeIn className="space-y-6 sm:space-y-7">
      <header className="space-y-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
            Home
          </p>
          <h1 className="mt-1 text-[24px] font-bold tracking-[-0.03em] text-[#111827] sm:text-[28px]">
            {greeting}
          </h1>
          <p className="mt-1 text-[15px] text-[#6B7280]">
            What needs your attention today?
          </p>
        </div>
        <Link
          href={`/?workspace=home&q=${encodeURIComponent(alphPrompt)}`}
          className="flex items-center gap-3 rounded-[14px] bg-[#F5F7FA] px-4 py-3.5 transition hover:bg-[#EFF6FF]"
        >
          <Sparkles className="h-5 w-5 shrink-0 text-[#2563EB]" strokeWidth={1.9} />
          <span className="min-w-0 flex-1 truncate text-[15px] text-[#6B7280]">
            Ask Alph anything — assign a driver, find a load, create an invoice…
          </span>
          <Search className="h-4 w-4 shrink-0 text-[#94A3B8]" strokeWidth={1.9} />
        </Link>
      </header>

      {nextAction ? (
        <section className="rounded-[16px] bg-[#F8F9FB] px-5 py-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
            Next best action
          </p>
          <h2 className="mt-2 text-[20px] font-bold tracking-[-0.02em] text-[#111827]">
            {nextAction.text}
          </h2>
          <p className="mt-1.5 max-w-2xl text-[14px] leading-6 text-[#6B7280]">
            {nextAction.reason}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={nextAction.resolveHref ?? nextAction.href}
              className="inline-flex rounded-full bg-[#2563EB] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
            >
              Take action
            </Link>
            <Link
              href={`/?workspace=home&q=${encodeURIComponent(`Handle this for me: ${nextAction.text}`)}`}
              className="inline-flex rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[#2563EB] shadow-[inset_0_0_0_1px_#BFDBFE]"
            >
              Ask Alph to handle this
            </Link>
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-3">
          <h2 className="text-[16px] font-semibold text-[#111827]">
            Today&apos;s Operations
          </h2>
          <p className="mt-0.5 text-[13px] text-[#6B7280]">
            {board.companyName} · a quick read on the day
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {todayCards.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className="rounded-[14px] bg-[#F8F9FB] px-4 py-4 transition hover:bg-[#EFF6FF]"
            >
              <p className="text-[12px] font-medium text-[#6B7280]">{card.label}</p>
              <p className="mt-2 text-[22px] font-bold tracking-tight text-[#111827]">
                {card.value}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-[16px] font-semibold text-[#111827]">
            Exceptions
          </h2>
          <p className="mt-0.5 text-[13px] text-[#6B7280]">
            Urgent or blocked items only — Alph suggests, you decide.
          </p>
        </div>
        {exceptions.length === 0 ? (
          <div className="rounded-[14px] bg-[#F8F9FB] px-4 py-5 text-[14px] text-[#6B7280]">
            Nothing urgent is blocked right now.
          </div>
        ) : (
          <div className="space-y-2">
            {exceptions.map((item) => {
              const urgent = item.severity === "critical";
              return (
                <div
                  key={item.id}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-[14px] px-4 py-3 ${
                    urgent ? "bg-[#FEF2F2]" : "bg-[#F8F9FB]"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-[#111827]">
                      {item.text}
                    </p>
                    <p className="mt-0.5 text-[12px] text-[#6B7280]">
                      {urgent
                        ? "Blocked or high risk — decide before the next move."
                        : "At risk — clear today to avoid delay."}
                    </p>
                  </div>
                  <Link
                    href={item.href ?? "/notifications"}
                    className="inline-flex shrink-0 rounded-full bg-[#2563EB] px-3 py-1.5 text-[12px] font-semibold text-white"
                  >
                    Open
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-[16px] font-semibold text-[#111827]">
            Recommended Actions
          </h2>
          <p className="mt-0.5 text-[13px] text-[#6B7280]">
            Clear next moves when you have a spare minute.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {recommendations.slice(0, 4).map((rec, index) => (
            <div
              key={rec.id}
              className="flex flex-col justify-between rounded-[14px] bg-[#F8F9FB] px-4 py-4"
            >
              <div>
                <p className="text-[14px] font-semibold text-[#111827]">{rec.text}</p>
                <p className="mt-1 text-[12px] text-[#6B7280]">{rec.reason}</p>
              </div>
              <Link
                href={rec.resolveHref ?? rec.href}
                className={`mt-3 inline-flex w-fit rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                  index === 0
                    ? "bg-[#2563EB] text-white"
                    : "bg-white text-[#2563EB] shadow-[inset_0_0_0_1px_#BFDBFE]"
                }`}
              >
                {index === 0 ? "Do this next" : "Open"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[16px] font-semibold text-[#111827]">
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action, index) => (
            <Link
              key={action.label}
              href={action.href}
              className={`inline-flex rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                index === 0
                  ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                  : "bg-[#F5F7FA] text-[#334155] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
              }`}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </section>
    </FadeIn>
  );
}
