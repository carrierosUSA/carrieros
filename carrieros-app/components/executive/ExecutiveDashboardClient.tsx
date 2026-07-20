"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  Bell,
  Building2,
  Clock,
  DollarSign,
  FileText,
  FileWarning,
  MessageSquare,
  MoreHorizontal,
  Package,
  Phone,
  Sparkles,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import HomeAlphBar from "@/components/executive/HomeAlphBar";
import { openCommunicationUrl } from "@/lib/dispatch/communication";
import type {
  HomeCommandCenter,
  HomeStatChip,
  HomeStatTone,
} from "@/lib/executive/home-command-center";

export type ExecutiveDashboardData = {
  home: HomeCommandCenter;
  greeting: string;
};

type ExecutiveDashboardClientProps = {
  data: ExecutiveDashboardData;
};

const CARD_SHADOW =
  "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.03)]";

const SEGMENT_COLORS: Record<HomeStatTone, string> = {
  critical: "#DC2626",
  warning: "#D97706",
  success: "#059669",
  info: "#2563EB",
  neutral: "#94A3B8",
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

function statusBadgeClass(tone: HomeStatTone): string {
  switch (tone) {
    case "critical":
      return "bg-[#FEF2F2] text-[#DC2626]";
    case "warning":
      return "bg-[#FFF7ED] text-[#C2410C]";
    case "success":
      return "bg-[#ECFDF5] text-[#047857]";
    case "info":
      return "bg-[#EFF6FF] text-[#2563EB]";
    default:
      return "bg-[#F3F4F6] text-[#4B5563]";
  }
}

function MoreMenuButton() {
  return (
    <button
      type="button"
      className="grid h-7 w-7 place-items-center rounded-lg text-[#94A3B8] transition hover:bg-[#F5F7FA] hover:text-[#64748B]"
      aria-label="More options"
    >
      <MoreHorizontal className="h-4 w-4" />
    </button>
  );
}

function Panel({
  title,
  icon,
  action,
  children,
  className = "",
  bodyClassName = "",
}: {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={`flex min-h-0 flex-col rounded-[12px] border border-[#E5E7EB] bg-white ${CARD_SHADOW} ${className}`}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-2">
        <h2 className="flex items-center gap-1.5 text-[14px] font-semibold tracking-[-0.01em] text-[#111827]">
          {icon}
          {title}
        </h2>
        {action ?? <MoreMenuButton />}
      </div>
      <div className={`flex-1 px-4 pb-3.5 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

/** Prefer category variety in the compact 3-item Attention list (existing items only). */
function pickAttentionItems(
  items: HomeCommandCenter["needsAttention"],
  limit = 3,
) {
  const picked: HomeCommandCenter["needsAttention"] = [];
  const seen = new Set<string>();
  for (const item of items) {
    if (picked.length >= limit) break;
    if (seen.has(item.category)) continue;
    seen.add(item.category);
    picked.push(item);
  }
  for (const item of items) {
    if (picked.length >= limit) break;
    if (picked.some((p) => p.id === item.id)) continue;
    picked.push(item);
  }
  return picked;
}

function StatusDonut({
  segments,
  centerValue,
  centerLabel,
}: {
  segments: { value: number; color: string }[];
  centerValue?: string | number;
  centerLabel?: string;
}) {
  const total = Math.max(
    segments.reduce((sum, seg) => sum + seg.value, 0),
    1,
  );
  let cursor = 0;
  const stops = segments
    .map((seg) => {
      const start = (cursor / total) * 100;
      cursor += seg.value;
      const end = (cursor / total) * 100;
      return `${seg.color} ${start}% ${end}%`;
    })
    .join(", ");
  const showCenter =
    centerValue !== undefined &&
    centerValue !== "" &&
    centerLabel !== undefined &&
    centerLabel !== "";

  return (
    <div
      className="relative h-[72px] w-[72px] shrink-0 rounded-full"
      style={{
        background:
          segments.every((s) => s.value === 0)
            ? "#E5E7EB"
            : `conic-gradient(${stops})`,
      }}
      aria-hidden
    >
      <div className="absolute inset-[22%] flex flex-col items-center justify-center rounded-full bg-white">
        {showCenter ? (
          <>
            <span className="text-[17px] font-bold tabular-nums leading-none text-[#111827]">
              {centerValue}
            </span>
            <span className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.05em] text-[#94A3B8]">
              {centerLabel}
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}

function RevenueSparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const width = 200;
  const height = 44;
  const pad = 3;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const step = (width - pad * 2) / (values.length - 1);
  const points = values
    .map((v, i) => {
      const x = pad + i * step;
      const y = height - pad - ((v - min) / range) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");
  const area = `${pad},${height - pad} ${points} ${width - pad},${height - pad}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-11 w-full"
      aria-hidden
    >
      <polygon points={area} fill="rgba(37,99,235,0.08)" />
      <polyline
        fill="none"
        stroke="#2563EB"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function chipById(items: HomeStatChip[], id: string): HomeStatChip | undefined {
  return items.find((item) => item.id === id);
}

function attentionIcon(
  category: HomeCommandCenter["needsAttention"][number]["category"],
) {
  if (category === "Missing POD") {
    return (
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#FEF2F2] text-[#DC2626]">
        <FileWarning className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
    );
  }
  if (category === "Late load") {
    return (
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#FFF7ED] text-[#D97706]">
        <Clock className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
    );
  }
  if (
    category === "Maintenance overdue" ||
    category === "Expiring driver document"
  ) {
    return (
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#FFF7ED] text-[#D97706]">
        <Wrench className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
    );
  }
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#FFFBEB] text-[#B45309]">
      <DollarSign className="h-3.5 w-3.5" strokeWidth={2} />
    </span>
  );
}

function driverInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function driverDisplayStatus(statusLabel: string): {
  label: string;
  tone: HomeStatTone;
} {
  if (statusLabel === "Needs load") {
    return { label: "Available", tone: "neutral" };
  }
  if (statusLabel === "On load") {
    return { label: "On load", tone: "success" };
  }
  if (statusLabel === "Delivering") {
    return { label: "Delivering", tone: "info" };
  }
  return { label: statusLabel, tone: "neutral" };
}

function DriverAvatar({
  name,
  photoUrl,
}: {
  name: string;
  photoUrl?: string;
}) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote demo avatars; avoid layout shift
      <img
        src={photoUrl}
        alt=""
        className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-[#E5E7EB]"
      />
    );
  }
  return (
    <span
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#EFF6FF] text-[11px] font-bold text-[#2563EB] ring-1 ring-[#E5E7EB]"
      aria-hidden
    >
      {driverInitials(name)}
    </span>
  );
}

/** Premium carrier-owner Home — compact reference composition. */
export default function ExecutiveDashboardClient({
  data,
}: ExecutiveDashboardClientProps) {
  const { home, greeting } = data;

  const greetingLabel = /[.!?]$/.test(greeting.trim())
    ? greeting.trim()
    : `${greeting.trim()}.`;

  const truckDriving = chipById(home.truckStatus, "driving");
  const truckAvailable = chipById(home.truckStatus, "available");
  const truckMaint = chipById(home.truckStatus, "maint");
  const truckTotal = chipById(home.truckStatus, "total");
  const truckLegend = [truckDriving, truckAvailable, truckMaint].filter(
    (item): item is HomeStatChip => Boolean(item),
  );

  const loadInTransit = chipById(home.loadStatus, "in-transit");
  const loadDelivering = chipById(home.loadStatus, "delivering");
  const loadMissingPod = chipById(home.loadStatus, "missing-pod");
  const loadLegend = [loadInTransit, loadDelivering, loadMissingPod].filter(
    (item): item is HomeStatChip => Boolean(item),
  );
  const loadActive =
    (loadInTransit?.count ?? 0) +
    (loadDelivering?.count ?? 0) +
    (chipById(home.loadStatus, "pickup")?.count ?? 0) +
    (chipById(home.loadStatus, "needs-load")?.count ?? 0) +
    (loadMissingPod?.count ?? 0);

  const attentionItems = pickAttentionItems(home.needsAttention, 3);
  const invoiceRows = home.invoices.slice(0, 3);
  const driverRows = home.drivers.slice(0, 3);

  return (
    <FadeIn className="space-y-2.5">
      {/* Header: greeting + date | single Alph bar */}
      <header className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="min-w-0 shrink-0">
          <h1 className="text-[28px] font-bold tracking-[-0.035em] text-[#111827] sm:text-[30px] lg:text-[32px]">
            {greetingLabel}
          </h1>
          <p className="mt-0.5 text-[13px] text-[#6B7280]">{home.dateLabel}</p>
        </div>
        <div className="w-full min-w-0 lg:max-w-[540px] xl:max-w-[600px]">
          <HomeAlphBar />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-12">
        {/* Row 1: Today's Report (2fr) + Needs Attention (1fr) */}
        <section
          className={`flex flex-col rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3 md:col-span-2 xl:col-span-8 ${CARD_SHADOW}`}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-[14px] font-semibold text-[#111827]">
              <Sparkles
                className="h-3.5 w-3.5 text-[#2563EB]"
                strokeWidth={2}
                aria-hidden
              />
              Today&apos;s Report
            </p>
            <MoreMenuButton />
          </div>
          <p className="mt-2 flex-1 text-[14px] font-medium leading-[1.4] tracking-[-0.01em] text-[#111827] sm:text-[15px]">
            {home.todaysReport.summary}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <Link
              href={home.todaysReport.viewDetailsHref}
              className="inline-flex h-8 items-center rounded-full bg-[#2563EB] px-3.5 text-[12px] font-semibold text-white shadow-[0_4px_12px_rgba(37,99,235,0.22)] transition hover:bg-[#1D4ED8]"
            >
              View today
            </Link>
            <Link
              href={home.todaysReport.askAlphHref}
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-3.5 text-[12px] font-semibold text-[#2563EB] ring-1 ring-[#BFDBFE] transition hover:bg-[#EFF6FF]"
            >
              <Sparkles className="h-3 w-3" strokeWidth={2} aria-hidden />
              Ask Alph
            </Link>
          </div>
        </section>

        <Panel
          title="Needs Attention"
          className="md:col-span-1 xl:col-span-4"
          icon={
            <Bell className="h-3.5 w-3.5 text-[#64748B]" strokeWidth={2} />
          }
          bodyClassName="pt-0"
        >
          {attentionItems.length === 0 ? (
            <p className="text-[13px] leading-5 text-[#6B7280]">
              Nothing urgent right now. Operations look clear.
            </p>
          ) : (
            <>
              <ul className="space-y-2.5">
                {attentionItems.map((item) => {
                  const refMatch = item.whatHappened.match(
                    /LD-\d+|INV-\d+|Unit\s+\d+/i,
                  );
                  const categoryLabel =
                    item.category === "Maintenance overdue"
                      ? "Maintenance due"
                      : item.category;
                  return (
                    <li key={item.id} className="flex items-start gap-2.5">
                      {attentionIcon(item.category)}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold leading-4 text-[#111827]">
                          {categoryLabel}
                          {refMatch ? ` — ${refMatch[0]}` : ""}
                        </p>
                        <Link
                          href={item.actionHref}
                          className={`mt-1 inline-flex text-[12px] font-semibold transition hover:opacity-80 ${
                            item.tone === "critical" &&
                            item.category === "Missing POD"
                              ? "text-[#DC2626]"
                              : "text-[#2563EB]"
                          }`}
                        >
                          {item.actionLabel} &gt;
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <Link
                href="/notifications"
                className="mt-3 inline-flex text-[12px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
              >
                View all
              </Link>
            </>
          )}
        </Panel>

        {/* Row 2: Truck · Load · Revenue — numbers in donut centers */}
        <Panel
          title="Truck Status"
          className="xl:col-span-4"
          icon={
            <Truck className="h-3.5 w-3.5 text-[#64748B]" strokeWidth={2} />
          }
          bodyClassName="pt-0"
        >
          <div className="flex items-center gap-4">
            <StatusDonut
              centerValue={truckTotal?.count ?? 0}
              centerLabel="Total"
              segments={truckLegend.map((item) => ({
                value: item.count,
                color: SEGMENT_COLORS[item.tone],
              }))}
            />
            <ul className="min-w-0 flex-1 space-y-2">
              {truckLegend.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 rounded-md px-0.5 py-0.5 transition hover:bg-[#F5F7FA]"
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: SEGMENT_COLORS[item.tone] }}
                      aria-hidden
                    />
                    <span className="truncate text-[13px] font-medium text-[#374151]">
                      <span className="font-bold tabular-nums text-[#111827]">
                        {item.count}
                      </span>{" "}
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        <Panel
          title="Load Status"
          className="xl:col-span-4"
          icon={
            <Package className="h-3.5 w-3.5 text-[#64748B]" strokeWidth={2} />
          }
          bodyClassName="pt-0"
        >
          <div className="flex items-center gap-4">
            <StatusDonut
              centerValue={loadActive}
              centerLabel="Active"
              segments={loadLegend.map((item) => ({
                value: item.count,
                color:
                  item.id === "missing-pod"
                    ? SEGMENT_COLORS.warning
                    : SEGMENT_COLORS[item.tone],
              }))}
            />
            <ul className="min-w-0 flex-1 space-y-2">
              {loadLegend.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 rounded-md px-0.5 py-0.5 transition hover:bg-[#F5F7FA]"
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          item.id === "missing-pod"
                            ? SEGMENT_COLORS.warning
                            : SEGMENT_COLORS[item.tone],
                      }}
                      aria-hidden
                    />
                    <span className="truncate text-[13px] font-medium text-[#374151]">
                      <span className="font-bold tabular-nums text-[#111827]">
                        {item.count}
                      </span>{" "}
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        <Panel
          title="Revenue"
          className="xl:col-span-4"
          icon={
            <DollarSign className="h-3.5 w-3.5 text-[#64748B]" strokeWidth={2} />
          }
          bodyClassName="pt-0"
        >
          <Link
            href={home.revenue.today.href}
            className="block rounded-[10px] transition hover:bg-[#F8FAFC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[28px] font-bold tabular-nums leading-none tracking-tight text-[#111827]">
                  {home.revenue.today.value}
                </p>
                <p className="mt-1 text-[12px] font-medium text-[#6B7280]">
                  Today
                </p>
              </div>
              <p
                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  home.revenue.trendTone === "critical"
                    ? "bg-[#FEF2F2] text-[#DC2626]"
                    : home.revenue.trendTone === "success"
                      ? "bg-[#ECFDF5] text-[#047857]"
                      : `bg-[#EFF6FF] ${toneText(home.revenue.trendTone)}`
                }`}
              >
                {home.revenue.dayTrendLabel}
              </p>
            </div>
            <div className="mt-2">
              <RevenueSparkline values={home.revenue.sparkline} />
            </div>
            <p className="mt-1.5 text-[13px] text-[#6B7280]">
              <span className="font-bold tabular-nums text-[#111827]">
                {home.revenue.week.value}
              </span>{" "}
              This week
            </p>
          </Link>
        </Panel>

        {/* Row 3: Invoices (2fr) + Drivers Today (1fr) */}
        <Panel
          title="Invoices & Payments"
          className="md:col-span-2 xl:col-span-8"
          icon={
            <FileText className="h-3.5 w-3.5 text-[#64748B]" strokeWidth={2} />
          }
          bodyClassName="pt-0"
        >
          {invoiceRows.length === 0 ? (
            <p className="text-[13px] text-[#6B7280]">No open invoice work.</p>
          ) : (
            <>
              <div className="-mx-1 overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left">
                  <thead>
                    <tr className="text-[11px] font-medium text-[#6B7280]">
                      <th className="pb-1.5 pr-2 font-medium">Invoice</th>
                      <th className="pb-1.5 pr-2 font-medium">Broker</th>
                      <th className="pb-1.5 pr-2 font-medium">Amount</th>
                      <th className="pb-1.5 pr-2 font-medium">Expected</th>
                      <th className="pb-1.5 pr-2 font-medium">Status</th>
                      <th className="pb-1.5 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceRows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-t border-[#E5E7EB] text-[12px]"
                      >
                        <td className="py-1.5 pr-2 font-semibold text-[#111827]">
                          {row.invoiceNumber !== "—"
                            ? row.invoiceNumber
                            : row.loadNumber}
                        </td>
                        <td className="max-w-[110px] truncate py-1.5 pr-2 text-[#374151]">
                          {row.brokerName}
                        </td>
                        <td className="py-1.5 pr-2 font-semibold tabular-nums text-[#111827]">
                          {row.amountLabel}
                        </td>
                        <td className="py-1.5 pr-2 text-[#6B7280]">
                          {row.paymentExpectedLabel}
                        </td>
                        <td className="py-1.5 pr-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadgeClass(
                              row.status === "Missing POD"
                                ? "warning"
                                : row.tone,
                            )}`}
                          >
                            {row.status === "Payment expected"
                              ? "Expected"
                              : row.status}
                          </span>
                        </td>
                        <td className="py-1.5">
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
              <div className="mt-2 text-center">
                <Link
                  href="/finance?tab=invoices"
                  className="text-[12px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
                >
                  View all invoices
                </Link>
              </div>
            </>
          )}
        </Panel>

        <Panel
          title="Drivers Today"
          className="xl:col-span-4"
          icon={
            <Users className="h-3.5 w-3.5 text-[#64748B]" strokeWidth={2} />
          }
          bodyClassName="pt-0"
        >
          {driverRows.length === 0 ? (
            <p className="text-[13px] text-[#6B7280]">
              No drivers need attention today.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {driverRows.map((driver) => {
                const status = driverDisplayStatus(driver.statusLabel);
                return (
                  <li key={driver.id} className="flex items-center gap-2.5">
                    <DriverAvatar
                      name={driver.name}
                      photoUrl={driver.photoUrl}
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={driver.viewHref}
                        className="block truncate text-[13px] font-semibold text-[#111827] hover:text-[#2563EB]"
                      >
                        {driver.name}
                      </Link>
                      <p className="truncate text-[11px] text-[#6B7280]">
                        {driver.truckLabel}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadgeClass(status.tone)}`}
                    >
                      {status.label}
                    </span>
                    <span className="flex shrink-0 items-center gap-1">
                      {driver.callHref ? (
                        <button
                          type="button"
                          onClick={() => openCommunicationUrl(driver.callHref!)}
                          className="grid h-7 w-7 place-items-center rounded-full border border-[#2563EB]/35 text-[#2563EB] transition hover:bg-[#EFF6FF]"
                          aria-label={`Call ${driver.name}`}
                        >
                          <Phone className="h-3 w-3" strokeWidth={2} />
                        </button>
                      ) : null}
                      {driver.messageHref ? (
                        <button
                          type="button"
                          onClick={() =>
                            openCommunicationUrl(driver.messageHref!)
                          }
                          className="grid h-7 w-7 place-items-center rounded-full border border-[#2563EB]/35 text-[#2563EB] transition hover:bg-[#EFF6FF]"
                          aria-label={`Message ${driver.name}`}
                        >
                          <MessageSquare className="h-3 w-3" strokeWidth={2} />
                        </button>
                      ) : null}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        {/* Row 4: FMCSA News strip */}
        <section
          className={`rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-2.5 md:col-span-2 xl:col-span-12 ${CARD_SHADOW}`}
        >
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-1.5 text-[14px] font-semibold tracking-[-0.01em] text-[#111827]">
              <Building2
                className="h-3.5 w-3.5 text-[#64748B]"
                strokeWidth={2}
                aria-hidden
              />
              FMCSA News Center
            </h2>
            <Link
              href="/compliance"
              className="text-[12px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
            >
              View all news &gt;
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5">
            {home.fmcsaNews.map((item) => (
              <article key={item.id} className="min-w-0">
                <p className="text-[11px] font-medium text-[#94A3B8]">
                  {item.dateLabel}
                </p>
                <p className="mt-0.5 line-clamp-1 text-[13px] font-semibold leading-5 text-[#111827]">
                  {item.headline}
                </p>
                <Link
                  href={item.affectMeHref}
                  className="mt-0.5 inline-flex text-[12px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
                >
                  Does this affect me? →
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </FadeIn>
  );
}
