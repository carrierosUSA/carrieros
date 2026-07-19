import { INTEGRATION_CATALOG } from "./catalog";
import { emptyHealth } from "./health";
import type {
  IntegrationLogEntry,
  IntegrationLogLevel,
  IntegrationProviderId,
  IntegrationRuntimeState,
  IntegrationStatus,
  IntegrationStoreState,
} from "./types";

const STORAGE_KEY = "carrieros.integrations.v1";

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

function minsAgo(mins: number): string {
  return new Date(Date.now() - mins * 60_000).toISOString();
}

function sparkline(seed: number[]): number[] {
  return seed;
}

function seedLogs(): IntegrationLogEntry[] {
  return [
    {
      id: "log-1",
      providerId: "samsara",
      timestamp: minsAgo(4),
      level: "success",
      message: "GPS sync completed — 42 vehicles",
      latencyMs: 118,
    },
    {
      id: "log-2",
      providerId: "quickbooks",
      timestamp: minsAgo(12),
      level: "fail",
      message: "Invoice sync failed — OAuth token expired",
      latencyMs: 890,
    },
    {
      id: "log-3",
      providerId: "google_maps",
      timestamp: minsAgo(18),
      level: "success",
      message: "Geocode batch — 14 addresses",
      latencyMs: 96,
    },
    {
      id: "log-4",
      providerId: "twilio",
      timestamp: minsAgo(35),
      level: "success",
      message: "SMS check-call sent to driver",
      latencyMs: 210,
    },
    {
      id: "log-5",
      providerId: "stripe",
      timestamp: hoursAgo(2),
      level: "info",
      message: "Webhook endpoint pending verification",
    },
    {
      id: "log-6",
      providerId: "motive",
      timestamp: hoursAgo(3),
      level: "info",
      message: "Integration disabled — no sync attempted",
    },
    {
      id: "log-7",
      providerId: "samsara",
      timestamp: hoursAgo(5),
      level: "success",
      message: "HOS pull — 28 drivers",
      latencyMs: 142,
    },
    {
      id: "log-8",
      providerId: "sendgrid",
      timestamp: hoursAgo(6),
      level: "fail",
      message: "Rate con email bounced — mailbox full",
      latencyMs: 340,
    },
    {
      id: "log-9",
      providerId: "mapbox",
      timestamp: hoursAgo(8),
      level: "info",
      message: "Not connected — using Leaflet fallback",
    },
    {
      id: "log-10",
      providerId: "quickbooks",
      timestamp: hoursAgo(14),
      level: "fail",
      message: "Payment sync aborted — 401 Unauthorized",
      latencyMs: 620,
    },
  ];
}

/** Demo seed: mix of connected / disconnected / error / pending. */
function seedConnections(): Record<
  IntegrationProviderId,
  IntegrationRuntimeState
