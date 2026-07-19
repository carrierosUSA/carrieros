"use client";

import { useMemo, useState } from "react";
import PremiumStatusBadge from "@/components/premium/StatusBadge";
import { formatAdminWhen } from "@/components/admin/admin-format";
import { useAdminStore } from "@/hooks/useAdminStore";
import { resolveError } from "@/lib/admin/store";
import type { ErrorSeverity } from "@/lib/admin/types";
import { logAction } from "@/lib/permissions/audit";

type ErrorListProps = {
  onToast: (message: string) => void;
};

function severityTone(
  severity: ErrorSeverity,
): "red" | "amber" | "blue" | "slate" {
  switch (severity) {
    case "critical":
      return "red";
    case "warning":
      return "amber";
    case "info":
      return "blue";
    default:
      return "slate";
  }
}

export default function ErrorList({ onToast }: ErrorListProps) {
  const store = useAdminStore();
  const [showResolved, setShowResolved] = useState(false);

  const entries = useMemo(() => {
    return store.errors.filter((e) => showResolved || !e.resolved);
  }, [store.errors, showResolved]);

  function handleResolve(id: string) {
    const resolved = resolveError(id);
    if (!resolved) return;
    logAction({
      action: "resolved",
      resource: "admin.error",
      resourceId: id,
      details: `Resolved error: ${resolved.message}`,
    });
    onToast("Error marked resolved");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[#111827]">
            Error monitoring
          </h2>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            Recent failures with stack snippets. Resolve when handled.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowResolved((v) => !v)}
          className="h-9 shrink-0 rounded-xl bg-[#F5F7FA] px-3 text-[13px] font-semibold text-[#111827] hover:bg-[#EEF2F7]"
        >
          {showResolved ? "Hide resolved" : "Show resolved"}
        </button>
      </div>

      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-10 text-center text-[14px] text-[#6B7280]">
            No open errors.
          </div>
        ) : (
          entries.map((error) => (
            <div
              key={error.id}
              className={`rounded-[14px] bg-white p-4 ring-1 ${
                error.severity === "critical" && !error.resolved
                  ? "ring-[#FECACA]"
                  : "ring-[#EAEAEA]"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <PremiumStatusBadge
                      label={error.severity}
                      tone={severityTone(error.severity)}
                    />
                    {error.resolved ? (
                      <PremiumStatusBadge label="Resolved" tone="green" />
                    ) : null}
                    <span className="text-[12px] font-medium text-[#94A3B8]">
                      ×{error.count}
                    </span>
                  </div>
                  <p className="mt-2 text-[14px] font-semibold text-[#111827]">
                    {error.message}
                  </p>
                  <p className="mt-0.5 text-[13px] text-[#6B7280]">
                    {error.source} · {formatAdminWhen(error.timestamp)}
                  </p>
                </div>
                {!error.resolved ? (
                  <button
                    type="button"
                    onClick={() => handleResolve(error.id)}
                    className="h-9 shrink-0 rounded-xl bg-[#ECFDF3] px-3 text-[13px] font-semibold text-[#16A34A] hover:bg-[#DCFCE7]"
                  >
                    Resolve
                  </button>
                ) : null}
              </div>
              <pre className="mt-3 overflow-x-auto rounded-[12px] bg-[#0F172A] px-3 py-2.5 text-[12px] leading-5 text-[#E2E8F0]">
                {error.stackSnippet}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
