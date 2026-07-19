"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  SettingsPanelFrame,
  settingsInputClass,
} from "@/components/settings/SettingsField";
import type { CarrierSettingsState } from "@/lib/settings/types";

type AuditLogsPanelProps = {
  settings: CarrierSettingsState;
};

export default function AuditLogsPanel({ settings }: AuditLogsPanelProps) {
  const [query, setQuery] = useState("");

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return settings.auditLog;
    return settings.auditLog.filter((entry) => {
      const hay = [
        entry.actorName,
        entry.action,
        entry.resource,
        entry.details,
        entry.ip ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [query, settings.auditLog]);

  return (
    <SettingsPanelFrame
      title="Audit logs"
      description="Searchable history of settings changes. Backed by the local settings audit store."
    >
      <Link
        href="/admin?tab=audit"
        className="inline-flex h-9 items-center self-start rounded-xl bg-[#EFF6FF] px-3 text-[13px] font-semibold text-[#2563EB] ring-1 ring-[#BFDBFE] hover:bg-[#DBEAFE]"
      >
        Open System Admin audit logs
      </Link>

      <input
        className={settingsInputClass}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by person, action, or detail…"
      />

      <div className="space-y-2">
        {entries.length === 0 ? (
          <p className="rounded-[14px] bg-[#F8FAFC] px-4 py-6 text-center text-[14px] text-slate-500">
            No audit entries match your search.
          </p>
        ) : (
          entries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-[14px] bg-white px-4 py-3.5 ring-1 ring-[#EAEAEA]"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[15px] font-semibold text-slate-950">
                    {entry.actorName}{" "}
                    <span className="font-medium text-slate-500">
                      {entry.action}
                    </span>{" "}
                    {entry.resource}
                  </p>
                  <p className="mt-1 text-[14px] text-slate-600">
                    {entry.details}
                  </p>
                </div>
                <time className="shrink-0 text-[13px] text-slate-500">
                  {new Date(entry.timestamp).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </time>
              </div>
              {entry.ip ? (
                <p className="mt-2 font-mono text-[12px] text-slate-400">
                  {entry.ip}
                </p>
              ) : null}
            </article>
          ))
        )}
      </div>
    </SettingsPanelFrame>
  );
}
