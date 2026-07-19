"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import {
  formatDriverFirstName,
  formatStopScheduleLine,
  formatTruckTrailerPair,
  resolveDispatchEta,
  resolveDispatchStatusDisplay,
  type DispatchLoadRow,
} from "@/lib/dispatch/load-board";
import { computeDocumentHealth } from "@/lib/documents/document-health";

type DispatchTableProps = {
  rows: DispatchLoadRow[];
  page: number;
  pageSize: number;
};

const statusStyles = {
  blue: "bg-[#EFF6FF] text-[#2563EB]",
  green: "bg-[#ECFDF3] text-[#16A34A]",
  red: "bg-[#FEF2F2] text-[#DC2626]",
  amber: "bg-[#FFF7ED] text-[#EA580C]",
  slate: "bg-[#F8F9FB] text-[#6B7280]",
} as const;

const etaDotStyles = {
  green: "bg-[#16A34A]",
  orange: "bg-[#EA580C]",
  red: "bg-[#DC2626]",
  blue: "bg-[#2563EB]",
  slate: "bg-[#94A3B8]",
} as const;

const etaTextStyles = {
  green: "text-[#16A34A]",
  orange: "text-[#EA580C]",
  red: "text-[#DC2626]",
  blue: "text-[#2563EB]",
  slate: "text-[#6B7280]",
} as const;

function StopCell({
  city,
  state,
  date,
  scheduledAt,
}: {
  city: string;
  state: string;
  date: string;
  scheduledAt?: string;
}) {
  return (
    <div className="min-w-0 leading-snug">
      <div className="truncate text-[13px] font-semibold text-[#111827]">
        {city}, {state}
      </div>
      <div className="mt-0.5 truncate text-[12px] font-medium text-[#6B7280]">
        {formatStopScheduleLine(date, scheduledAt)}
      </div>
    </div>
  );
}

function BrokerCell({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[#F8F9FB] text-[12px] font-bold text-[#6B7280]">
        {initial}
      </span>
      <span className="truncate text-[13px] font-medium text-[#334155]" title={name}>
        {name}
      </span>
    </div>
  );
}

export default function DispatchTable({
  rows,
  page,
  pageSize,
}: DispatchTableProps) {
  const router = useRouter();
  const rowOffset = (page - 1) * pageSize;

  if (rows.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-8">
        <EmptyState
          icon={Package}
          title="No loads match"
          description="Clear filters or search by load number, broker, city, or driver."
          actionLabel="Create Load"
          actionHref="/loads/new"
          className="w-full max-w-md"
        />
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto bg-white">
      <table className="w-full table-fixed border-collapse">
        <colgroup>
          <col className="w-[2.5rem]" />
          <col className="w-[5rem]" />
          <col className="w-[12%]" />
          <col className="w-[13%]" />
          <col className="w-[13%]" />
          <col className="w-[10%]" />
          <col className="w-[9%]" />
          <col className="w-[12%]" />
          <col className="w-[10%]" />
          <col className="w-[3rem]" />
        </colgroup>
        <thead className="sticky top-0 z-20 bg-[#F8F9FB]">
          <tr className="text-[12px] font-semibold text-[#6B7280]">
            <th className="px-3 py-3 text-left font-semibold">#</th>
            <th className="px-3 py-3 text-left font-semibold">Load</th>
            <th className="px-3 py-3 text-left font-semibold">Broker</th>
            <th className="px-3 py-3 text-left font-semibold">Pickup</th>
            <th className="px-3 py-3 text-left font-semibold">Delivery</th>
            <th className="px-3 py-3 text-left font-semibold">Equipment</th>
            <th className="px-3 py-3 text-left font-semibold">Driver</th>
            <th className="px-3 py-3 text-left font-semibold">ETA</th>
            <th className="px-3 py-3 text-left font-semibold">Status</th>
            <th className="px-2 py-3 text-center font-semibold">
              <span className="sr-only">Open</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const detailHref = `/loads/${row.load.id}`;
            const eta = resolveDispatchEta(row.load);
            const status = resolveDispatchStatusDisplay(row.load);

            return (
              <tr
                key={row.load.id}
                onClick={() => router.push(detailHref)}
                className="group relative h-14 cursor-pointer border-b border-[#F1F5F9] transition-colors hover:bg-[#EFF6FF]"
              >
                <td className="relative px-3 text-[12px] tabular-nums text-[#94A3B8]">
                  <span className="absolute inset-y-0 left-0 w-[3px] bg-[#2563EB] opacity-0 transition-opacity group-hover:opacity-100" />
                  {rowOffset + index + 1}
                </td>
                <td className="px-3">
                  <div className="flex min-w-0 items-center gap-2">
                    {(() => {
                      const health = computeDocumentHealth(row.load);
                      const dot =
                        health.score.level === "complete"
                          ? "bg-[#16A34A]"
                          : health.score.level === "warning"
                            ? "bg-[#EA580C]"
                            : "bg-[#DC2626]";
                      return (
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`}
                          title={`Docs ${health.score.label} (${health.score.percent}%)`}
                          aria-label={`Document health ${health.score.label}`}
                        />
                      );
                    })()}
                    <Link
                      href={detailHref}
                      onClick={(event) => event.stopPropagation()}
                      className="text-[14px] font-semibold tabular-nums text-[#2563EB] transition hover:underline"
                    >
                      {row.load.reference.replace(/^LD-/i, "")}
                    </Link>
                  </div>
                </td>
                <td className="px-3">
                  <BrokerCell name={row.brokerName} />
                </td>
                <td className="px-3">
                  <StopCell
                    city={row.load.origin.city}
                    state={row.load.origin.state}
                    date={row.load.pickupDate}
                    scheduledAt={row.load.origin.scheduledAt}
                  />
                </td>
                <td className="px-3">
                  <StopCell
                    city={row.load.destination.city}
                    state={row.load.destination.state}
                    date={row.load.deliveryDate}
                    scheduledAt={row.load.destination.scheduledAt}
                  />
                </td>
                <td className="px-3 text-[13px] font-medium tabular-nums text-[#334155]">
                  <span className="block truncate">
                    {formatTruckTrailerPair(row.truckLabel, row.trailerLabel)}
                  </span>
                </td>
                <td className="px-3 text-[13px] font-medium text-[#111827]">
                  <span className="block truncate">
                    {formatDriverFirstName(row.driverName)}
                  </span>
                </td>
                <td className="px-3">
                  <span
                    className={`inline-flex max-w-full items-center gap-2 text-[13px] font-semibold tabular-nums ${etaTextStyles[eta.tone]}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${etaDotStyles[eta.tone]}`}
                    />
                    <span className="truncate">{eta.label}</span>
                  </span>
                </td>
                <td className="px-3">
                  <span
                    className={`inline-flex rounded-[8px] px-2 py-1 text-[12px] font-semibold ${statusStyles[status.tone]}`}
                  >
                    {status.label}
                  </span>
                </td>
                <td className="px-2 text-center">
                  <Link
                    href={detailHref}
                    onClick={(event) => event.stopPropagation()}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-[#94A3B8] transition group-hover:bg-white group-hover:text-[#2563EB]"
                    aria-label="Open load"
                    title="Open"
                  >
                    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
                      <path
                        d="M7.5 5L12.5 10L7.5 15"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
