"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import {
  TREND_RANGE_OPTIONS,
  type ExecutiveTrends,
  type ExecutiveTrendsByRange,
  type TrendPoint,
  type TrendRangeId,
} from "@/lib/executive/executive-trends";

type ExecutiveChartsProps = {
  trendsByRange: ExecutiveTrendsByRange;
};

const BLUE = "#2563EB";

function formatChartValue(value: number, money: boolean) {
  if (!money) {
    return new Intl.NumberFormat("en-US").format(value);
  }
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${Math.round(value)}`;
}

function MiniLineChart({
  data,
  money = false,
  height = 120,
}: {
  data: TrendPoint[];
  money?: boolean;
  height?: number;
}) {
  const width = 320;
  const padX = 10;
  const padY = 18;
  const uid = useId().replace(/:/g, "");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const values = data.map((d) => d.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);

  const points = data.map((item, index) => {
    const x =
      padX + (index / Math.max(data.length - 1, 1)) * (width - padX * 2);
    const y = padY + (1 - (item.value - min) / range) * (height - padY * 2);
    return { x, y, ...item };
  });

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const area =
    points.length > 0
      ? `${path} L ${points[points.length - 1].x} ${height - 4} L ${points[0].x} ${height - 4} Z`
      : "";
  const latest = points[points.length - 1];
  const active = hoverIndex != null ? points[hoverIndex] : latest;
  const gradientId = `exec-fill-${uid}`;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[120px] w-full"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={BLUE} stopOpacity="0.16" />
            <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={area}
          fill={`url(#${gradientId})`}
          className="transition-opacity duration-300"
        />
        <path
          d={path}
          fill="none"
          stroke={BLUE}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="[stroke-dasharray:640] [stroke-dashoffset:640] animate-[carrieros-draw-line_0.7s_ease-out_forwards]"
        />
        {points.map((point, index) => (
          <g key={point.label}>
            <circle
              cx={point.x}
              cy={point.y}
              r={hoverIndex === index ? 5 : 0}
              fill={BLUE}
              stroke="#fff"
              strokeWidth="2"
              className="transition-all duration-150"
            />
            <rect
              x={point.x - width / data.length / 2}
              y={0}
              width={Math.max(width / data.length, 12)}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(index)}
            />
          </g>
        ))}
        {latest && hoverIndex == null ? (
          <circle
            cx={latest.x}
            cy={latest.y}
            r="4"
            fill={BLUE}
            stroke="#fff"
            strokeWidth="2"
          />
        ) : null}
      </svg>

      {active ? (
        <div className="pointer-events-none absolute left-1/2 top-1 -translate-x-1/2 rounded-lg bg-[#0F172A] px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg opacity-0 transition-opacity duration-150 group-hover/chart:opacity-100">
          {active.label}: {formatChartValue(active.value, money)}
        </div>
      ) : null}

      <div className="mt-1 flex justify-between px-0.5">
        {data.map((item, index) => (
          <span
            key={item.label}
            className={`text-[10px] font-medium transition-colors ${
              hoverIndex === index ? "text-[#2563EB]" : "text-[#94A3B8]"
            }`}
          >
            {item.label}
          </span>
        ))}
      </div>
      {active ? (
        <p className="mt-2 text-[13px] font-semibold tabular-nums text-[#0F172A]">
          {formatChartValue(active.value, money)}
          <span className="ml-1.5 text-[11px] font-medium text-[#94A3B8]">
            {active.label}
          </span>
        </p>
      ) : null}
    </div>
  );
}

