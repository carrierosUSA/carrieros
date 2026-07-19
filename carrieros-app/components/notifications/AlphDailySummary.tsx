"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  FileWarning,
  Sparkles,
  Truck,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import type { AlphDailySummary } from "@/lib/types/notifications";

type AlphDailySummaryProps = {
  summary: AlphDailySummary;
  compact?: boolean;
};

const SECTIONS: Array<{
  key: keyof Omit<AlphDailySummary, "generatedAt">;
  label: string;
  href: string;
  icon: typeof Sparkles;
  tone: "critical" | "warning" | "info" | "success";
}> = [
  {
    key: "todaysPriorities",
    label: "Today's Priorities",
    href: "/notifications",
    icon: Sparkles,
    tone: "info",
  },
  {
    key: "criticalAlerts",
    label: "Critical Alerts",
    href: "/notifications",
    icon: AlertTriangle,
    tone: "critical",
  },
  {
    key: "missingDocuments",
    label: "Missing Documents",
    href: "/documents/health",
    icon: FileWarning,
    tone: "warning",
  },
  {
    key: "upcomingDeliveries",
    label: "Upcoming Deliveries",
    href: "/loads",
    icon: Truck,
    tone: "info",
  },
  {
    key: "driversAvailable",
    label: "Drivers Available",
    href: "/drivers",
    icon: Users,
    tone: "success",
  },
  {
    key: "pmDue",
    label: "PM Due",
    href: "/fleet/maintenance",
    icon: Wrench,
    tone: "warning",
  },
  {
    key: "invoicesReady",
    label: "Invoices Ready",
    href: "/finance",
    icon: Wallet,
    tone: "success",
  },
  {
    key: "paymentsDue",
    label: "Payments Due",
    href: "/finance",
    icon: CalendarClock,
    tone: "critical",
  },
];

const TONE = {
  critical: "bg-[#FEF2F2] text-[#DC2626]",
  warning: "bg-[#FFF7ED] text-[#EA580C]",
  info: "bg-[#EFF6FF] text-[#2563EB]",
  success: "bg-[#ECFDF3] text-[#16A34A]",
} as const;

export default function AlphDailySummaryPanel({
  summary,
  compact,
}: AlphDailySummaryProps) {
  const visible = compact
    ? SECTIONS.filter((s) =>
        ["todaysPriorities", "criticalAlerts", "missingDocuments", "pmDue"].includes(
          s.key,
        ),
      )
    : SECTIONS;

  return (
    <section
      aria-label="Alph daily summary"
      className="overflow-hidden rounded-[18px] bg-gradient-to-br from-[#EFF6FF] via-white to-[#F8F9FB] p-4 ring-1 ring-[#BFDBFE]/80 sm:p-5"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#2563EB] text-white shadow-[0_8px_18px_rgba(37,99,235,0.28)]">
            <Sparkles className="h-4 w-4" strokeWidth={2} />
          </span>
          <div>
            <p className="text-[15px] font-bold text-[#111827]">
              Alph Daily Summary
            </p>
            <p className="mt-0.5 text-[13px] font-medium text-[#6B7280]">
              Prioritized for today — what needs attention, and what can wait.
            </p>
          </div>
        </div>
        {!compact ? (
          <Link
            href="/documents/health"
            className="hidden shrink-0 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#2563EB] ring-1 ring-[#BFDBFE] transition hover:bg-[#EFF6FF] sm:inline-flex"
          >
            Document Health
          </Link>
        ) : null}
      </div>

      <div
        className={`grid gap-2.5 ${
          compact
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
        }`}
      >
        {visible.map((section) => {
          const Icon = section.icon;
          const items = summary[section.key];
          return (
            <Link
              key={section.key}
              href={section.href}
              className="rounded-[14px] bg-white/90 p-3 ring-1 ring-[#E8ECF2] transition hover:ring-[#93C5FD]"
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`grid h-7 w-7 place-items-center rounded-lg ${TONE[section.tone]}`}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
                <p className="text-[13px] font-semibold text-[#111827]">
                  {section.label}
                </p>
              </div>
              {items.length === 0 ? (
                <p className="text-[13px] text-[#94A3B8]">Nothing right now</p>
              ) : (
                <ul className="space-y-1">
                  {items.slice(0, compact ? 2 : 3).map((item) => (
                    <li
                      key={item}
                      className="truncate text-[13px] font-medium text-[#475569]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
