import Link from "next/link";
import type { DriverDashboardStats as Stats } from "@/lib/drivers/driver-board";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";

type DriverDashboardStatsProps = {
  stats: Stats;
};

const statCards: {
  key: keyof Stats;
  label: string;
  href: string;
  tone?: keyof typeof TRANSPO_COLORS;
}[] = [
  { key: "totalDrivers", label: "Total Drivers", href: "/drivers" },
  {
    key: "active",
    label: "Active",
    href: "/drivers?status=active",
    tone: "success",
  },
  { key: "onLoad", label: "On Load", href: "/drivers?status=on_load", tone: "info" },
  {
    key: "offDuty",
    label: "Off Duty",
    href: "/drivers?status=off_duty",
    tone: "disabled",
  },
  {
    key: "available",
    label: "Available",
    href: "/drivers?status=available",
    tone: "success",
  },
  {
    key: "expiringCdl",
    label: "Expiring CDL",
    href: "/compliance",
    tone: "warning",
  },
  {
    key: "expiringMedical",
    label: "Expiring Medical",
    href: "/compliance",
    tone: "warning",
  },
];

export default function DriverDashboardStats({ stats }: DriverDashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {statCards.map((card) => {
        const value = stats[card.key];
        const tone = card.tone ? TRANSPO_COLORS[card.tone] : null;
        const highlight =
          (card.key === "expiringCdl" || card.key === "expiringMedical") &&
          value > 0;

        return (
          <Link
            key={card.key}
            href={card.href}
            className={`flex h-full min-h-[96px] flex-col justify-between rounded-[12px] px-4 py-3 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_8px_24px_rgba(37,99,235,0.08)] hover:ring-1 hover:ring-[#BFDBFE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C5FD] ${
              highlight
                ? TRANSPO_COLORS.warning.bg
                : "bg-[#F8F9FB]"
            }`}
          >
            <p className="text-[12px] font-medium text-[#6B7280]">{card.label}</p>
            <p
              className={`mt-2 text-[22px] font-bold tabular-nums tracking-tight ${
                highlight
                  ? TRANSPO_COLORS.warning.text
                  : tone
                    ? tone.text
                    : "text-[#111827]"
              }`}
            >
              {value}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
