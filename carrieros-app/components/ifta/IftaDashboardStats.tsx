import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import {
  formatGallons,
  formatMiles,
  formatMoney,
  formatMpg,
} from "@/lib/ifta/board";
import { formatTax } from "@/lib/ifta/tax";
import type { IftaDashboardKpis } from "@/lib/ifta/types";

type IftaDashboardStatsProps = {
  stats: IftaDashboardKpis;
};

const cards: {
  key: keyof IftaDashboardKpis;
  label: string;
  format: (v: number | string) => string;
  tone?: keyof typeof CARRIEROS_COLORS;
  warnWhenPositive?: boolean;
}[] = [
  {
    key: "currentQuarter",
    label: "Reporting Quarter",
    format: (v) => String(v),
    tone: "info",
  },
  {
    key: "milesDriven",
    label: "Miles Driven",
    format: (v) => formatMiles(Number(v)),
  },
  {
    key: "taxableMiles",
    label: "Taxable Miles",
    format: (v) => formatMiles(Number(v)),
    tone: "info",
  },
  {
    key: "nonTaxableMiles",
    label: "Non-Taxable Miles",
    format: (v) => formatMiles(Number(v)),
    tone: "disabled",
  },
  {
    key: "fuelPurchasedGallons",
    label: "Fuel Purchased",
    format: (v) => `${formatGallons(Number(v))} gal`,
  },
  {
    key: "mpg",
    label: "MPG",
    format: (v) => formatMpg(Number(v)),
  },
  {
    key: "estimatedIftaTax",
    label: "Estimated IFTA Tax",
    format: (v) => formatTax(Number(v)),
    tone: "warning",
  },
  {
    key: "missingFuelReceipts",
    label: "Missing Fuel Receipts",
    format: (v) => String(v),
    tone: "critical",
    warnWhenPositive: true,
  },
];

export default function IftaDashboardStats({ stats }: IftaDashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {cards.map((card) => {
        const raw = stats[card.key];
        const numeric = typeof raw === "number" ? raw : 0;
        const highlightMissing =
          card.warnWhenPositive && typeof raw === "number" && raw > 0;
        const taxDue =
          card.key === "estimatedIftaTax" && numeric > 0;

        return (
          <div
            key={card.key}
            className={`rounded-[14px] px-4 py-3 ${
              highlightMissing
                ? `${CARRIEROS_COLORS.critical.bg} ring-1 ${CARRIEROS_COLORS.critical.border}`
                : taxDue
                  ? `${CARRIEROS_COLORS.warning.bg} ring-1 ${CARRIEROS_COLORS.warning.border}`
                  : "bg-[#F8FAFC] ring-1 ring-[#EAEAEA]"
            }`}
          >
            <p className="text-[12px] font-medium text-slate-500">{card.label}</p>
            <p
              className={`mt-1 text-[20px] font-bold tabular-nums tracking-tight ${
                highlightMissing
                  ? CARRIEROS_COLORS.critical.text
                  : taxDue
                    ? CARRIEROS_COLORS.warning.text
                    : card.tone
                      ? CARRIEROS_COLORS[card.tone].text
                      : "text-slate-950"
              }`}
            >
              {card.format(raw)}
            </p>
            {card.key === "fuelPurchasedGallons" ? (
              <p className="mt-0.5 text-[12px] font-medium text-slate-500">
                {formatMoney(stats.fuelPurchasedCost)}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
