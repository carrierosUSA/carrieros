"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import FadeIn from "@/components/ui/FadeIn";
import HomeAlphBar from "@/components/executive/HomeAlphBar";
import { openCommunicationUrl } from "@/lib/dispatch/communication";
import type { HomeCommandCenter, HomeStatTone } from "@/lib/executive/home-command-center";

export type ExecutiveDashboardData = {
  home: HomeCommandCenter;
  greeting: string;
};

type ExecutiveDashboardClientProps = {
  data: ExecutiveDashboardData;
};

function toneText(tone: HomeStatTone): string {
  switch (tone) {
    case "critical":
      return "text-[#DC2626]";
    case "warning":
      return "text-[#D97706]";
    case "success":
      return "text-[#059669]";
    case "info":
      return "text-[#2563EB]";
    default:
      return "text-[#111827]";
  }
}

function toneDot(tone: HomeStatTone): string {
  switch (tone) {
    case "critical":
      return "bg-[#DC2626]";
    case "warning":
      return "bg-[#D97706]";
    case "success":
      return "bg-[#059669]";
    case "info":
      return "bg-[#2563EB]";
    default:
      return "bg-[#94A3B8]";
  }
}

function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex min-h-0 flex-col rounded-[16px] border border-[#E8ECF1] bg-white ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-[#EEF1F5] px-4 py-3 sm:px-5">
        <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-[#111827]">
          {title}
        </h2>
        {action}
      </div>
      <div className="flex-1 px-4 py-3 sm:px-5 sm:py-4">{children}</div>
    </section>
  );
}

function StatRows({
  items,
}: {
  items: HomeCommandCenter["truckStatus"];
}) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={item.href}
            className="flex items-center justify-between gap-3 rounded-[10px] px-2.5 py-2 transition hover:bg-[#F5F7FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${toneDot(item.tone)}`}
                aria-hidden
              />
              <span className="truncate text-[14px] text-[#374151]">
                {item.label}
              </span>
            </span>
            <span
              className={`shrink-0 text-[16px] font-bold tabular-nums tracking-tight ${toneText(item.tone)}`}
            >
              {item.count}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Premium carrier-owner Home — one cohesive command composition. */
