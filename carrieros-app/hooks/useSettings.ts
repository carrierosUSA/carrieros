"use client";

import { useEffect, useState } from "react";
import { getCurrentSession } from "@/lib/auth/session";
import {
  appendAuditEntry,
  loadSettings,
  saveSettings,
} from "@/lib/settings/settings-store";
import type { CarrierSettingsState } from "@/lib/settings/types";

export function useSettings() {
  const [settings, setSettings] = useState<CarrierSettingsState | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  function update(updater: (prev: CarrierSettingsState) => CarrierSettingsState) {
    setSettings((prev) => {
      if (!prev) return prev;
      setDirty(true);
      setSavedFlash(false);
      return updater(prev);
    });
  }

  function persist(
    next: CarrierSettingsState,
    audit?: { action: string; resource: string; details: string },
  ) {
    setSaving(true);
    const session = getCurrentSession();
    let toSave = next;
    if (audit) {
      toSave = appendAuditEntry(next, {
        actorName: session.name,
        action: audit.action,
        resource: audit.resource,
        details: audit.details,
        ip: "198.51.100.24",
      });
    }
    const saved = saveSettings(toSave);
    setSettings(saved);
    setDirty(false);
    setSaving(false);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
    return saved;
  }

  function save(resource: string, details: string) {
    if (!settings) return;
    persist(settings, { action: "updated", resource, details });
  }

  return {
    settings,
    hydrated: settings !== null,
    dirty,
    saving,
    savedFlash,
    update,
    persist,
    save,
    setSettings,
  };
}
