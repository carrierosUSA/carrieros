import Link from "next/link";
import type { TruckDashboardStats as Stats } from "@/lib/fleet/truck-board";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";

export type FleetKpiExtras = {
  totalTrailers: number;
  openMaintenance: number;
};

type TruckDashboardStatsProps = {
  stats: Stats;
  extras?: FleetKpiExtras;
};

const truckCards: {
  key: keyof Stats;
  label: string;
  href: string;
  tone?: keyof typeof TRANSPO_COLORS;
}[] = [
  { key: "totalTrucks", label: "Total Trucks", href: "/fleet/trucks" },
  {
    key: "available",
    label: "Available",
    href: "/fleet/trucks?status=available",
    tone: "success",
  },
  {
    key: "onLoad",
    label: "On Load",
    href: "/fleet/trucks?status=on_load",
    tone: "info",
  },
  {
    key: "idle",
    label: "Idle",
    href: "/fleet/trucks?status=idle",
    tone: "disabled",
  },
  {
    key: "inShop",
    label: "In Shop",
    href: "/fleet/maintenance",
    tone: "warning",
  },
  {
    key: "outOfService",
    label: "Out of Service",
    href: "/fleet/trucks?status=out_of_service",
    tone: "critical",
  },
];

function KpiCard({
  label,
  value,
  href,
  tone,
  highlight,
}: {
  label: string;
  value: number;
  href: string;
  tone?: keyof typeof TRANSPO_COLORS;
  highlight?: "warning" | "critical";
}) {
  const toneStyles = tone ? TRANSPO_COLORS[tone] : null;
  const surface =
    highlight === "critical"
      ? TRANSPO_COLORS.critical.bg
      : highlight === "warning"
        ? TRANSPO_COLORS.warning.bg
        : "bg-[#F8F9FB]";
  const valueColor =
    highlight === "critical"
      ? TRANSPO_COLORS.critical.text
      : highlight === "warning"
        ? TRANSPO_COLORS.warning.text
        : toneStyles
          ? toneStyles.text
          : "text-[#111827]";
  const dotClass =
    highlight === "critical"
      ? "bg-[#DC2626]"
      : highlight === "warning"
        ? "bg-[#EA580C]"
        : tone === "success"
          ? "bg-[#16A34A]"
          : tone === "info"
            ? "bg-[#2563EB]"
            : tone === "critical"
              ? "bg-[#DC2626]"
              : tone === "warning"
                ? "bg-[#EA580C]"
                : "bg-[#94A3B8]";

  return (
    <Link
      href={href}
      className={`group flex h-full min-h-[96px] flex-col justify-between rounded-[12px] px-4 py-3 transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_8px_24px_rgba(37,99,235,0.08)] hover:ring-1 hover:ring-[#BFDBFE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C5FD] ${surface}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-medium text-[#6B7280]">{label}</p>
        <span className={`h-2 w-2 rounded-full ${dotClass}`} aria-hidden />
      </div>
      <p className={`mt-2 text-[22px] font-bold tabular-nums tracking-tight ${valueColor}`}>
        {value}
      </p>
    </Link>
  );
}

export default function TruckDashboardStats({
  stats,
  extras,
}: TruckDashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-4 xl:grid-cols-8">
      {truckCards.map((card) => {
        const value = stats[card.key];
        const highlight =
          (card.key === "outOfService" || card.key === "inShop") && value > 0
            ? card.key === "outOfService"
              ? ("critical" as const)
              : ("warning" as const)
            : undefined;

        return (
          <KpiCard
            key={card.key}
            label={card.label}
            value={value}
            href={card.href}
            tone={card.tone}
            highlight={highlight}
          />
        );
      })}
      {extras ? (
        <>
          <KpiCard
            label="Total Trailers"
            value={extras.totalTrailers}
            href="/fleet/trailers"
            tone="info"
          />
          <KpiCard
            label="Open Maintenance"
            value={extras.openMaintenance}
            href="/fleet/maintenance"
            tone={extras.openMaintenance > 0 ? "warning" : "success"}
            highlight={extras.openMaintenance > 0 ? "warning" : undefined}
          />
        </>
      ) : null}
    </div>
  );
}
