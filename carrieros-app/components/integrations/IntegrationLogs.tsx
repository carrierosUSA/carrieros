"use client";

import { useMemo, useState } from "react";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import { getCatalogItem } from "@/lib/integrations/catalog";
import type {
  IntegrationLogEntry,
  IntegrationLogLevel,
  IntegrationProviderId,
} from "@/lib/integrations/types";

type IntegrationLogsProps = {
  logs: IntegrationLogEntry[];
};

const LEVEL_STYLES: Record<
  IntegrationLogLevel,
  { bg: string; text: string; border: string; label: string }
> = {
  success: { ...CARRIEROS_COLORS.success, label: "Success" },
  fail: { ...CARRIEROS_COLORS.critical, label: "Failed" },
  info: { ...CARRIEROS_COLORS.info, label: "Info" },
};

function formatTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function IntegrationLogs({ logs }: IntegrationLogsProps) {
  const [providerFilter, setProviderFilter] = useState<
    IntegrationProviderId | "all"
  >("all");
  const [levelFilter, setLevelFilter] = useState<IntegrationLogLevel | "all">(
    "all",
  );

  const providerOptions = useMemo(() => {
    const ids = Array.from(new Set(logs.map((l) => l.providerId)));
    return ids
      .map((id) => ({ id, name: getCatalogItem(id)?.name ?? id }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (providerFilter !== "all" && log.providerId !== providerFilter) {
        return false;
      }
      if (levelFilter !== "all" && log.level !== levelFilter) {
        return false;
      }
      return true;
    });
  }, [logs, providerFilter, levelFilter]);

  return (
    <section className="rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900">
            Activity logs
          </h2>
          <p className="mt-1 text-[13px] text-slate-500">
            Recent sync and API events across your integrations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={providerFilter}
            onChange={(e) =>
              setProviderFilter(
                e.target.value as IntegrationProviderId | "all",
              )
            }
            className="h-10 rounded-xl bg-[#F8FAFC] px-3 text-[13px] font-medium text-slate-700 outline-none ring-1 ring-[#E2E8F0] focus:ring-2 focus:ring-[#93C5FD]"
            aria-label="Filter by provider"
          >
            <option value="all">All providers</option>
            {providerOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
          </select>
          <select
            value={levelFilter}
            onChange={(e) =>
              setLevelFilter(e.target.value as IntegrationLogLevel | "all")
            }
            className="h-10 rounded-xl bg-[#F8FAFC] px-3 text-[13px] font-medium text-slate-700 outline-none ring-1 ring-[#E2E8F0] focus:ring-2 focus:ring-[#93C5FD]"
            aria-label="Filter by result"
          >
            <option value="all">All results</option>
            <option value="success">Success</option>
            <option value="fail">Failed</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-[12px] bg-[#F8FAFC] px-4 py-10 text-center">
          <p className="text-[14px] font-semibold text-slate-900">
            No matching events
          </p>
          <p className="mt-1 text-[13px] text-slate-500">
            Try a different provider or result filter.
          </p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-[#F1F5F9]">
          {filtered.map((log) => {
            const styles = LEVEL_STYLES[log.level];
            const name = getCatalogItem(log.providerId)?.name ?? log.providerId;

            return (
              <li
                key={log.id}
                className="flex flex-wrap items-start justify-between gap-3 py-3.5 first:pt-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-semibold text-slate-900">
                      {name}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${styles.bg} ${styles.text} ${styles.border}`}
                    >
                      {styles.label}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-5 text-slate-600">
                    {log.message}
                  </p>
                </div>
                <div className="shrink-0 text-right text-[12px] text-slate-400">
                  <p>{formatTime(log.timestamp)}</p>
                  {log.latencyMs != null ? (
                    <p className="mt-0.5 tabular-nums">{log.latencyMs}ms</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
