"use client";

import { useState } from "react";
import ApiKeyRow from "@/components/settings/ApiKeyRow";
import ActionTooltip from "@/components/ui/ActionTooltip";
import {
  SettingsField,
  SettingsPanelFrame,
  settingsInputClass,
} from "@/components/settings/SettingsField";
import { generateApiKeyMaterial } from "@/lib/settings/settings-store";
import type { ApiKeyRecord, CarrierSettingsState } from "@/lib/settings/types";

type ApiKeysPanelProps = {
  settings: CarrierSettingsState;
  onChange: (keys: ApiKeyRecord[]) => void;
  onPersist: (keys: ApiKeyRecord[], details: string) => void;
};

export default function ApiKeysPanel({
  settings,
  onChange,
  onPersist,
}: ApiKeysPanelProps) {
  const [name, setName] = useState("");
  const [revealed, setRevealed] = useState<string | null>(null);

  const canCreate = name.trim().length > 1;

  function createKey() {
    if (!canCreate) return;
    const material = generateApiKeyMaterial();
    const record: ApiKeyRecord = {
      id: `key-${Date.now()}`,
      name: name.trim(),
      prefix: material.prefix,
      lastFour: material.lastFour,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      revokedAt: null,
    };
    const next = [record, ...settings.apiKeys];
    onChange(next);
    onPersist(next, `Created API key “${record.name}”`);
    setName("");
    setRevealed(material.fullKey);
  }

  function revoke(id: string) {
    const key = settings.apiKeys.find((k) => k.id === id);
    if (!key || key.revokedAt) return;
    const next = settings.apiKeys.map((k) =>
      k.id === id ? { ...k, revokedAt: new Date().toISOString() } : k,
    );
    onChange(next);
    onPersist(next, `Revoked API key “${key.name}”`);
  }

  return (
    <SettingsPanelFrame
      title="API keys"
      description="Create and revoke keys for integrations. Keys are shown masked after creation."
    >
      <div className="rounded-[16px] bg-[#F8FAFC] p-4 ring-1 ring-[#EAEAEA]">
        <p className="text-[15px] font-semibold text-slate-950">Create key</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <SettingsField label="Name" className="flex-1">
            <input
              className={settingsInputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Load board sync"
            />
          </SettingsField>
          <div className="flex items-end">
            <ActionTooltip
              label="Create key"
              disabled={!canCreate}
              reason="Enter a name for this API key."
            >
              <button
                type="button"
                onClick={createKey}
                disabled={!canCreate}
                className="inline-flex h-10 items-center rounded-[12px] bg-[#2563EB] px-4 text-[14px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Create key
              </button>
            </ActionTooltip>
          </div>
        </div>
        {revealed ? (
          <div className="mt-3 rounded-[12px] bg-[#ECFDF5] px-3 py-3 text-[13px] text-[#166534]">
            Copy now — this is the only time the full key is shown:{" "}
            <code className="font-mono font-semibold">{revealed}</code>
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        {settings.apiKeys.map((key) => (
          <ApiKeyRow
            key={key.id}
            apiKey={key}
            onRevoke={() => revoke(key.id)}
          />
        ))}
      </div>
    </SettingsPanelFrame>
  );
}
