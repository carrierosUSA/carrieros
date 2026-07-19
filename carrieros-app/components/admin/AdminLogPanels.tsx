"use client";

import { useMemo, useState } from "react";
import PremiumStatusBadge from "@/components/premium/StatusBadge";
import { formatAdminWhen } from "@/components/admin/admin-format";
import AuditLogTable from "@/components/permissions/AuditLogTable";
import { useAdminStore } from "@/hooks/useAdminStore";

function LogToolbar({
  query,
  onQuery,
  placeholder,
  filterLabel,
  filterValue,
  onFilter,
  filterOptions,
}: {
  query: string;
  onQuery: (v: string) => void;
  placeholder: string;
  filterLabel?: string;
  filterValue?: string;
  onFilter?: (v: string) => void;
  filterOptions?: string[];
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="block min-w-0 flex-1 space-y-1.5">
        <span className="text-[13px] font-medium text-[#374151]">Search</span>
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[14px] text-[#111827] outline-none ring-[#2563EB] placeholder:text-[#9CA3AF] focus:ring-2"
        />
      </label>
      {filterLabel && onFilter && filterOptions ? (
        <label className="block w-full space-y-1.5 sm:w-48">
          <span className="text-[13px] font-medium text-[#374151]">
            {filterLabel}
          </span>
          <select
            value={filterValue ?? ""}
            onChange={(e) => onFilter(e.target.value)}
            className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[14px] text-[#111827] outline-none ring-[#2563EB] focus:ring-2"
          >
            <option value="">All</option>
            {filterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </div>
  );
}

function LogRows({
  empty,
  children,
}: {
  empty: boolean;
  children: React.ReactNode;
}) {
  if (empty) {
    return (
      <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-10 text-center text-[14px] text-[#6B7280]">
        No matching events.
      </div>
    );
  }
  return (
    <div className="divide-y divide-[#F1F5F9] overflow-hidden rounded-[14px] bg-white ring-1 ring-[#EAEAEA]">
      {children}
    </div>
  );
}

export function AdminAuditLogsPanel() {
  return (
    <div className="space-y-4">
      <PanelIntro
        title="Audit logs"
        description="Permission and security changes from the enterprise audit store."
      />
      <AuditLogTable />
    </div>
  );
}

export function AdminActivityLogsPanel() {
  const store = useAdminStore();
  const [query, setQuery] = useState("");
  const [module, setModule] = useState("");

  const modules = useMemo(() => {
    return Array.from(new Set(store.activityLogs.map((e) => e.module))).sort();
  }, [store.activityLogs]);

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return store.activityLogs.filter((e) => {
      if (module && e.module !== module) return false;
      if (!q) return true;
      return [e.userName, e.module, e.action, e.summary, e.entityId ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [store.activityLogs, query, module]);

  return (
    <div className="space-y-4">
      <PanelIntro
        title="Activity logs"
        description="User actions across Dispatch, Finance, Fleet, and more."
      />
      <LogToolbar
        query={query}
        onQuery={setQuery}
        placeholder="User, module, action…"
        filterLabel="Module"
        filterValue={module}
        onFilter={setModule}
        filterOptions={modules}
      />
      <p className="text-[13px] text-[#6B7280]">
        {entries.length} event{entries.length === 1 ? "" : "s"}
      </p>
      <LogRows empty={entries.length === 0}>
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex flex-col gap-1 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
          >
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-[#111827]">
                {entry.summary}
              </p>
              <p className="mt-0.5 text-[13px] text-[#6B7280]">
                {entry.userName} · {entry.module} · {entry.action}
                {entry.entityId ? ` · ${entry.entityId}` : ""}
              </p>
            </div>
            <p className="shrink-0 text-[13px] text-[#94A3B8]">
              {formatAdminWhen(entry.timestamp)}
            </p>
          </div>
        ))}
      </LogRows>
    </div>
  );
}

export function AdminApiLogsPanel() {
  const store = useAdminStore();
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("");

  const sources = useMemo(() => {
    return Array.from(new Set(store.apiLogs.map((e) => e.source))).sort();
  }, [store.apiLogs]);

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return store.apiLogs.filter((e) => {
      if (source && e.source !== source) return false;
      if (!q) return true;
      return [e.method, e.path, e.source, String(e.status)]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [store.apiLogs, query, source]);

  return (
    <div className="space-y-4">
      <PanelIntro
        title="API logs"
        description="Request method, path, status, latency, and integration source."
      />
      <LogToolbar
        query={query}
        onQuery={setQuery}
        placeholder="Path, method, source…"
        filterLabel="Source"
        filterValue={source}
        onFilter={setSource}
        filterOptions={sources}
      />
      <p className="text-[13px] text-[#6B7280]">
        {entries.length} request{entries.length === 1 ? "" : "s"}
      </p>
      <LogRows empty={entries.length === 0}>
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[12px] font-semibold text-[#334155]">
                  {entry.method}
                </span>
                <p className="truncate text-[14px] font-semibold text-[#111827]">
                  {entry.path}
                </p>
              </div>
              <p className="mt-1 text-[13px] text-[#6B7280]">
                {entry.source} · {entry.latencyMs} ms
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <PremiumStatusBadge
                label={String(entry.status)}
                tone={
                  entry.status >= 500
                    ? "red"
                    : entry.status >= 400
                      ? "amber"
                      : "green"
                }
              />
              <p className="text-[13px] text-[#94A3B8]">
                {formatAdminWhen(entry.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </LogRows>
    </div>
  );
}

export function AdminLoginHistoryPanel() {
  const store = useAdminStore();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return store.loginHistory.filter((e) => {
      if (result === "success" && !e.success) return false;
      if (result === "fail" && e.success) return false;
      if (!q) return true;
      return [e.userName, e.ip, e.location, e.reason ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [store.loginHistory, query, result]);

  return (
    <div className="space-y-4">
      <PanelIntro
        title="Login history"
        description="Who signed in, from where, and whether it succeeded."
      />
      <LogToolbar
        query={query}
        onQuery={setQuery}
        placeholder="User, IP, location…"
        filterLabel="Result"
        filterValue={result}
        onFilter={setResult}
        filterOptions={["success", "fail"]}
      />
      <p className="text-[13px] text-[#6B7280]">
        {entries.length} attempt{entries.length === 1 ? "" : "s"}
      </p>
      <LogRows empty={entries.length === 0}>
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-[#111827]">
                {entry.userName}
              </p>
              <p className="mt-0.5 text-[13px] text-[#6B7280]">
                {entry.ip} · {entry.location}
                {entry.reason ? ` · ${entry.reason}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <PremiumStatusBadge
                label={entry.success ? "Success" : "Failed"}
                tone={entry.success ? "green" : "red"}
              />
              <p className="text-[13px] text-[#94A3B8]">
                {formatAdminWhen(entry.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </LogRows>
    </div>
  );
}

function PanelIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight text-[#111827]">
        {title}
      </h2>
      <p className="mt-1 text-[14px] text-[#6B7280]">{description}</p>
    </div>
  );
}
