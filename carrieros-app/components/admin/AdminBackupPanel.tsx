"use client";

import { useState } from "react";
import PremiumStatusBadge from "@/components/premium/StatusBadge";
import {
  formatAdminBytes,
  formatAdminWhen,
} from "@/components/admin/admin-format";
import { useAdminStore } from "@/hooks/useAdminStore";
import {
  createBackup,
  downloadBackupJson,
  setBackupSchedule,
} from "@/lib/admin/store";
import type { BackupSchedule } from "@/lib/admin/types";
import { logAction } from "@/lib/permissions/audit";

type AdminBackupPanelProps = {
  onToast: (message: string) => void;
};

export default function AdminBackupPanel({ onToast }: AdminBackupPanelProps) {
  const store = useAdminStore();
  const [creating, setCreating] = useState(false);

  function handleSchedule(schedule: BackupSchedule) {
    setBackupSchedule(schedule);
    logAction({
      action: "updated",
      resource: "admin.backup_schedule",
      details: `Set backup schedule to ${schedule}`,
    });
    onToast(
      schedule === "off"
        ? "Automatic backups turned off"
        : `Backups scheduled ${schedule}`,
    );
  }

  function handleCreate() {
    setCreating(true);
    window.setTimeout(() => {
      const backup = createBackup();
      logAction({
        action: "created",
        resource: "admin.backup",
        resourceId: backup.id,
        details: `Created backup “${backup.label}”`,
      });
      downloadBackupJson(backup);
      setCreating(false);
      onToast("Backup created and downloaded");
    }, 400);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-[#111827]">
          Backups
        </h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Create snapshots and choose how often Transpo.ai should run them.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-[14px] bg-[#F8FAFC] p-4 ring-1 ring-[#EAEAEA] sm:flex-row sm:items-end sm:justify-between">
        <label className="block space-y-1.5">
          <span className="text-[13px] font-medium text-[#374151]">
            Schedule
          </span>
          <select
            value={store.backupSchedule}
            onChange={(e) =>
              handleSchedule(e.target.value as BackupSchedule)
            }
            className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[14px] text-[#111827] outline-none ring-[#2563EB] focus:ring-2 sm:w-48"
          >
            <option value="off">Off</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </label>
        <button
          type="button"
          disabled={creating}
          onClick={handleCreate}
          className="h-10 rounded-xl bg-[#2563EB] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:opacity-60"
        >
          {creating ? "Creating…" : "Create backup"}
        </button>
      </div>

      <div className="divide-y divide-[#F1F5F9] overflow-hidden rounded-[14px] bg-white ring-1 ring-[#EAEAEA]">
        {store.backups.map((backup) => (
          <div
            key={backup.id}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[14px] font-semibold text-[#111827]">
                  {backup.label}
                </p>
                <PremiumStatusBadge
                  label={backup.status}
                  tone={
                    backup.status === "ready"
                      ? "green"
                      : backup.status === "failed"
                        ? "red"
                        : "amber"
                  }
                />
              </div>
              <p className="mt-0.5 text-[13px] text-[#6B7280]">
                {formatAdminWhen(backup.createdAt)} ·{" "}
                {formatAdminBytes(backup.sizeKb)} · {backup.createdBy}
                {backup.includesDocuments ? " · includes documents" : ""}
              </p>
            </div>
            <button
              type="button"
              disabled={backup.status !== "ready"}
              onClick={() => {
                downloadBackupJson(backup);
                onToast("Backup downloaded");
              }}
              className="h-9 shrink-0 rounded-xl bg-[#F5F7FA] px-3 text-[13px] font-semibold text-[#111827] transition hover:bg-[#EEF2F7] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Download JSON
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
