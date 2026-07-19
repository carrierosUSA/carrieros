"use client";

import Link from "next/link";
import { SettingsPanelFrame } from "@/components/settings/SettingsField";
import type { CarrierSettingsState } from "@/lib/settings/types";

type AutomationPanelProps = {
  settings: CarrierSettingsState;
};

export default function AutomationPanel({ settings }: AutomationPanelProps) {
  const enabled = settings.workflowSummaries.filter((w) => w.enabled);
  const disabled = settings.workflowSummaries.filter((w) => !w.enabled);

  return (
    <SettingsPanelFrame
      title="Automation"
      description="Workflows that run when loads, documents, and invoices change."
    >
      <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-3">
        <p className="text-[13px] font-semibold text-[#334155]">
          Governed by Trust & Safety Charter
        </p>
        <p className="mt-0.5 text-[13px] text-[#64748B]">
          High-risk actions never auto-run. Review Alph rules anytime.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href="/platform/foundation"
            className="text-[13px] font-semibold text-[#2563EB] hover:underline"
          >
            Foundation
          </Link>
          <span className="text-[#CBD5E1]">·</span>
          <Link
            href="/platform/trust-charter"
            className="text-[13px] font-semibold text-[#2563EB] hover:underline"
          >
            Trust Charter
          </Link>
          <span className="text-[#CBD5E1]">·</span>
          <Link
            href="/platform/constitution"
            className="text-[13px] font-semibold text-[#2563EB] hover:underline"
          >
            Constitution
          </Link>
          <span className="text-[#CBD5E1]">·</span>
          <Link
            href="/platform/ai-policy"
            className="text-[13px] font-semibold text-[#2563EB] hover:underline"
          >
            AI Safety Policy
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-[#EFF6FF] px-4 py-4">
        <div>
          <p className="text-[15px] font-semibold text-slate-950">
            {enabled.length} workflows enabled
          </p>
          <p className="mt-0.5 text-[14px] text-slate-600">
            Manage triggers and actions in the Workflows module.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/advanced/view/automation"
            className="inline-flex h-10 items-center rounded-[12px] bg-white px-4 text-[14px] font-semibold text-[#2563EB] ring-1 ring-[#BFDBFE] transition hover:bg-[#EFF6FF]"
          >
            Open Advanced
          </Link>
          <Link
            href="/workflows"
            className="inline-flex h-10 items-center rounded-[12px] bg-[#2563EB] px-4 text-[14px] font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            Open workflows
          </Link>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[15px] font-semibold text-slate-950">Enabled</p>
        {enabled.length === 0 ? (
          <p className="text-[14px] text-slate-500">No workflows enabled.</p>
        ) : (
          enabled.map((wf) => (
            <div
              key={wf.id}
              className="rounded-[14px] bg-white px-4 py-3 ring-1 ring-[#EAEAEA]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[15px] font-semibold text-slate-950">
                  {wf.name}
                </p>
                <span className="rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[12px] font-semibold text-[#15803D]">
                  On
                </span>
              </div>
              <p className="mt-1 text-[13px] text-slate-500">
                Trigger: {wf.triggerLabel}
                {wf.lastRunAt
                  ? ` · Last run ${new Date(wf.lastRunAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}`
                  : ""}
              </p>
            </div>
          ))
        )}
      </div>

      {disabled.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[15px] font-semibold text-slate-950">Paused</p>
          {disabled.map((wf) => (
            <div
              key={wf.id}
              className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[15px] font-semibold text-slate-700">
                  {wf.name}
                </p>
                <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[12px] font-semibold text-slate-500">
                  Off
                </span>
              </div>
              <p className="mt-1 text-[13px] text-slate-500">
                Trigger: {wf.triggerLabel}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </SettingsPanelFrame>
  );
}
