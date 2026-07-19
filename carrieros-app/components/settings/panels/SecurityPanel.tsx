"use client";

import { useState } from "react";
import Link from "next/link";
import ActionTooltip from "@/components/ui/ActionTooltip";
import {
  SettingsField,
  SettingsPanelFrame,
  SettingsSaveButton,
  settingsInputClass,
  settingsSelectClass,
} from "@/components/settings/SettingsField";
import type { CarrierSettingsState, SecuritySettings } from "@/lib/settings/types";

type SecurityPanelProps = {
  settings: CarrierSettingsState;
  dirty: boolean;
  saving: boolean;
  savedFlash: boolean;
  onChange: (patch: Partial<SecuritySettings>) => void;
  onSave: () => void;
};

export default function SecurityPanel({
  settings,
  dirty,
  saving,
  savedFlash,
  onChange,
  onSave,
}: SecurityPanelProps) {
  const s = settings.security;
  const [ipDraft, setIpDraft] = useState("");

  function addIp() {
    const value = ipDraft.trim();
    if (!value || s.ipAllowlist.includes(value)) return;
    onChange({ ipAllowlist: [...s.ipAllowlist, value] });
    setIpDraft("");
  }

  return (
    <SettingsPanelFrame
      title="Security"
      description="Two-factor auth, sessions, password policy, and IP allowlist."
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
      <div className="rounded-[14px] bg-[#EFF6FF] px-4 py-3 ring-1 ring-[#BFDBFE]">
        <p className="text-[14px] font-semibold text-[#1E40AF]">
          System Administration
        </p>
        <p className="mt-0.5 text-[13px] text-[#2563EB]">
          Sessions, devices, login history, and maintenance live in Admin.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href="/admin?tab=sessions"
            className="rounded-lg bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#2563EB] ring-1 ring-[#BFDBFE] hover:bg-[#DBEAFE]"
          >
            Sessions
          </Link>
          <Link
            href="/admin?tab=login"
            className="rounded-lg bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#2563EB] ring-1 ring-[#BFDBFE] hover:bg-[#DBEAFE]"
          >
            Login history
          </Link>
          <Link
            href="/admin?tab=devices"
            className="rounded-lg bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#2563EB] ring-1 ring-[#BFDBFE] hover:bg-[#DBEAFE]"
          >
            Devices
          </Link>
        </div>
      </div>

      <ToggleRow
        label="Require 2FA for all users"
        description="Owners and admins must verify with an authenticator app."
        checked={s.require2fa}
        onToggle={() => onChange({ require2fa: !s.require2fa })}
      />

      <SettingsField label="Session timeout">
        <select
          className={settingsSelectClass}
          value={s.sessionTimeoutMinutes}
          onChange={(e) =>
            onChange({ sessionTimeoutMinutes: Number(e.target.value) })
          }
        >
          <option value={30}>30 minutes</option>
          <option value={60}>1 hour</option>
          <option value={240}>4 hours</option>
          <option value={480}>8 hours</option>
        </select>
      </SettingsField>

      <div className="rounded-[16px] bg-[#F8FAFC] p-4 ring-1 ring-[#EAEAEA]">
        <p className="text-[15px] font-semibold text-slate-950">Password policy</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <SettingsField label="Minimum length">
            <input
              type="number"
              min={8}
              max={64}
              className={settingsInputClass}
              value={s.minPasswordLength}
              onChange={(e) =>
                onChange({ minPasswordLength: Number(e.target.value) || 8 })
              }
            />
          </SettingsField>
        </div>
        <div className="mt-3 space-y-2">
          <ToggleRow
            label="Require a number"
            checked={s.requireNumber}
            onToggle={() => onChange({ requireNumber: !s.requireNumber })}
          />
          <ToggleRow
            label="Require a special character"
            checked={s.requireSpecialChar}
            onToggle={() =>
              onChange({ requireSpecialChar: !s.requireSpecialChar })
            }
          />
        </div>
      </div>

      <div className="rounded-[16px] bg-white p-4 ring-1 ring-[#EAEAEA]">
        <ToggleRow
          label="IP allowlist"
          description="Only listed networks can sign in. Demo stub — not enforced yet."
          checked={s.ipAllowlistEnabled}
          onToggle={() =>
            onChange({ ipAllowlistEnabled: !s.ipAllowlistEnabled })
          }
        />
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            className={settingsInputClass}
            value={ipDraft}
            onChange={(e) => setIpDraft(e.target.value)}
            placeholder="e.g. 198.51.100.0/24"
            disabled={!s.ipAllowlistEnabled}
          />
          <ActionTooltip
            label="Add IP"
            disabled={!s.ipAllowlistEnabled || !ipDraft.trim()}
            reason={
              !s.ipAllowlistEnabled
                ? "Turn on IP allowlist first."
                : "Enter an IP or CIDR range."
            }
          >
            <button
              type="button"
              onClick={addIp}
              disabled={!s.ipAllowlistEnabled || !ipDraft.trim()}
              className="inline-flex h-10 items-center rounded-[12px] bg-[#2563EB] px-4 text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Add
            </button>
          </ActionTooltip>
        </div>
        {s.ipAllowlist.length > 0 ? (
          <ul className="mt-3 space-y-1.5">
            {s.ipAllowlist.map((ip) => (
              <li
                key={ip}
                className="flex items-center justify-between rounded-[10px] bg-[#F8FAFC] px-3 py-2 text-[14px] text-slate-700"
              >
                <span className="font-mono">{ip}</span>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ipAllowlist: s.ipAllowlist.filter((x) => x !== ip),
                    })
                  }
                  className="text-[13px] font-semibold text-[#B91C1C]"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-[13px] text-slate-500">No IPs listed yet.</p>
        )}
      </div>
    </SettingsPanelFrame>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onToggle,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-3 rounded-[14px] bg-[#F8FAFC] px-4 py-3.5 text-left ring-1 ring-[#EAEAEA]"
    >
      <div>
        <p className="text-[15px] font-semibold text-slate-950">{label}</p>
        {description ? (
          <p className="mt-0.5 text-[13px] text-slate-500">{description}</p>
        ) : null}
      </div>
      <span
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full ${
          checked ? "bg-[#2563EB]" : "bg-slate-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}
