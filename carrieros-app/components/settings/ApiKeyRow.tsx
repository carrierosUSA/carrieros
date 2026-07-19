"use client";

import { useState } from "react";
import ActionTooltip from "@/components/ui/ActionTooltip";
import { maskApiKey } from "@/lib/settings/settings-store";
import type { ApiKeyRecord } from "@/lib/settings/types";

type ApiKeyRowProps = {
  apiKey: ApiKeyRecord;
  onRevoke: () => void;
};

export default function ApiKeyRow({ apiKey, onRevoke }: ApiKeyRowProps) {
  const [copied, setCopied] = useState(false);
  const revoked = Boolean(apiKey.revokedAt);
  const display = maskApiKey(apiKey.prefix, apiKey.lastFour);

  async function copyMasked() {
    try {
      await navigator.clipboard.writeText(display);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard may be blocked
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-[14px] bg-[#F8FAFC] px-4 py-3.5 ring-1 ring-[#EAEAEA] sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[15px] font-semibold text-slate-950">{apiKey.name}</p>
          {revoked ? (
            <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[12px] font-semibold text-slate-500">
              Revoked
            </span>
          ) : (
            <span className="rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[12px] font-semibold text-[#15803D]">
              Active
            </span>
          )}
        </div>
        <p className="mt-1 font-mono text-[14px] tracking-wide text-slate-700">
          {display}
        </p>
        <p className="mt-1 text-[13px] text-slate-500">
          Created{" "}
          {new Date(apiKey.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          {" · "}
          {apiKey.lastUsedAt
            ? `Last used ${new Date(apiKey.lastUsedAt).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}`
            : "Never used"}
        </p>
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={copyMasked}
          className="inline-flex h-9 items-center rounded-[10px] bg-white px-3 text-[13px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA] transition hover:bg-slate-50"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <ActionTooltip
          label="Revoke"
          disabled={revoked}
          reason="This key is already revoked."
        >
          <button
            type="button"
            onClick={onRevoke}
            disabled={revoked}
            className="inline-flex h-9 items-center rounded-[10px] bg-white px-3 text-[13px] font-semibold text-[#B91C1C] ring-1 ring-[#FECACA] transition hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:text-slate-400 disabled:ring-[#EAEAEA] disabled:hover:bg-white"
          >
            Revoke
          </button>
        </ActionTooltip>
      </div>
    </div>
  );
}
