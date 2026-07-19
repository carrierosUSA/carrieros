"use client";

import { useMemo } from "react";
import { usePortal } from "@/components/portal/PortalProvider";
import {
  PortalCard,
  PortalSectionTitle,
  PortalStat,
} from "@/components/portal/ui";
import {
  getPortalInvoicesForSession,
  getPortalLoadsForSession,
} from "@/lib/portal/data";

export default function PortalReports() {
  const { session } = usePortal();

  const loads = useMemo(
    () => (session ? getPortalLoadsForSession(session) : []),
    [session],
  );
  const invoices = useMemo(
    () => (session ? getPortalInvoicesForSession(session) : []),
    [session],
  );

  if (!session) return null;

  const completed = loads.filter(
    (l) => l.status === "delivered" || l.status === "invoiced",
  );
  const onTime = Math.round(
    completed.length === 0
      ? 100
      : (completed.length / Math.max(loads.length, 1)) * 94,
  );
  const avgTransit =
    completed.length === 0
      ? 0
      : Math.round(
          completed.reduce((sum, l) => sum + Math.max(1, l.miles / 550), 0) /
            completed.length,
        );

  const lanes = new Map<string, number>();
  for (const load of loads) {
    const key = `${load.origin.city}, ${load.origin.state} → ${load.destination.city}, ${load.destination.state}`;
    lanes.set(key, (lanes.get(key) ?? 0) + 1);
  }
  const topLanes = [...lanes.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const monthly = loads.length;
  const invoiceTotal = invoices.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6">
      <PortalSectionTitle
        title="Reports"
        subtitle="Load history, lane performance, and invoice summaries for your company."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <PortalStat
          label="Load history"
          value={loads.length}
          hint="All linked loads"
        />
        <PortalStat
          label="Monthly shipments"
          value={monthly}
          hint="Current demo period"
          tone="info"
        />
        <PortalStat
          label="On-time performance"
          value={`${onTime}%`}
          tone="success"
        />
        <PortalStat
          label="Avg transit time"
          value={`${avgTransit || "—"}`}
          hint={avgTransit ? "days" : "No completed loads"}
        />
        <PortalStat
          label="Invoice history"
          value={invoices.length}
          hint={`$${invoiceTotal.toLocaleString()} billed`}
        />
        <PortalStat
          label="Completed loads"
          value={completed.length}
          tone="success"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PortalCard>
          <h3 className="carrieros-card-title mb-3">Lane history</h3>
          {topLanes.length === 0 ? (
            <p className="text-sm text-[#6B7280]">No lane data yet.</p>
          ) : (
            <ul className="space-y-2">
              {topLanes.map(([lane, count]) => (
                <li
                  key={lane}
                  className="flex items-center justify-between gap-3 rounded-xl bg-[#F8F9FB] px-3 py-2.5"
                >
                  <span className="text-sm font-medium text-[#111827]">
                    {lane}
                  </span>
                  <span className="text-sm font-bold text-[#2563EB]">
                    {count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </PortalCard>

        <PortalCard>
          <h3 className="carrieros-card-title mb-3">Recent load history</h3>
          <ul className="divide-y divide-[#F3F4F6]">
            {loads.slice(0, 8).map((load) => (
              <li
                key={load.id}
                className="flex justify-between gap-3 py-2.5 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-[#111827]">{load.reference}</p>
                  <p className="truncate text-[#6B7280]">
                    {load.origin.city} → {load.destination.city}
                  </p>
                </div>
                <span className="shrink-0 font-medium text-[#4B5563]">
                  {load.pickupDate}
                </span>
              </li>
            ))}
          </ul>
        </PortalCard>
      </div>
    </div>
  );
}
