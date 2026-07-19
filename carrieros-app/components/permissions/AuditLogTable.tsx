"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { filterAuditLog } from "@/lib/permissions/audit";
import {
  getPermissionsStore,
  subscribePermissionsStore,
} from "@/lib/permissions/store";

function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function AuditLogTable() {
  const store = useSyncExternalStore(
    subscribePermissionsStore,
    getPermissionsStore,
    getPermissionsStore,
  );
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("");
  const [resource, setResource] = useState("");

  const entries = useMemo(
    () =>
      filterAuditLog({
        query,
        action: action || undefined,
        resource: resource || undefined,
      }),
    [query, action, resource, store.auditLog],
  );

  const actions = useMemo(() => {
    const set = new Set(store.auditLog.map((e) => e.action));
    return Array.from(set).sort();
  }, [store.auditLog]);

  const resources = useMemo(() => {
    const set = new Set(
      store.auditLog.map((e) => e.resource.split(".")[0] ?? e.resource),
    );
    return Array.from(set).sort();
  }, [store.auditLog]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <label className="block min-w-0 flex-1 space-y-1.5">
          <span className="text-[13px] font-medium text-[#374151]">Search</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Actor, action, resource, details…"
            className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[14px] text-[#111827] outline-none ring-[#2563EB] placeholder:text-[#9CA3AF] focus:ring-2"
          />
        </label>
        <label className="block w-full space-y-1.5 sm:w-44">
          <span className="text-[13px] font-medium text-[#374151]">Action</span>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[14px] text-[#111827] outline-none ring-[#2563EB] focus:ring-2"
          >
            <option value="">All actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label className="block w-full space-y-1.5 sm:w-44">
          <span className="text-[13px] font-medium text-[#374151]">
            Resource
          </span>
          <select
            value={resource}
            onChange={(e) => setResource(e.target.value)}
            className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[14px] text-[#111827] outline-none ring-[#2563EB] focus:ring-2"
          >
            <option value="">All resources</option>
            {resources.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-[13px] text-[#6B7280]">
        {entries.length} event{entries.length === 1 ? "" : "s"}
      </p>

      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#EAEAEA]">
        <div className="divide-y divide-[#F1F5F9]">
          {entries.length === 0 ? (
            <div className="px-5 py-10 text-center text-[14px] text-[#6B7280]">
              No audit events match these filters.
            </div>
          ) : (
            entries.map((entry) => (
              <article
                key={entry.id}
                className="flex flex-col gap-2 px-5 py-4 transition hover:bg-[#F8FAFC] sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-[14px] font-semibold text-[#111827]">
                      {entry.actorName}
                    </span>
                    <span className="text-[12px] font-medium text-[#6B7280]">
                      {entry.role}
                    </span>
                    <span className="rounded-md bg-[#EFF6FF] px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#2563EB]">
                      {entry.action}
                    </span>
                    <span className="text-[12px] text-[#6B7280]">
                      {entry.resource}
                      {entry.resourceId ? ` · ${entry.resourceId}` : ""}
                    </span>
                  </div>
                  <p className="text-[14px] leading-5 text-[#374151]">
                    {entry.details}
                  </p>
                </div>
                <div className="shrink-0 text-left sm:text-right">
                  <p className="text-[13px] font-medium text-[#111827]">
                    {formatWhen(entry.timestamp)}
                  </p>
                  {entry.ip ? (
                    <p className="mt-0.5 text-[12px] text-[#9CA3AF]">
                      {entry.ip}
                    </p>
                  ) : null}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
