"use client";

import { useId } from "react";
import type { WorkforceAnalytics } from "@/lib/types/workforce";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";

const BLUE = "#2563EB";

function MiniLineChart({
  data,
}: {
  data: Array<{ label: string; value: number }>;
}) {
  const width = 320;
  const height = 120;
  const padX = 10;
  const padY = 18;
  const uid = useId().replace(/:/g, "");
  const values = data.map((d) => d.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const points = data.map((item, index) => {
    const x = padX + (index / Math.max(data.length - 1, 1)) * (width - padX * 2);
    const y = padY + (1 - (item.value - min) / range) * (height - padY * 2);
    return { x, y, ...item };
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area =
    points.length > 0
      ? `${path} L ${points[points.length - 1].x} ${height - 4} L ${points[0].x} ${height - 4} Z`
      : "";
  const gradientId = `wf-fill-${uid}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[120px] w-full">
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={BLUE} stopOpacity="0.16" />
          <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={path}
        fill="none"
        stroke={BLUE}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="[stroke-dasharray:640] [stroke-dashoffset:640] animate-[carrieros-draw-line_0.7s_ease-out_forwards]"
      />
    </svg>
  );
}

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

export default function AnalyticsClient({ analytics }: { analytics: WorkforceAnalytics }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Avg hiring time", value: `${analytics.avgHiringDays} days`, tone: "info" as const },
          { label: "Acceptance rate", value: pct(analytics.acceptanceRate), tone: "success" as const },
          { label: "Retention", value: pct(analytics.retentionRate), tone: "success" as const },
          {
            label: "Interview success",
            value: pct(analytics.interviewSuccessRate),
            tone: "info" as const,
          },
        ].map((kpi) => {
          const colors = TRANSPO_COLORS[kpi.tone];
          return (
            <div
              key={kpi.label}
              className={`flex min-h-[88px] flex-col justify-between rounded-[12px] px-4 py-3 ${colors.bg}`}
            >
              <p className="text-[12px] font-medium text-[#6B7280]">{kpi.label}</p>
              <p className={`text-[22px] font-bold ${colors.text}`}>{kpi.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[16px] bg-[#F8F9FB] p-4">
          <h3 className="text-[15px] font-semibold text-[#111827]">Applications</h3>
          <p className="text-[13px] text-[#6B7280]">Weekly volume</p>
          <div className="mt-3">
            <MiniLineChart data={analytics.applicationsByWeek} />
          </div>
          <div className="mt-2 flex justify-between text-[12px] text-[#6B7280]">
            {analytics.applicationsByWeek.map((p) => (
              <span key={p.label}>{p.label}</span>
            ))}
          </div>
        </section>

        <section className="rounded-[16px] bg-[#F8F9FB] p-4">
          <h3 className="text-[15px] font-semibold text-[#111827]">Sources</h3>
          <ul className="mt-3 space-y-2">
            {analytics.sources.map((s) => (
              <li key={s.label} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-[13px] text-[#334155]">{s.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-[#2563EB]"
                    style={{
                      width: `${(s.value / Math.max(...analytics.sources.map((x) => x.value))) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-8 text-right text-[13px] font-semibold text-[#111827]">
                  {s.value}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-[16px] bg-[#F8F9FB] p-4">
        <h3 className="text-[15px] font-semibold text-[#111827]">Salary benchmarks</h3>
        <div className="mt-3 space-y-2">
          {analytics.salaryBenchmarks.map((b) => (
            <div
              key={b.role}
              className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] bg-white px-3 py-2"
            >
              <p className="text-[14px] font-medium text-[#111827]">{b.role}</p>
              <p className="text-[13px] text-[#6B7280]">
                Low {b.low} · Mid <span className="font-semibold text-[#111827]">{b.mid}</span>{" "}
                · High {b.high}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[16px] bg-[#F8F9FB] p-4">
        <h3 className="text-[15px] font-semibold text-[#111827]">Recruiter performance</h3>
        <div className="mt-3 space-y-2">
          {analytics.recruiterPerformance.map((r) => (
            <div
              key={r.name}
              className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] bg-white px-3 py-2"
            >
              <p className="text-[14px] font-semibold text-[#111827]">{r.name}</p>
              <p className="text-[13px] text-[#6B7280]">
                {r.hires} hires · {r.avgDays} days avg · {pct(r.acceptance)} acceptance
              </p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-[13px] text-[#6B7280]">
        Open positions tracked: {analytics.openPositions}. Retention figures are seeded demo
        metrics for planning.
      </p>
    </div>
  );
}
