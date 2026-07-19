"use client";

import Link from "next/link";
import {
  SettingsField,
  SettingsPanelFrame,
  SettingsSaveButton,
  settingsSelectClass,
} from "@/components/settings/SettingsField";
import { downloadSettingsExport } from "@/lib/settings/settings-store";
import type { BackupSettings, CarrierSettingsState } from "@/lib/settings/types";

type BackupPanelProps = {
  settings: CarrierSettingsState;
  dirty: boolean;
  saving: boolean;
  savedFlash: boolean;
  onChange: (patch: Partial<BackupSettings>) => void;
  onSave: () => void;
  onBackupNow: () => void;
};

export default function BackupPanel({
  settings,
  dirty,
  saving,
  savedFlash,
  onChange,
  onSave,
  onBackupNow,
}: BackupPanelProps) {
  const b = settings.backup;

  return (
    <SettingsPanelFrame
      title="Backup"
      description="Export workspace settings and choose how often Transpo.ai should snapshot."
      footer={
        <SettingsSaveButton
          onClick={onSave}
          disabled={!dirty}
          saving={saving}
          saved={savedFlash}
          disabledReason="No changes to save."
        />
      }
    >
      <div className="rounded-[16px] bg-[#F8FAFC] px-4 py-4 ring-1 ring-[#EAEAEA]">
        <p className="text-[13px] font-medium text-slate-500">Last backup</p>
        <p className="mt-1 text-[18px] font-bold text-slate-950">
          {b.lastBackupAt
            ? new Date(b.lastBackupAt).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })
            : "Never"}
        </p>
      </div>

      <SettingsField label="Schedule">
        <select
          className={settingsSelectClass}
          value={b.schedule}
          onChange={(e) =>
            onChange({ schedule: e.target.value as BackupSettings["schedule"] })
          }
        >
          <option value="off">Off</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </SettingsField>

      <button
        type="button"
        onClick={() => onChange({ includeDocuments: !b.includeDocuments })}
        className="flex w-full items-center justify-between rounded-[14px] bg-white px-4 py-3.5 text-left ring-1 ring-[#EAEAEA]"
      >
        <div>
          <p className="text-[15px] font-semibold text-slate-950">
            Include documents metadata
          </p>
          <p className="mt-0.5 text-[13px] text-slate-500">
            File binaries stay in Document Center; export includes packet settings only.
          </p>
        </div>
        <span
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full ${
            b.includeDocuments ? "bg-[#2563EB]" : "bg-slate-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
              b.includeDocuments ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </span>
      </button>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onBackupNow}
          className="inline-flex h-10 items-center rounded-[12px] bg-[#2563EB] px-4 text-[14px] font-semibold text-white transition hover:bg-[#1D4ED8]"
        >
          Backup now
        </button>
        <button
          type="button"
          onClick={() => downloadSettingsExport(settings)}
          className="inline-flex h-10 items-center rounded-[12px] bg-white px-4 text-[14px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA] transition hover:bg-slate-50"
        >
          Download JSON export
        </button>
        <Link
          href="/admin?tab=backups"
          className="inline-flex h-10 items-center rounded-[12px] bg-white px-4 text-[14px] font-semibold text-[#2563EB] ring-1 ring-[#EAEAEA] transition hover:bg-[#EFF6FF]"
        >
          Open System Admin backups
        </Link>
      </div>
    </SettingsPanelFrame>
  );
}
