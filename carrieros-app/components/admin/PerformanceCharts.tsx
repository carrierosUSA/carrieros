"use client";

import { useAdminStore } from "@/hooks/useAdminStore";
import type { PerformancePoint } from "@/lib/admin/types";

function Sparkline({
  points,
  color,
  label,
}: {
  points: PerformancePoint[];
  color: string;
  label: string;
}) {
  const values = points.map((p) => p.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const width = 280;
  const height = 72;
  const pad = 4;

  const coords = points.map((point, i) => {
    const x =
      pad + (i / Math.max(points.length - 1, 1)) * (width - pad * 2);
    const y =
      height -
      pad -
      ((point.value - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  });

  const area = `M ${coords[0]} L ${coords.join(" L ")} L ${width - pad},${height - pad} L ${pad},${height - pad} Z`;
  const line = `M ${coords.join(" L ")}`;

  return (
    <div className="rounded-[14px] bg-white p-4 ring-1 ring-[#EAEAEA]">
      <p className="text-[13px] font-medium text-[#6B7280]">{label}</p>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-3 h-[72px] w-full"
        role="img"
        aria-label={label}
      >
        <path d={area} fill={color} opacity={0.12} />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="mt-2 flex justify-between text-[12px] text-[#94A3B8]">
        <span>{points[0]?.label}</span>
        <span>{points[points.length - 1]?.label}</span>
      </div>
    </div>
  );
}

export default function PerformanceCharts() {
  const { performance } = useAdminStore();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-[#111827]">
          Performance
        </h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Latency percentiles and request throughput over the last day.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="p50 latency" value={`${performance.p50Ms} ms`} />
        <MetricCard label="p95 latency" value={`${performance.p95Ms} ms`} />
        <MetricCard
          label="Throughput"
          value={`${performance.requestsPerMin}/min`}
        />
        <MetricCard
          label="Error rate"
          value={`${performance.errorRatePercent}%`}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Sparkline
          label="Latency (ms)"
          points={performance.latencySeries}
          color="#2563EB"
        />
        <Sparkline
          label="Throughput (req/min)"
          points={performance.throughputSeries}
          color="#16A34A"
        />
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] bg-white p-4 ring-1 ring-[#EAEAEA]">
      <p className="text-[13px] font-medium text-[#6B7280]">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-[#111827]">
        {value}
      </p>
    </div>
  );
}