function MiniBarChart({
  data,
  money = false,
}: {
  data: TrendPoint[];
  money?: boolean;
}) {
  const max = Math.max(...data.map((d) => Math.abs(d.value)), 1);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  return (
    <div
      className="flex h-[140px] items-end gap-2 pt-2"
      onMouseLeave={() => setHoverIndex(null)}
    >
      {data.map((item, index) => {
        const heightPct = Math.max((Math.abs(item.value) / max) * 100, 8);
        const isLast = index === data.length - 1;
        const isActive = hoverIndex === index || (hoverIndex == null && isLast);
        return (
          <div
            key={item.label}
            className="group/bar flex min-w-0 flex-1 flex-col items-center gap-1.5"
            onMouseEnter={() => setHoverIndex(index)}
          >
            <span
              className={`text-[10px] font-semibold tabular-nums transition-colors ${
                isActive ? "text-[#0F172A]" : "text-[#94A3B8]"
              }`}
            >
              {formatChartValue(item.value, money)}
            </span>
            <div
              className="w-full max-w-[36px] origin-bottom rounded-t-[8px] transition-all duration-300 ease-out"
              style={{
                height: `${heightPct}%`,
                backgroundColor: isActive ? BLUE : "#DBEAFE",
                transform: isActive ? "scaleY(1.04)" : "scaleY(1)",
              }}
            />
            <span className="truncate text-[10px] font-medium text-[#94A3B8]">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  href,
  children,
  className = "",
}: {
  title: string;
  subtitle: string;
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className={`group/chart flex h-full min-h-[220px] flex-col rounded-[16px] bg-white p-4 text-left shadow-[inset_0_0_0_1px_#EAEAEA] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(37,99,235,0.08)] hover:ring-1 hover:ring-[#BFDBFE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C5FD] ${className}`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-[#0F172A]">
            {title}
          </h3>
          <p className="mt-0.5 text-[12px] font-medium text-[#94A3B8]">
            {subtitle}
          </p>
        </div>
        <span className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold text-[#2563EB] opacity-0 transition group-hover/chart:opacity-100">
          Open →
        </span>
      </div>
      {children}
    </button>
  );
}

function rangeSubtitle(range: TrendRangeId): string {
  switch (range) {
    case "today":
      return "Today";
    case "7d":
      return "Last 7 days";
    case "30d":
      return "Last 30 days";
    case "quarter":
      return "This quarter";
    case "year":
      return "This year";
  }
}

export default function ExecutiveCharts({ trendsByRange }: ExecutiveChartsProps) {
  const [range, setRange] = useState<TrendRangeId>("30d");
  const trends: ExecutiveTrends = trendsByRange[range];
  const subtitle = rangeSubtitle(range);

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-[#0F172A]">
            Trends
          </h3>
          <p className="mt-0.5 text-[13px] text-[#64748B]">
            Revenue, cost, and performance at a glance
          </p>
        </div>
        <div
          className="inline-flex max-w-full flex-wrap gap-1 rounded-xl bg-[#F1F5F9] p-1"
          role="tablist"
          aria-label="Trend date range"
        >
          {TREND_RANGE_OPTIONS.map((option) => {
            const active = option.id === range;
            return (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setRange(option.id)}
                className={`rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition duration-150 sm:px-3 ${
                  active
                    ? "bg-white text-[#0F172A] shadow-sm"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        key={range}
        className="grid animate-[carrieros-fade-in_0.28s_ease-out_forwards] gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <ChartCard title="Revenue Trend" subtitle={subtitle} href="/finance">
          <MiniLineChart data={trends.revenue} money />
        </ChartCard>
        <ChartCard title="Profit Trend" subtitle={subtitle} href="/finance">
          <MiniBarChart data={trends.profit} money />
        </ChartCard>
        <ChartCard title="Fuel Trend" subtitle={subtitle} href="/fleet/fuel">
          <MiniBarChart data={trends.fuel} money />
        </ChartCard>
        <ChartCard title="Cost Per Mile Trend" subtitle={subtitle} href="/finance">
          <MiniLineChart data={trends.costPerMile} money />
        </ChartCard>
        <ChartCard
          title="Fleet Utilization Trend"
          subtitle={subtitle}
          href="/fleet"
        >
          <MiniLineChart data={trends.fleetUtilization} />
        </ChartCard>
        <ChartCard
          title="On-Time Delivery Trend"
          subtitle={subtitle}
          href="/loads"
        >
          <MiniLineChart data={trends.onTimeDelivery} />
        </ChartCard>
      </div>
    </section>
  );
}