> {
  const base = Object.fromEntries(
    INTEGRATION_CATALOG.map((item) => [
      item.id,
      {
        providerId: item.id,
        enabled: false,
        status: "disconnected" as const,
        health: emptyHealth(),
        comingSoon: item.comingSoon,
      } satisfies IntegrationRuntimeState,
    ]),
  ) as Record<IntegrationProviderId, IntegrationRuntimeState>;

  base.samsara = {
    providerId: "samsara",
    enabled: true,
    status: "connected",
    credentials: {
      mode: "api_key",
      apiKeyMasked: "sam••••••••7k2p",
      connectedAccountLabel: "CarrierOS Fleet",
    },
    health: {
      lastSyncAt: minsAgo(4),
      latencyMs: 118,
      successRate: 99,
      sparkline: sparkline([96, 98, 97, 99, 100, 99, 99]),
    },
  };

  base.quickbooks = {
    providerId: "quickbooks",
    enabled: true,
    status: "error",
    credentials: {
      mode: "oauth",
      connectedAccountLabel: "Love Logistics LLC",
    },
    health: {
      lastSyncAt: hoursAgo(14),
      latencyMs: 890,
      successRate: 62,
      sparkline: sparkline([88, 84, 71, 68, 55, 60, 62]),
    },
    errorMessage: "OAuth token expired — reconnect QuickBooks.",
  };

  base.google_maps = {
    providerId: "google_maps",
    enabled: true,
    status: "connected",
    credentials: {
      mode: "api_key",
      apiKeyMasked: "AIz••••••••Xy9q",
    },
    health: {
      lastSyncAt: minsAgo(18),
      latencyMs: 96,
      successRate: 100,
      sparkline: sparkline([100, 100, 99, 100, 100, 100, 100]),
    },
  };

  base.twilio = {
    providerId: "twilio",
    enabled: true,
    status: "connected",
    credentials: {
      mode: "api_key",
      apiKeyMasked: "AC••••••••91b2",
      connectedAccountLabel: "CarrierOS SMS",
    },
    health: {
      lastSyncAt: minsAgo(35),
      latencyMs: 210,
      successRate: 97,
      sparkline: sparkline([95, 96, 98, 97, 94, 97, 97]),
    },
  };

  base.stripe = {
    providerId: "stripe",
    enabled: true,
    status: "pending",
    credentials: {
      mode: "api_key",
      apiKeyMasked: "pk_••••••••demo",
    },
    health: {
      lastSyncAt: hoursAgo(2),
      latencyMs: null,
      successRate: null,
      sparkline: sparkline([40, 45, 50, 55, 60, 58, 62]),
    },
    errorMessage: "Webhook endpoint pending verification.",
  };

  base.sendgrid = {
    providerId: "sendgrid",
    enabled: false,
    status: "disconnected",
    health: {
      lastSyncAt: hoursAgo(6),
      latencyMs: 340,
      successRate: 91,
      sparkline: sparkline([92, 90, 88, 91, 93, 89, 91]),
    },
  };

  base.omnitracs = {
    providerId: "omnitracs",
    enabled: false,
    status: "disconnected",
    health: emptyHealth(),
    comingSoon: true,
  };

  return base;
}

function defaultState(): IntegrationStoreState {
  return {
    connections: seedConnections(),
    logs: seedLogs(),
    updatedAt: new Date().toISOString(),
  };
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

let memoryState: IntegrationStoreState | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function mergeWithCatalog(
  stored: IntegrationStoreState,
): IntegrationStoreState {
  const defaults = seedConnections();
  const connections = { ...defaults };
  for (const item of INTEGRATION_CATALOG) {
    const existing = stored.connections?.[item.id];
    if (existing) {
      connections[item.id] = {
        ...existing,
        comingSoon: item.comingSoon ?? existing.comingSoon,
      };
    }
  }
  return {
    connections,
    logs: stored.logs?.length ? stored.logs.slice(0, 100) : seedLogs(),
    updatedAt: stored.updatedAt ?? new Date().toISOString(),
  };
}

function readState(): IntegrationStoreState {
  if (memoryState) return memoryState;
  if (!canUseStorage()) {
    memoryState = defaultState();
    return memoryState;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      memoryState = defaultState();
      return memoryState;
    }
    const parsed = JSON.parse(raw) as IntegrationStoreState;
    memoryState = mergeWithCatalog(parsed);
    return memoryState;
  } catch {
    memoryState = defaultState();
    return memoryState;
  }
}

function writeState(next: IntegrationStoreState) {
  memoryState = next;
  if (canUseStorage()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  notify();
}

export function getIntegrationsStore(): IntegrationStoreState {
  return readState();
}

export function subscribeIntegrationsStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetIntegrationsStore(): void {
  writeState(defaultState());
}

function pushLog(
  state: IntegrationStoreState,
  entry: Omit<IntegrationLogEntry, "id" | "timestamp"> & {
    timestamp?: string;
  },
): IntegrationStoreState {
  const log: IntegrationLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: entry.timestamp ?? new Date().toISOString(),
    providerId: entry.providerId,
    level: entry.level,
    message: entry.message,
    latencyMs: entry.latencyMs,
  };
  return {
    ...state,
    logs: [log, ...state.logs].slice(0, 100),
    updatedAt: new Date().toISOString(),
  };
}

export function setIntegrationEnabled(
  providerId: IntegrationProviderId,
  enabled: boolean,
): void {
  const state = readState();
  const current = state.connections[providerId];
  if (!current || current.comingSoon) return;

  let nextStatus: IntegrationStatus = current.status;
  if (!enabled && current.status === "connected") {
    nextStatus = "disconnected";
  }
  if (enabled && current.status === "disconnected" && current.credentials) {
    nextStatus = "connected";
  }

  let next = {
    ...state,
    connections: {
      ...state.connections,
      [providerId]: {
        ...current,
        enabled,
        status: enabled ? nextStatus : current.status === "error" ? "error" : "disconnected",
      },
    },
    updatedAt: new Date().toISOString(),
  };

  next = pushLog(next, {
    providerId,
    level: "info",
    message: enabled ? "Integration enabled" : "Integration disabled",
  });

  writeState(next);
}

