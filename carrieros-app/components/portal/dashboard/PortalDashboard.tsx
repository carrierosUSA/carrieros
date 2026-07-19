"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { usePortal } from "@/components/portal/PortalProvider";
import {
  PortalCard,
  PortalSectionTitle,
  PortalStat,
} from "@/components/portal/ui";
import {
  buildPortalAlphInsights,
  getPortalDashboardStats,
  getPortalLoadsForSession,
} from "@/lib/portal/data";
import { LOAD_STATUS_LABELS } from "@/lib/types/load";
import PermissionButton from "@/components/portal/PermissionButton";
import { useRouter } from "next/navigation";

export default function PortalDashboard() {
  const { session, notifications } = usePortal();
  const router = useRouter();
  if (!session) return null;

  const stats = getPortalDashboardStats(session);
  const alph = buildPortalAlphInsights(session);
  const loads = getPortalLoadsForSession(session).slice(0, 5);
  const recentNotifs = notifications.slice(0, 4);

  return (
    <div className="space-y-6">
      <PortalSectionTitle
        title="Dashboard"
        subtitle={`Welcome back, ${session.name.split(" ")[0]}. Here's what needs attention.`}
        action={
          <PermissionButton
            role={session.role}
            permission="create_load_request"
            onClick={() => router.push("/portal/loads?new=1")}
            className="rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
          >
            Create Load Request
          </PermissionButton>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <PortalStat label="Active Loads" value={stats.activeLoads} tone="info" />
        <PortalStat
          label="Upcoming Pickups"
          value={stats.upcomingPickups}
          tone="default"
        />
        <PortalStat
          label="Deliveries Today"
          value={stats.deliveriesToday}
          tone="warning"
        />
        <PortalStat
          label="Completed Loads"
          value={stats.completedLoads}
          tone="success"
        />
        <PortalStat
          label="Open Invoices"
          value={stats.openInvoices}
          hint={
            stats.outstandingBalance > 0
              ? `$${stats.outstandingBalance.toLocaleString()} outstanding`
              : undefined
          }
        />
        <PortalStat
          label="Docs Awaiting Review"
          value={stats.documentsAwaitingReview}
          tone={stats.documentsAwaitingReview > 0 ? "warning" : "default"}
        />
        <PortalStat
          label="Notifications"
          value={stats.unreadNotifications}
          tone={stats.unreadNotifications > 0 ? "critical" : "default"}
        />
      </div>

      <PortalCard className="bg-gradient-to-br from-[#EFF6FF] to-white">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#2563EB] shadow-sm">
            <Sparkles className="h-5 w-5" strokeWidth={1.9} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#1D4ED8]">Alph AI</p>
            <p className="mt-1 text-base font-semibold text-[#111827]">
              {alph.summary}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <p className="text-sm text-[#4B5563]">
                <span className="font-medium text-[#111827]">Delays: </span>
                {alph.delayExplanation}
              </p>
              <p className="text-sm text-[#4B5563]">
                <span className="font-medium text-[#111827]">ETA: </span>
                {alph.etaPrediction}
              </p>
              <p className="text-sm text-[#4B5563]">
                <span className="font-medium text-[#111827]">Documents: </span>
                {alph.documentStatus}
              </p>
              <p className="text-sm text-[#4B5563]">
                <span className="font-medium text-[#111827]">Insight: </span>
                {alph.smartInsight}
              </p>
            </div>
          </div>
        </div>
      </PortalCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <PortalCard>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="carrieros-card-title">Recent loads</h3>
            <Link
              href="/portal/loads"
              className="text-sm font-semibold text-[#2563EB]"
            >
              View all
            </Link>
          </div>
          <ul className="divide-y divide-[#F3F4F6]">
            {loads.length === 0 ? (
              <li className="py-6 text-sm text-[#6B7280]">No loads yet.</li>
            ) : (
              loads.map((load) => (
                <li
                  key={load.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#111827]">
                      {load.reference}
                    </p>
                    <p className="truncate text-sm text-[#6B7280]">
                      {load.origin.city}, {load.origin.state} → {load.destination.city},{" "}
                      {load.destination.state}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-[#4B5563]">
                    {LOAD_STATUS_LABELS[load.status] ?? load.status}
                  </span>
                </li>
              ))
            )}
          </ul>
        </PortalCard>

        <PortalCard>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="carrieros-card-title">Notifications</h3>
            <Link
              href="/portal/messages"
              className="text-sm font-semibold text-[#2563EB]"
            >
              Messages
            </Link>
          </div>
          <ul className="space-y-2">
            {recentNotifs.length === 0 ? (
              <li className="py-6 text-sm text-[#6B7280]">All caught up.</li>
            ) : (
              recentNotifs.map((n) => (
                <li
                  key={n.id}
                  className={`rounded-xl px-3 py-2.5 ${
                    n.read ? "bg-[#F8F9FB]" : "bg-[#EFF6FF]"
                  }`}
                >
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="text-sm text-[#6B7280]">{n.body}</p>
                </li>
              ))
            )}
          </ul>
        </PortalCard>
      </div>
    </div>
  );
}
