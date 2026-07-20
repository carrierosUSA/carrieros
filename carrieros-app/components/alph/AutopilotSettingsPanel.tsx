"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SettingsPanelFrame } from "@/components/settings/SettingsField";
import {
  AUTOPILOT_MODE_DESCRIPTIONS,
  AUTOPILOT_MODE_LABELS,
  AUTOPILOT_MODES,
  getAlphAutopilotSettings,
  saveAlphAutopilotSettings,
  type AlphAutopilotSettings,
  type AutopilotMode,
} from "@/lib/alph/autopilot";
import { getAlphProviderStatusAction } from "@/app/actions/alph-autopilot";

export default function AutopilotSettingsPanel() {
  const [settings, setSettings] = useState<AlphAutopilotSettings | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [providerNote, setProviderNote] = useState<string>("");

  useEffect(() => {
    setSettings(getAlphAutopilotSettings());
    void getAlphProviderStatusAction().then((status) => {
      setProviderNote(
        `${status.model.message} · ${status.ocr.message}`,
      );
    });
  }, []);

  if (!settings) {
    return (
      <SettingsPanelFrame
        title="Alph Autopilot"
        description="Loading company Autopilot preferences…"
      >
        <div className="h-24 animate-pulse rounded-[16px] bg-[#F1F5F9]" />
      </SettingsPanelFrame>
    );
  }

  function persist(patch: Partial<AlphAutopilotSettings>) {
    const next = saveAlphAutopilotSettings(patch);
    setSettings(next);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1600);
  }

  return (
    <SettingsPanelFrame
      title="Alph Autopilot"
      description="Assist, Approve, or Autopilot — money, payroll, tax, deletes, and legal always need a human."
    >
      <div className="grid gap-2 sm:grid-cols-3">
        {AUTOPILOT_MODES.map((mode) => {
          const active = settings.mode === mode;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => persist({ mode: mode as AutopilotMode })}
              className={`rounded-[14px] px-3 py-3 text-left transition ${
                active
                  ? "bg-[#EFF6FF] shadow-[inset_0_0_0_2px_#2563EB]"
                  : "bg-[#F8F9FB] hover:bg-[#F1F5F9]"
              }`}
            >
              <p className="text-[14px] font-semibold text-[#0F172A]">
                {AUTOPILOT_MODE_LABELS[mode]}
              </p>
              <p className="mt-1 text-[13px] leading-snug text-[#64748B]">
                {AUTOPILOT_MODE_DESCRIPTIONS[mode]}
              </p>
            </button>
          );
        })}
      </div>

      <label className="block space-y-2 rounded-[14px] bg-[#F8F9FB] px-4 py-4">
        <span className="text-[14px] font-semibold text-[#0F172A]">
          Minimum confidence to act ({Math.round(settings.minConfidenceToAct * 100)}%)
        </span>
        <input
          type="range"
          min={50}
          max={99}
          value={Math.round(settings.minConfidenceToAct * 100)}
          onChange={(e) =>
            persist({ minConfidenceToAct: Number(e.target.value) / 100 })
          }
          className="w-full accent-[#2563EB]"
        />
        <span className="block text-[13px] text-[#64748B]">
          Below this threshold, Alph queues for review even in Autopilot.
        </span>
      </label>

      <label className="flex cursor-pointer items-start gap-3 rounded-[14px] bg-[#F8F9FB] px-4 py-4">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-[#CBD5E1] text-[#2563EB]"
          checked={settings.allowDemoExtraction}
          onChange={(e) => persist({ allowDemoExtraction: e.target.checked })}
        />
        <span>
          <span className="block text-[15px] font-semibold text-[#0F172A]">
            Allow labeled demo OCR when providers are unset
          </span>
          <span className="mt-0.5 block text-[14px] text-[#64748B]">
            Deterministic seed parsers only — never pretended as live OCR/LLM.
          </span>
        </span>
      </label>

      <div className="space-y-2">
        <p className="text-[15px] font-semibold text-slate-950">
          Approval rules
        </p>
        {settings.approvalRules.map((rule) => (
          <label
            key={rule.id}
            className="flex items-start gap-3 rounded-[14px] bg-white px-4 py-3 ring-1 ring-[#EAEAEA]"
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-[#CBD5E1] text-[#2563EB]"
              checked={rule.requireApproval || rule.locked}
              disabled={rule.locked}
              onChange={(e) => {
                if (rule.locked) return;
                persist({
                  approvalRules: settings.approvalRules.map((r) =>
                    r.id === rule.id
                      ? { ...r, requireApproval: e.target.checked }
                      : r,
                  ),
                });
              }}
            />
            <span>
              <span className="block text-[14px] font-semibold text-[#0F172A]">
                {rule.label}
                {rule.locked ? (
                  <span className="ml-2 text-[12px] font-medium text-[#EA580C]">
                    Locked
                  </span>
                ) : null}
              </span>
              <span className="mt-0.5 block text-[13px] text-[#64748B]">
                {rule.description}
              </span>
            </span>
          </label>
        ))}
      </div>

      {providerNote ? (
        <p className="rounded-[14px] bg-[#EFF6FF] px-4 py-3 text-[13px] text-[#334155]">
          {providerNote}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Link
          href="/documents/inbox"
          className="inline-flex h-10 items-center rounded-[12px] bg-[#2563EB] px-4 text-[14px] font-semibold text-white transition hover:bg-[#1D4ED8]"
        >
          Open Document Inbox
        </Link>
        <Link
          href="/alph/history"
          className="inline-flex h-10 items-center rounded-[12px] bg-white px-4 text-[14px] font-semibold text-[#334155] ring-1 ring-[#E2E8F0] transition hover:ring-[#BFDBFE]"
        >
          Action history
        </Link>
        {savedFlash ? (
          <span className="inline-flex h-10 items-center text-[13px] font-semibold text-[#16A34A]">
            Saved
          </span>
        ) : null}
      </div>
    </SettingsPanelFrame>
  );
}