export function applyConnectionResult(
  providerId: IntegrationProviderId,
  result: {
    status: IntegrationStatus;
    apiKeyMasked?: string;
    accountLabel?: string;
    message: string;
    latencyMs?: number;
  },
): void {
  const state = readState();
  const current = state.connections[providerId];
  if (!current) return;

  const catalogMode =
    INTEGRATION_CATALOG.find((c) => c.id === providerId)?.authMode ?? "api_key";

  const health =
    result.status === "connected"
      ? {
          lastSyncAt: new Date().toISOString(),
          latencyMs: result.latencyMs ?? 120,
          successRate: 100,
          sparkline: [...(current.health.sparkline.slice(-6) || []), 100].slice(
            -7,
          ),
        }
      : current.health;

  let next: IntegrationStoreState = {
    ...state,
    connections: {
      ...state.connections,
      [providerId]: {
        ...current,
        enabled: result.status === "connected" ? true : current.enabled,
        status: result.status,
        errorMessage:
          result.status === "error" || result.status === "pending"
            ? result.message
            : undefined,
        credentials:
          result.status === "connected"
            ? {
                mode: catalogMode,
                apiKeyMasked:
                  result.apiKeyMasked ?? current.credentials?.apiKeyMasked,
                connectedAccountLabel:
                  result.accountLabel ??
                  current.credentials?.connectedAccountLabel,
              }
            : current.credentials,
        health,
      },
    },
    updatedAt: new Date().toISOString(),
  };

  const level: IntegrationLogLevel =
    result.status === "connected"
      ? "success"
      : result.status === "error"
        ? "fail"
        : "info";

  next = pushLog(next, {
    providerId,
    level,
    message: result.message,
    latencyMs: result.latencyMs,
  });

  writeState(next);
}

export function applyDisconnect(providerId: IntegrationProviderId): void {
  const state = readState();
  const current = state.connections[providerId];
  if (!current) return;

  let next: IntegrationStoreState = {
    ...state,
    connections: {
      ...state.connections,
      [providerId]: {
        ...current,
        enabled: false,
        status: "disconnected",
        credentials: undefined,
        errorMessage: undefined,
        health: emptyHealth(),
      },
    },
    updatedAt: new Date().toISOString(),
  };

  next = pushLog(next, {
    providerId,
    level: "info",
    message: "Disconnected — credentials cleared",
  });

  writeState(next);
}

export function applyTestResult(
  providerId: IntegrationProviderId,
  result: { ok: boolean; latencyMs: number; message: string },
): void {
  const state = readState();
  const current = state.connections[providerId];
  if (!current) return;

  const successRate = result.ok
    ? Math.min(100, (current.health.successRate ?? 95) + 1)
    : Math.max(0, (current.health.successRate ?? 95) - 5);

  let next: IntegrationStoreState = {
    ...state,
    connections: {
      ...state.connections,
      [providerId]: {
        ...current,
        status: result.ok
          ? current.status === "error"
            ? "connected"
            : current.status
          : "error",
        errorMessage: result.ok ? undefined : result.message,
        health: {
          lastSyncAt: new Date().toISOString(),
          latencyMs: result.latencyMs,
          successRate,
          sparkline: [
            ...(current.health.sparkline.slice(-6) || []),
            successRate,
          ].slice(-7),
        },
      },
    },
    updatedAt: new Date().toISOString(),
  };

  next = pushLog(next, {
    providerId,
    level: result.ok ? "success" : "fail",
    message: result.message,
    latencyMs: result.latencyMs,
  });

  writeState(next);
}

export function listIntegrationLogs(filters?: {
  providerId?: IntegrationProviderId | "all";
  level?: IntegrationLogLevel | "all";
}): IntegrationLogEntry[] {
  const state = readState();
  return state.logs.filter((log) => {
    if (
      filters?.providerId &&
      filters.providerId !== "all" &&
      log.providerId !== filters.providerId
    ) {
      return false;
    }
    if (
      filters?.level &&
      filters.level !== "all" &&
      log.level !== filters.level
    ) {
      return false;
    }
    return true;
  });
}
