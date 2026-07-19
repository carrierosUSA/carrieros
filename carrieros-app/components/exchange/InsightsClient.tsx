"use client";

import Link from "next/link";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import type { ExchangeInsight } from "@/lib/exchange/types";

const tone = {
  info: TRANSPO_COLORS.info,
  success: TRANSPO_COLORS.success,
  warning: TRANSPO_COLORS.warning,
} as const;

function Spark({ series }: { series: number[] }) {
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;
  const w = 120;
  const h = 36;
  const points = series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="opacity-80">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function InsightsClient({ insights }: { insights: ExchangeInsight[] }) {
  return (
    <div className="space-y-5">
      <p className="text-[14px] text-[#6B7280]">
        Market trends and purchase recommendations from seed heuristics. For live pricing models,
        connect data partners later.
      </p>
      <div className="grid gap-3 lg:grid-cols-2">
        {insights.map((ins) => {
          const t = tone[ins.tone];
          return (
            <article key={ins.id} className={`rounded-[16px] p-5 ${t.bg}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className={`transpo-card-title text-[16px] ${t.text}`}>{ins.title}</h2>
                  <p className="mt-1 text-[13px] text-[#334155]">{ins.summary}</p>
                </div>
                <div className={`${t.text}`}>
                  <Spark series={ins.series} />
                </div>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <p className="transpo-number text-[22px] font-bold text-[#111827]">{ins.metric}</p>
                <p className="text-[12px] font-medium text-[#6B7280]">{ins.deltaLabel}</p>
              </div>
            </article>
          );
        })}
      </div>
      <Link href="/exchange/ai" className="transpo-btn-primary inline-flex">
        Shop Alph recommendations
      </Link>
    </div>
  );
}
