import {
  SEED_API_KEYS,
  SEED_APPS,
  SEED_AUTOMATION_RECIPES,
  SEED_DEV_DOCS,
  SEED_FRAUD_FLAGS,
  SEED_PARTNERS,
  SEED_PLATFORM_AUDIT,
  SEED_SANDBOX_LOGS,
} from "@/lib/platform/seed";
import type {
  ApiKeyRecord,
  AppPermissionScope,
  AutomationActionId,
  AutomationTriggerId,
  InstalledApp,
  PlatformApp,
  PlatformAuditEntry,
  PlatformAutomationRecipe,
  PlatformLanguage,
  PlatformPartner,
  SandboxRequestLog,
} from "@/lib/platform/types";

const STORAGE_KEY = "transpo.platform.v1";

type PersistedState = {
  installed: InstalledApp[];
  apiKeys: ApiKeyRecord[];
  recipes: PlatformAutomationRecipe[];
  sandboxLogs: SandboxRequestLog[];
  preferredLanguage: PlatformLanguage;
  audit: PlatformAuditEntry[];
};

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function defaultInstalled(): InstalledApp[] {
  return [
    {
      appId: "app-alph-assist",
      installedAt: "2026-07-01T08:00:00.000Z",
      enabledScopes: [
        "loads.read",
        "loads.write",
        "drivers.read",
        "fleet.read",
        "finance.read",
        "documents.read",
      ],
    },
    {
      appId: "app-quickbooks",
      installedAt: "2026-07-10T14:00:00.000Z",
      enabledScopes: ["finance.read", "finance.write", "documents.read"],
    },
    {
      appId: "app-transpo-api",
      installedAt: "2026-07-08T10:00:00.000Z",
      enabledScopes: ["webhooks.write", "loads.read", "fleet.read", "finance.read"],
    },
  ];
}

function defaultState(): PersistedState {
  return {
    installed: defaultInstalled(),
    apiKeys: structuredClone(SEED_API_KEYS),
    recipes: structuredClone(SEED_AUTOMATION_RECIPES),
    sandboxLogs: structuredClone(SEED_SANDBOX_LOGS),
    preferredLanguage: "en",
    audit: structuredClone(SEED_PLATFORM_AUDIT),
  };
}

let memory = defaultState();
let hydrated = false;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function hydrate() {
  if (hydrated || !canUseStorage()) return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    memory = {
      ...defaultState(),
      ...parsed,
      installed: parsed.installed ?? defaultInstalled(),
      apiKeys: parsed.apiKeys ?? structuredClone(SEED_API_KEYS),
      recipes: parsed.recipes ?? structuredClone(SEED_AUTOMATION_RECIPES),
      sandboxLogs: parsed.sandboxLogs ?? structuredClone(SEED_SANDBOX_LOGS),
      preferredLanguage: parsed.preferredLanguage ?? "en",
      audit: parsed.audit ?? structuredClone(SEED_PLATFORM_AUDIT),
    };
  } catch {
    // keep defaults
  }
}

function persist() {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch {
    // ignore quota
  }
}

function pushAudit(action: string, resource: string, details: string, actor = "Jordan Reyes") {
  memory.audit.unshift({
    id: id("pa"),
    at: nowIso(),
    actor,
    action,
    resource,
    details,
  });
  memory.audit = memory.audit.slice(0, 100);
}

export function listPlatformApps(): PlatformApp[] {
  return SEED_APPS;
}

export function getPlatformApp(id: string): PlatformApp | undefined {
  return SEED_APPS.find((app) => app.id === id);
}

export function listInstalledApps(): InstalledApp[] {
  hydrate();
  return [...memory.installed];
}

export function isAppInstalled(appId: string): boolean {
  hydrate();
  return memory.installed.some((item) => item.appId === appId);
}

export function getInstalledApp(appId: string): InstalledApp | undefined {
  hydrate();
  return memory.installed.find((item) => item.appId === appId);
}

export function installApp(appId: string, scopes?: AppPermissionScope[]): InstalledApp {
  hydrate();
  const app = getPlatformApp(appId);
  if (!app) {
    throw new Error("App not found");
  }
  const existing = memory.installed.find((item) => item.appId === appId);
  if (existing) {
    return existing;
  }
  const record: InstalledApp = {
    appId,
    installedAt: nowIso(),
    enabledScopes: scopes?.length ? scopes : [...app.permissions],
  };
  memory.installed.unshift(record);
  pushAudit("app.install", appId, `Installed ${app.name}`);
  persist();
  return record;
}

export function uninstallApp(appId: string): boolean {
  hydrate();
  const app = getPlatformApp(appId);
  const before = memory.installed.length;
  memory.installed = memory.installed.filter((item) => item.appId !== appId);
  if (memory.installed.length !== before) {
    pushAudit("app.uninstall", appId, `Removed ${app?.name ?? appId}`);
    persist();
    return true;
  }
  return false;
}

