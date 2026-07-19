import { createDefaultSettings } from "@/lib/settings/defaults";
import type {
  CarrierSettingsState,
  SettingsAuditEntry,
} from "@/lib/settings/types";

export const SETTINGS_STORAGE_KEY = "carrieros.settings.v1";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function mergeSettings(
  base: CarrierSettingsState,
  partial: Partial<CarrierSettingsState>,
): CarrierSettingsState {
  return {
    ...base,
    ...partial,
    company: { ...base.company, ...partial.company },
    billing: {
      ...base.billing,
      ...partial.billing,
      invoices: partial.billing?.invoices ?? base.billing.invoices,
    },
    subscription: { ...base.subscription, ...partial.subscription },
    notifications: {
      ...base.notifications,
      ...partial.notifications,
      channels: {
        ...base.notifications.channels,
        ...partial.notifications?.channels,
      },
    },
    branding: { ...base.branding, ...partial.branding },
    invoiceTemplate: {
      ...base.invoiceTemplate,
      ...partial.invoiceTemplate,
    },
    documentTemplates: {
      ...base.documentTemplates,
      ...partial.documentTemplates,
      packets:
        partial.documentTemplates?.packets ?? base.documentTemplates.packets,
    },
    backup: { ...base.backup, ...partial.backup },
    security: {
      ...base.security,
      ...partial.security,
      ipAllowlist: partial.security?.ipAllowlist ?? base.security.ipAllowlist,
    },
    users: partial.users ?? base.users,
    emailTemplates: partial.emailTemplates ?? base.emailTemplates,
    smsTemplates: partial.smsTemplates ?? base.smsTemplates,
    apiKeys: partial.apiKeys ?? base.apiKeys,
    integrations: partial.integrations ?? base.integrations,
    auditLog: partial.auditLog ?? base.auditLog,
    workflowSummaries: partial.workflowSummaries ?? base.workflowSummaries,
  };
}

export function loadSettings(): CarrierSettingsState {
  const defaults = createDefaultSettings();
  if (!canUseStorage()) return defaults;

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<CarrierSettingsState>;
    return mergeSettings(defaults, parsed);
  } catch {
    return defaults;
  }
}

export function saveSettings(state: CarrierSettingsState): CarrierSettingsState {
  const next: CarrierSettingsState = {
    ...state,
    updatedAt: new Date().toISOString(),
  };

  if (canUseStorage()) {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
  }

  return next;
}

export function appendAuditEntry(
  state: CarrierSettingsState,
  entry: Omit<SettingsAuditEntry, "id" | "timestamp"> & {
    id?: string;
    timestamp?: string;
  },
): CarrierSettingsState {
  const audit: SettingsAuditEntry = {
    id: entry.id ?? `aud-${Date.now()}`,
    timestamp: entry.timestamp ?? new Date().toISOString(),
    actorName: entry.actorName,
    action: entry.action,
    resource: entry.resource,
    details: entry.details,
    ip: entry.ip,
  };

  return {
    ...state,
    auditLog: [audit, ...state.auditLog].slice(0, 200),
  };
}

export function exportSettingsJson(state: CarrierSettingsState): string {
  const payload = {
    exportedAt: new Date().toISOString(),
    product: "Transpo.ai",
    settings: state,
  };
  return JSON.stringify(payload, null, 2);
}

export function downloadSettingsExport(state: CarrierSettingsState): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([exportSettingsJson(state)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `carrieros-settings-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function maskApiKey(prefix: string, lastFour: string): string {
  return `${prefix}_••••••••${lastFour}`;
}

export function generateApiKeyMaterial(): {
  prefix: string;
  lastFour: string;
  fullKey: string;
} {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let body = "";
  for (let i = 0; i < 24; i += 1) {
    body += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  const lastFour = body.slice(-4);
  return {
    prefix: "cos",
    lastFour,
    fullKey: `cos_${body}`,
  };
}
