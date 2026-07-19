"use client";

import { useState } from "react";
import {
  formatAdminBytes,
  formatAdminWhen,
} from "@/components/admin/admin-format";
import { useAdminStore } from "@/hooks/useAdminStore";
import { simulateRestore } from "@/lib/admin/store";
import { logAction } from "@/lib/permissions/audit";

type RestorePanelProps = {
  onToast: (message: string) => void;
};

export default function RestorePanel({ onToast }: RestorePanelProps) {
  const store = useAdminStore();
  const [selectedId, setSelectedId] = useState(store.backups[0]?.id ?? "");
  const [confirming, setConfirming] = useState(false);

  const selected = store.backups.find((b) => b.id === selectedId);

  function handleRestore() {
    if (!selected) return;
    const result = simulateRestore(selected.id);
    logAction({
      action: "restore_simulated",
      resource: "admin.backup",
      resourceId: selected.id,
      details: result.message,
    });
    setConfirming(false);
    onToast(result.message);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-[#111827]">
          Restore
        </h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Select a backup to simulate a restore. Live data is never wiped in
          this demo.
        </p>
      </div>

      <label className="block space-y-1.5">
        <span className="text-[13px] font-medium text-[#374151]">
          Backup
        </span>
        <select
          value={selectedId}
          onChange={(e) => {
            setSelectedId(e.target.value);
            setConfirming(false);
          }}
          className="h-10 w-full max-w-lg rounded-xl border border-[#E5E7EB] bg-white px-3 text-[14px] text-[#111827] outline-none ring-[#2563EB] focus:ring-2"
        >
          {store.backups.map((backup) => (
            <option key={backup.id} value={backup.id}>
              {backup.label} — {formatAdminWhen(backup.createdAt)}
            </option>
          ))}
        </select>
      </label>

      {selected ? (
        <div className="rounded-[14px] bg-[#F8FAFC] p-4 ring-1 ring-[#EAEAEA]">
          <p className="text-[14px] font-semibold text-[#111827]">
            {selected.label}
          </p>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            {formatAdminWhen(selected.createdAt)} ·{" "}
            {formatAdminBytes(selected.sizeKb)} · {selected.createdBy}
          </p>
        </div>
      ) : null}

      {!confirming ? (
        <button
          type="button"
          disabled={!selected}
          onClick={() => setConfirming(true)}
          className="h-10 rounded-xl bg-[#EA580C] px-4 text-[13px] font-semibold text-white transition hover:bg-[#C2410C] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Restore from backup
        </button>
      ) : (
        <div className="rounded-[14px] border border-[#FED7AA] bg-[#FFF7ED] p-4">
          <p className="text-[14px] font-semibold text-[#9A3412]">
            Confirm simulated restore
          </p>
          <p className="mt-1 text-[13px] leading-5 text-[#C2410C]">
            This writes an activity log and shows a success toast. It will not
            overwrite real Transpo.ai data.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleRestore}
              className="h-9 rounded-xl bg-[#EA580C] px-3 text-[13px] font-semibold text-white hover:bg-[#C2410C]"
            >
              Confirm restore
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="h-9 rounded-xl bg-white px-3 text-[13px] font-semibold text-[#111827] ring-1 ring-[#EAEAEA]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
