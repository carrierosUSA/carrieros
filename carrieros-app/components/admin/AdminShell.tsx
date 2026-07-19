"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import AdminBackupPanel from "@/components/admin/AdminBackupPanel";
import AdminFeedbackToast from "@/components/admin/AdminFeedbackToast";
import {
  AdminActivityLogsPanel,
  AdminApiLogsPanel,
  AdminAuditLogsPanel,
  AdminLoginHistoryPanel,
} from "@/components/admin/AdminLogPanels";
import AdminSubNav, { parseAdminTab } from "@/components/admin/AdminSubNav";
import DeviceList from "@/components/admin/DeviceList";
import ErrorList from "@/components/admin/ErrorList";
import FeatureFlagToggles from "@/components/admin/FeatureFlagToggles";
import MaintenanceModeToggle from "@/components/admin/MaintenanceModeToggle";
import PerformanceCharts from "@/components/admin/PerformanceCharts";
import RestorePanel from "@/components/admin/RestorePanel";
import SessionList from "@/components/admin/SessionList";
import SystemHealthCards from "@/components/admin/SystemHealthCards";
import EldAdminQueue from "@/components/eld/EldAdminQueue";
import AdminSupportQueue from "@/components/support/AdminSupportQueue";
import { getCurrentSession } from "@/lib/auth/session";
import type { AdminTabId } from "@/lib/admin/types";
import { getEldStore, subscribeEldStore } from "@/lib/eld";

export default function AdminShell() {
  const searchParams = useSearchParams();
  const activeTab = parseAdminTab(searchParams.get("tab"));
  const session = getCurrentSession();
  const allowed =
    session.role === "owner" || session.role === "super_admin";
  const [feedback, setFeedback] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setFeedback(message);
  }, []);

  if (!allowed) {
    return (
      <FadeIn className="w-full rounded-[16px] bg-white p-6 text-[#111827]">
        <h1 className="text-2xl font-bold tracking-tight">System Admin</h1>
        <p className="mt-2 text-[14px] text-[#6B7280]">
          Only owners and super admins can open System Administration.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex h-10 items-center rounded-xl bg-[#2563EB] px-4 text-[13px] font-semibold text-white"
        >
          Back to Command
        </Link>
      </FadeIn>
    );
  }

  return (
    <>
      <AdminFeedbackToast
        message={feedback}
        onDismiss={() => setFeedback(null)}
      />
      <FadeIn className="w-full rounded-[16px] bg-white p-4 text-[#111827] sm:p-5 lg:p-6">
        <div className="mx-auto max-w-[1280px] space-y-5">
          <header className="rounded-[16px] bg-[#F5F7FA] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
              Platform
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#111827]">
              System Admin
            </h1>
            <p className="mt-1 text-[14px] text-[#6B7280]">
              Audit trails, access, backups, health, and feature controls.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/settings?section=security"
                className="rounded-lg bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#2563EB] ring-1 ring-[#EAEAEA] hover:bg-[#EFF6FF]"
              >
                Settings · Security
              </Link>
              <Link
                href="/settings?section=backup"
                className="rounded-lg bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#2563EB] ring-1 ring-[#EAEAEA] hover:bg-[#EFF6FF]"
              >
                Settings · Backup
              </Link>
              <Link
                href="/settings/permissions?tab=audit"
                className="rounded-lg bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#2563EB] ring-1 ring-[#EAEAEA] hover:bg-[#EFF6FF]"
              >
                Permissions audit
              </Link>
            </div>
          </header>

          <div className="flex flex-col gap-5 lg:flex-row lg:gap-8">
            <AdminSubNav activeTab={activeTab} />
            <div className="min-w-0 flex-1">
              <AdminActivePanel tab={activeTab} onToast={showToast} />
            </div>
          </div>
        </div>
      </FadeIn>
    </>
  );
}

function AdminActivePanel({
  tab,
  onToast,
}: {
  tab: AdminTabId;
  onToast: (message: string) => void;
}) {
  switch (tab) {
    case "audit":
      return <AdminAuditLogsPanel />;
    case "activity":
      return <AdminActivityLogsPanel />;
    case "api":
      return <AdminApiLogsPanel />;
    case "login":
      return <AdminLoginHistoryPanel />;
    case "devices":
      return <DeviceList onToast={onToast} />;
    case "sessions":
      return <SessionList onToast={onToast} />;
    case "backups":
      return <AdminBackupPanel onToast={onToast} />;
    case "restore":
      return <RestorePanel onToast={onToast} />;
    case "health":
      return <SystemHealthCards />;
    case "performance":
      return <PerformanceCharts />;
    case "errors":
      return <ErrorList onToast={onToast} />;
    case "flags":
      return <FeatureFlagToggles onToast={onToast} />;
    case "maintenance":
      return <MaintenanceModeToggle onToast={onToast} />;
    case "eld":
      return <AdminEldQueuePanel />;
    case "support":
      return <AdminSupportQueue />;
    default:
      return <AdminAuditLogsPanel />;
  }
}

function AdminEldQueuePanel() {
  const store = useSyncExternalStore(
    subscribeEldStore,
    getEldStore,
    getEldStore,
  );
  return <EldAdminQueue requests={store.requests} />;
}
