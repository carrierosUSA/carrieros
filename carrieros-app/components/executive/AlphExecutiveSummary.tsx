import Link from "next/link";
import {
  AlertTriangle,
  CircleDollarSign,
  Lightbulb,
  ListChecks,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { AlphExecutiveSummary, AlphSummaryItem } from "@/lib/executive/executive-alph";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";

type AlphExecutiveSummaryProps = {
  summary: AlphExecutiveSummary;
};

const MAX_VISIBLE = 3;

const severityDot: Record<
  NonNullable<AlphSummaryItem["severity"]>,
  string
> = {
  info: "bg-[#2563EB]",
  warning: "bg-[#EA580C]",
  critical: "bg-[#DC2626]",
  success: "bg-[#16A34A]",
};

function SummaryCard({
  title,
  items,
  tone,
  icon: Icon,
  viewAllHref,
}: {
  title: string;
  items: AlphSummaryItem[];
  tone: keyof typeof TRANSPO_COLORS;
  icon: LucideIcon;
  viewAllHref?: string;
}) {
  const colors = TRANSPO_COLORS[tone];
  const visible = items.slice(0, MAX_VISIBLE);
  const hasMore = items.length > MAX_VISIBLE;
  const displayItems =
    visible.length > 0
      ? visible
      : [{ id: "empty", text: "Nothing flagged right now", severity: "success" as const }];

  return (
    <div className="flex h-full min-h-[200px] flex-col rounded-[16px] bg-white px-4 py-4 shadow-[inset_0_0_0_1px_#EAEAEA] transition duration-200 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <div className="flex items-center gap-2">
        <span
          className={`grid h-8 w-8 place-items-center rounded-[12px] ${colors.bg} ${colors.text}`}
        >
          <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
        </span>
        <p className={`text-[12px] font-semibold uppercase tracking-[0.12em] ${colors.text}`}>
          {title}
        </p>
      </div>

      <ul className="mt-3 flex flex-1 flex-col gap-3">
        {displayItems.map((item) => (
          <li key={item.id} className="group/item">
            <div className="flex items-start gap-2">
              <span
                className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${severityDot[item.severity ?? "info"]}`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] leading-snug text-[#334155]">{item.text}</p>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={`mt-1 inline-flex items-center rounded-[8px] px-2 py-1 text-[12px] font-semibold transition ${colors.text} ${colors.bg} hover:brightness-[0.97]`}
                  >
                    Open
                  </Link>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {hasMore && viewAllHref ? (
        <Link
          href={viewAllHref}
          className="mt-3 text-[12px] font-semibold text-[#2563EB] hover:underline"
        >
          View All ({items.length})
        </Link>
      ) : (
        <div className="mt-3 h-4" aria-hidden />
      )}
    </div>
  );
}

export default function AlphExecutiveSummaryCard({
  summary,
}: AlphExecutiveSummaryProps) {
  return (
    <section className="rounded-[16px] bg-[#F8F9FB] px-4 py-5 sm:px-5 sm:py-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-[8px] bg-white px-3 py-1 text-[12px] font-semibold text-[#2563EB] shadow-[inset_0_0_0_1px_#BFDBFE]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
            Alph Morning Briefing
          </div>
          <h2 className="mt-3 text-[22px] font-bold tracking-[-0.03em] text-[#111827] sm:text-[24px]">
            {summary.greeting}
          </h2>
          <p className="mt-1 text-[14px] font-medium text-[#6B7280]">
            {summary.subtitle}
          </p>
        </div>
        <div className="mt-3 flex flex-col items-start gap-2 sm:mt-0 sm:items-end">
          <p className="max-w-sm text-[13px] leading-relaxed text-[#6B7280] sm:text-right">
            Needs attention, recommended actions, and what is at risk.
          </p>
          <Link
            href="/alph/copilot/owner"
            className="inline-flex items-center rounded-full bg-[#2563EB] px-3 py-1.5 text-[12px] font-semibold text-white"
          >
            Open Owner Alph →
          </Link>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <SummaryCard
          title="Needs Your Attention"
          items={summary.topPriorities}
          tone="warning"
          icon={ListChecks}
          viewAllHref="/alph/copilot/owner"
        />
        <SummaryCard
          title="Recommended Actions"
          items={summary.opportunities}
          tone="info"
          icon={Lightbulb}
          viewAllHref="/alph/copilot/owner"
        />
        <SummaryCard
          title="At Risk"
          items={summary.risks}
          tone="critical"
          icon={AlertTriangle}
          viewAllHref="/compliance"
        />
        <SummaryCard
          title="Fleet Readiness"
          items={summary.fleetHealth}
          tone="info"
          icon={Truck}
          viewAllHref="/fleet"
        />
        <SummaryCard
          title="Cash & Invoices"
          items={summary.financialHealth}
          tone="success"
          icon={CircleDollarSign}
          viewAllHref="/finance"
        />
      </div>
    </section>
  );
}