export default function ExecutiveDashboardClient({
  data,
}: ExecutiveDashboardClientProps) {
  const { home, greeting } = data;

  return (
    <FadeIn className="space-y-5 lg:space-y-6">
      {/* Header: greeting + single Alph bar */}
      <header className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[28px] font-bold tracking-[-0.035em] text-[#111827] sm:text-[32px] lg:text-[36px]">
              {greeting.replace(/\.$/, "")}
            </h1>
            <p className="mt-1 text-[14px] text-[#6B7280]">{home.dateLabel}</p>
          </div>
          <p className="text-[13px] font-medium text-[#94A3B8]">
            {home.companyName}
          </p>
        </div>
        <HomeAlphBar />
      </header>

      {/* Desktop: 3-column composition · Tablet: 2-col · Mobile: stack */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
        {/* Hero — Today's Report spans full width on mobile, 8 cols on desktop */}
        <section className="rounded-[16px] border border-[#E8ECF1] bg-[#F8FAFC] px-5 py-5 sm:px-6 sm:py-6 lg:col-span-8">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
            Today&apos;s Report
          </p>
          <p className="mt-3 max-w-3xl text-[17px] font-medium leading-7 tracking-[-0.015em] text-[#111827] sm:text-[18px] sm:leading-8">
            {home.todaysReport.summary}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={home.todaysReport.viewDetailsHref}
              className="inline-flex h-9 items-center rounded-full bg-[#2563EB] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
            >
              View details
            </Link>
            <Link
              href={home.todaysReport.askAlphHref}
              className="inline-flex h-9 items-center rounded-full bg-white px-4 text-[13px] font-semibold text-[#2563EB] ring-1 ring-[#BFDBFE] transition hover:bg-[#EFF6FF]"
            >
              Ask Alph
            </Link>
          </div>
        </section>

        {/* Right rail top: Needs Attention */}
        <Panel
          title="Needs Attention"
          className="lg:col-span-4"
          action={
            home.needsAttention.length > 0 ? (
              <span className="text-[12px] font-semibold text-[#DC2626]">
                {home.needsAttention.length}
              </span>
            ) : null
          }
        >
          {home.needsAttention.length === 0 ? (
            <p className="text-[14px] leading-6 text-[#6B7280]">
              Nothing urgent right now. Operations look clear.
            </p>
          ) : (
            <ul className="space-y-3">
              {home.needsAttention.slice(0, 5).map((item) => (
                <li
                  key={item.id}
                  className="border-b border-[#EEF1F5] pb-3 last:border-0 last:pb-0"
                >
                  <p
                    className={`text-[12px] font-semibold ${
                      item.tone === "critical"
                        ? "text-[#DC2626]"
                        : "text-[#D97706]"
                    }`}
                  >
                    {item.category}
                  </p>
                  <p className="mt-1 text-[14px] font-medium leading-5 text-[#111827]">
                    {item.whatHappened}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-5 text-[#6B7280]">
                    {item.whyItMatters}
                  </p>
                  <Link
                    href={item.actionHref}
                    className="mt-2 inline-flex text-[13px] font-semibold text-[#2563EB] transition hover:text-[#1D4ED8]"
                  >
                    {item.actionLabel} →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Three equal summary panels */}
        <Panel
          title="Truck Status"
          className="lg:col-span-4"
          action={
            <Link
              href="/fleet"
              className="text-[12px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
            >
              Fleet
            </Link>
          }
        >
          <StatRows items={home.truckStatus} />
        </Panel>

        <Panel
          title="Load Status"
          className="lg:col-span-4"
          action={
            <Link
              href="/loads"
              className="text-[12px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
            >
              Dispatch
            </Link>
          }
        >
          <StatRows items={home.loadStatus} />
        </Panel>

        <Panel
          title="Revenue"
          className="lg:col-span-4"
          action={
            <Link
              href="/finance"
              className="text-[12px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
            >
              Money
            </Link>
          }
        >
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                home.revenue.today,
                home.revenue.week,
                home.revenue.collected,
                home.revenue.outstanding,
              ] as const
            ).map((cell) => (
              <Link
                key={cell.label}
                href={cell.href}
                className="rounded-[12px] bg-[#F8FAFC] px-3 py-3 transition hover:bg-[#EFF6FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
              >
                <p className="text-[12px] font-medium text-[#6B7280]">
                  {cell.label}
                </p>
                <p className="mt-1.5 text-[18px] font-bold tabular-nums tracking-tight text-[#111827]">
                  {cell.value}
                </p>
              </Link>
            ))}
          </div>
          <p
            className={`mt-3 text-[13px] font-medium ${toneText(home.revenue.trendTone)}`}
          >
            {home.revenue.trendLabel}
          </p>
        </Panel>

        {/* Invoices table — 8 cols */}
        <Panel
          title="Invoices and Payments"
          className="lg:col-span-8"
          action={
            <Link
              href="/finance?tab=invoices"
              className="text-[12px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
            >
              All invoices
            </Link>
          }
        >
          {home.invoices.length === 0 ? (
            <p className="text-[14px] text-[#6B7280]">No open invoice work.</p>
          ) : (
            <div className="-mx-1 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="text-[12px] font-medium text-[#6B7280]">
                    <th className="pb-2 pr-3 font-medium">Invoice</th>
                    <th className="pb-2 pr-3 font-medium">Load</th>
                    <th className="pb-2 pr-3 font-medium">Broker</th>
                    <th className="pb-2 pr-3 font-medium">Amount</th>
                    <th className="pb-2 pr-3 font-medium">Status</th>
                    <th className="pb-2 pr-3 font-medium">Expected</th>
                    <th className="pb-2 pr-3 font-medium">Timing</th>
                    <th className="pb-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {home.invoices.slice(0, 8).map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-[#EEF1F5] text-[13px]"
                    >
                      <td className="py-2.5 pr-3 font-semibold text-[#111827]">
                        {row.invoiceNumber}
                      </td>
                      <td className="py-2.5 pr-3">
                        {row.loadId ? (
                          <Link
                            href={`/loads/${row.loadId}`}
                            className="font-medium text-[#2563EB] hover:underline"
                          >
                            {row.loadNumber}
                          </Link>
                        ) : (
                          <span className="text-[#374151]">{row.loadNumber}</span>
                        )}
                      </td>
                      <td className="max-w-[120px] truncate py-2.5 pr-3 text-[#374151]">
                        {row.brokerName}
                      </td>
                      <td className="py-2.5 pr-3 font-semibold tabular-nums text-[#111827]">
                        {row.amountLabel}
                      </td>
                      <td className={`py-2.5 pr-3 font-medium ${toneText(row.tone)}`}>
                        {row.status}
                      </td>
                      <td className="py-2.5 pr-3 text-[#6B7280]">
                        {row.paymentExpectedLabel}
                      </td>
                      <td className="py-2.5 pr-3 text-[#6B7280]">{row.daysLabel}</td>
                      <td className="py-2.5">
                        <Link
                          href={row.actionHref}
                          className="font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
                        >
                          {row.actionLabel}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {/* FMCSA News — 4 cols side panel */}
        <Panel
          title="FMCSA News"
          className="lg:col-span-4"
          action={
            <span className="text-[11px] font-medium text-[#94A3B8]">
              Demo
            </span>
          }
        >
          <p className="mb-3 text-[12px] leading-5 text-[#94A3B8]">
            {home.fmcsaDemoLabel}
          </p>
          <ul className="space-y-4">
            {home.fmcsaNews.map((item) => (
              <li
                key={item.id}
                className="border-b border-[#EEF1F5] pb-4 last:border-0 last:pb-0"
              >
                <p className="text-[14px] font-semibold leading-5 text-[#111827]">
                  {item.headline}
                </p>
                <p className="mt-1.5 text-[13px] leading-5 text-[#6B7280]">
                  {item.alphSummary}
                </p>
                <p className="mt-1.5 text-[12px] text-[#94A3B8]">
                  {item.dateLabel}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  <Link
                    href={item.readHref}
                    className="text-[13px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
                  >
                    Read summary
                  </Link>
                  <Link
                    href={item.affectMeHref}
                    className="text-[13px] font-semibold text-[#374151] hover:text-[#111827]"
                  >
                    Does this affect me?
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        {/* Drivers table — full width */}
        <Panel
          title="Drivers"
          className="lg:col-span-12"
          action={
            <Link
              href="/drivers"
              className="text-[12px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
            >
              All drivers
            </Link>
          }
        >
          {home.drivers.length === 0 ? (
            <p className="text-[14px] text-[#6B7280]">
              No drivers need attention today.
            </p>
          ) : (
            <div className="-mx-1 overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="text-[12px] font-medium text-[#6B7280]">
                    <th className="pb-2 pr-3 font-medium">Driver</th>
                    <th className="pb-2 pr-3 font-medium">Truck</th>
                    <th className="pb-2 pr-3 font-medium">Load</th>
                    <th className="pb-2 pr-3 font-medium">Location</th>
                    <th className="pb-2 pr-3 font-medium">Status</th>
                    <th className="pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {home.drivers.map((driver) => (
                    <tr
                      key={driver.id}
                      className="border-t border-[#EEF1F5] text-[13px]"
                    >
                      <td className="py-2.5 pr-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={driver.viewHref}
                            className="font-semibold text-[#111827] hover:text-[#2563EB]"
                          >
                            {driver.name}
                          </Link>
                          <span className="inline-flex gap-1">
                            {driver.callHref ? (
                              <button
                                type="button"
                                onClick={() =>
                                  openCommunicationUrl(driver.callHref!)
                                }
                                className="rounded-md px-1.5 py-0.5 text-[12px] font-semibold text-[#2563EB] hover:bg-[#EFF6FF]"
                              >
                                Call
                              </button>
                            ) : null}
                            {driver.messageHref ? (
                              <button
                                type="button"
                                onClick={() =>
                                  openCommunicationUrl(driver.messageHref!)
                                }
                                className="rounded-md px-1.5 py-0.5 text-[12px] font-semibold text-[#2563EB] hover:bg-[#EFF6FF]"
                              >
                                Message
                              </button>
                            ) : null}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 text-[#374151]">
                        {driver.truckLabel}
                      </td>
                      <td className="py-2.5 pr-3">
                        {driver.loadId ? (
                          <Link
                            href={`/loads/${driver.loadId}`}
                            className="font-medium text-[#2563EB] hover:underline"
                          >
                            {driver.loadLabel}
                          </Link>
                        ) : (
                          <span className="text-[#6B7280]">{driver.loadLabel}</span>
                        )}
                      </td>
                      <td className="max-w-[140px] truncate py-2.5 pr-3 text-[#6B7280]">
                        {driver.location}
                      </td>
                      <td
                        className={`py-2.5 pr-3 font-medium ${toneText(driver.statusTone)}`}
                      >
                        {driver.statusLabel}
                      </td>
                      <td className="py-2.5">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={driver.assignHref}
                            className="font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
                          >
                            Assign load
                          </Link>
                          <Link
                            href={driver.viewHref}
                            className="font-semibold text-[#374151] hover:text-[#111827]"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </FadeIn>
  );
}