export function updateAppScopes(appId: string, scopes: AppPermissionScope[]): InstalledApp | undefined {
  hydrate();
  const record = memory.installed.find((item) => item.appId === appId);
  if (!record) return undefined;
  record.enabledScopes = scopes;
  pushAudit("app.scopes", appId, `Updated permissions (${scopes.length} scopes)`);
  persist();
  return record;
}

export function listPartners(): PlatformPartner[] {
  return SEED_PARTNERS;
}

export function getPartner(id: string): PlatformPartner | undefined {
  return SEED_PARTNERS.find((p) => p.id === id);
}

export function listApiKeys(): ApiKeyRecord[] {
  hydrate();
  return [...memory.apiKeys];
}

export function generateApiKey(name: string, environment: "sandbox" | "production" = "sandbox"): ApiKeyRecord {
  hydrate();
  const prefix = environment === "sandbox" ? "tp_test_" : "tp_live_";
  const suffix = Math.random().toString(36).slice(2, 10);
  const record: ApiKeyRecord = {
    id: id("key"),
    name: name.trim() || "Untitled key",
    prefix,
    secretHint: `${prefix}••••••••${suffix.slice(-4)}`,
    createdAt: nowIso(),
    environment,
  };
  memory.apiKeys.unshift(record);
  pushAudit("apikey.create", record.id, `Created ${environment} API key “${record.name}”`);
  persist();
  return record;
}

export function revokeApiKey(keyId: string): boolean {
  hydrate();
  const key = memory.apiKeys.find((k) => k.id === keyId);
  if (!key || key.revokedAt) return false;
  key.revokedAt = nowIso();
  pushAudit("apikey.revoke", keyId, `Revoked API key “${key.name}”`);
  persist();
  return true;
}

export function listSandboxLogs(): SandboxRequestLog[] {
  hydrate();
  return [...memory.sandboxLogs];
}

export function runSandboxSample(path = "/v1/loads", method = "GET"): SandboxRequestLog {
  hydrate();
  const entry: SandboxRequestLog = {
    id: id("slog"),
    at: nowIso(),
    method,
    path,
    status: 200,
    latencyMs: 24 + Math.floor(Math.random() * 40),
    note: "Sandbox sample request (local mock — no external network)",
  };
  memory.sandboxLogs.unshift(entry);
  memory.sandboxLogs = memory.sandboxLogs.slice(0, 40);
  persist();
  return entry;
}

export function getDeveloperDocs() {
  return SEED_DEV_DOCS;
}

export function listAutomationRecipes(): PlatformAutomationRecipe[] {
  hydrate();
  return [...memory.recipes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function setRecipeEnabled(recipeId: string, enabled: boolean): PlatformAutomationRecipe | undefined {
  hydrate();
  const recipe = memory.recipes.find((r) => r.id === recipeId);
  if (!recipe) return undefined;
  recipe.enabled = enabled;
  recipe.updatedAt = nowIso();
  pushAudit(
    enabled ? "automation.enable" : "automation.disable",
    recipeId,
    `${enabled ? "Enabled" : "Disabled"} “${recipe.name}”`,
  );
  persist();
  return recipe;
}

export function saveAutomationRecipe(input: {
  name: string;
  description: string;
  trigger: AutomationTriggerId;
  action: AutomationActionId;
}): PlatformAutomationRecipe {
  hydrate();
  const recipe: PlatformAutomationRecipe = {
    id: id("recipe"),
    name: input.name.trim() || "Untitled recipe",
    description: input.description.trim() || "Custom Platform automation",
    trigger: input.trigger,
    action: input.action,
    enabled: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    linkedWorkflowHref: "/workflows",
  };
  memory.recipes.unshift(recipe);
  pushAudit("automation.create", recipe.id, `Created recipe “${recipe.name}”`);
  persist();
  return recipe;
}

export function getPreferredLanguage(): PlatformLanguage {
  hydrate();
  return memory.preferredLanguage;
}

export function setPreferredLanguage(language: PlatformLanguage): PlatformLanguage {
  hydrate();
  memory.preferredLanguage = language;
  pushAudit("settings.language", "translation", `Preferred language set to ${language}`);
  persist();
  return language;
}

export function listPlatformAudit(): PlatformAuditEntry[] {
  hydrate();
  return [...memory.audit];
}

export function listFraudFlags() {
  return SEED_FRAUD_FLAGS;
}

export function getDeveloperAnalytics() {
  hydrate();
  const activeKeys = memory.apiKeys.filter((k) => !k.revokedAt).length;
  const calls = memory.sandboxLogs.length * 37 + 1280;
  return {
    activeKeys,
    sandboxCalls30d: calls,
    errorRatePct: 0.4,
    p95LatencyMs: 68,
    webhookDeliveries: memory.sandboxLogs.filter((l) => l.path.includes("webhook")).length + 14,
  };
}
