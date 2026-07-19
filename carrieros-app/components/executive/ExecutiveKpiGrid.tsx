import Link from "next/link";
import type {
  ExecutiveKpi,
  ExecutiveKpiSection,
  ExecutiveKpiTone,
  ExecutiveTrendDirection,
} from "@/lib/executive/executive-board";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type ExecutiveKpiGridProps = {
  sections: ExecutiveKpiSection[];
};

function valueClass(tone: ExecutiveKpiTone): string {
  if (tone === "neutral") return "text-[#0F172A]";
  return CARRIEROS_COLORS[tone].text;
}

function toneSoftBg(tone: ExecutiveKpiTone): string {
  if (tone === "neutral") return "bg-[#F1F5F9] text-[#64748B]";
  return `${CARRIEROS_COLORS[tone].bg} ${CARRIEROS_COLORS[tone].text}`;
}

function TrendGlyph({
  trend,
}: {
  trend: ExecutiveTrendDirection;
  tone: ExecutiveKpiTone;
}) {
  const color =
    trend === "up"
      ? "text-[#16A34A]"
      : trend === "down"
        ? "text-[#DC2626]"
        : "text-[#94A3B8]";

  return (
    <span className={`inline-flex text-[13px] font-bold leading-none ${color}`} aria-hidden>
      {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
    </span>
  );
}

function KpiCard({ kpi }: { kpi: ExecutiveKpi }) {
  const showDelta =
    typeof kpi.deltaPercent === "number" && kpi.trend != null;

  return (
    <Link
      href={kpi.href}
      className="group flex h-full min-h-[120px] flex-col justify-between rounded-[12px] bg-[#F8F9FB] px-4 py-3 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_8px_24px_rgba(37,99,235,0.08)] hover:ring-1 hover:ring-[#BFDBFE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C5FD]"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12px] font-medium text-[#64748B]">{kpi.label}</p>
        {kpi.statusLabel ? (
          <span
            className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${toneSoftBg(kpi.tone)}`}
          >
            {kpi.statusLabel}
          </span>
        ) : null}
      </div>

      <div className="mt-2">
        <p
          className={`text-[22px] font-bold tabular-nums tracking-tight sm:text-[24px] ${valueClass(kpi.tone)}`}
        >
          {kpi.value}
        </p>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          {showDelta ? (
            <>
              <TrendGlyph trend={kpi.trend!} tone={kpi.tone} />
              <span className="text-[12px] font-semibold tabular-nums text-[#334155]">
                {Math.abs(kpi.deltaPercent!)}%
              </span>
              {kpi.deltaLabel ? (
                <span className="text-[12px] font-medium text-[#94A3B8]">
                  {kpi.deltaLabel}
                </span>
              ) : null}
            </>
          ) : (
            <span className="text-[12px] font-medium text-[#94A3B8] line-clamp-1">
              {kpi.detail}
            </span>
          )}
        </div>

        {showDelta && kpi.detail ? (
          <p className="mt-0.5 line-clamp-1 text-[11px] font-medium text-[#94A3B8]">
            {kpi.detail}
          </p>
        ) : null}

        {kpi.insight ? (
          <p className="mt-2 line-clamp-2 text-[11px] font-medium leading-snug text-[#64748B] transition group-hover:text-[#475569]">
            {kpi.insight}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export default function ExecutiveKpiGrid({ sections }: ExecutiveKpiGridProps) {
  return (
    <div className="space-y-5 sm:space-y-6">
      {sections.map((section) => (
        <section key={section.id}>
          <div className="mb-3">
            <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[#0F172A]">
              {section.title}
            </h2>
            <p className="mt-0.5 text-[13px] text-[#64748B]">
              {section.description}
            </p>
          </div>
          <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-8">
            {section.kpis.map((kpi) => (
              <div key={kpi.id} className="h-full min-w-0">
                <KpiCard kpi={kpi} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
