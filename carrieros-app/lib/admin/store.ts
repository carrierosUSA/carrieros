import type {
  ActivityLogEntry,
  AdminStoreState,
  ApiLogEntry,
  BackupRecord,
  BackupSchedule,
  DeviceRecord,
  ErrorMonitorEntry,
  FeatureFlag,
  LoginHistoryEntry,
  PerformanceMetrics,
  SessionRecord,
  SystemHealthSnapshot,
} from "./types";
import { DEFAULT_MAINTENANCE_MESSAGE } from "./types";

const STORAGE_KEY = "carrieros.admin.v1";

function minsAgo(mins: number): string {
  return new Date(Date.now() - mins * 60_000).toISOString();
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

function seedActivity(): ActivityLogEntry[] {
  return [
    {
      id: "act-1",
      timestamp: minsAgo(8),
      userId: "alpha-owner",
      userName: "Alpha Owner",
      module: "Dispatch",
      action: "assigned_driver",
      summary: "Assigned Jordan Miles to load LD-4821",
      entityType: "load",
      entityId: "LD-4821",
    },
    {
      id: "act-2",
      timestamp: minsAgo(22),
      userId: "u-dispatch-1",
      userName: "Sam Rivera",
      module: "Documents",
      action: "requested_pod",
      summary: "Requested POD from driver for LD-4810",
      entityType: "load",
      entityId: "LD-4810",
    },
    {
      id: "act-3",
      timestamp: minsAgo(45),
      userId: "u-finance-1",
      userName: "Priya Shah",
      module: "Finance",
      action: "sent_invoice",
      summary: "Sent invoice INV-2094 to Apex Logistics",
      entityType: "invoice",
      entityId: "INV-2094",
    },
    {
      id: "act-4",
      timestamp: hoursAgo(2),
      userId: "alpha-owner",
      userName: "Alpha Owner",
      module: "Fleet",
      action: "created_work_order",
      summary: "Opened PM work order for truck TRK-17",
      entityType: "truck",
      entityId: "TRK-17",
    },
    {
      id: "act-5",
      timestamp: hoursAgo(3),
      userId: "u-safety-1",
      userName: "Chris Nguyen",
      module: "Compliance",
      action: "logged_inspection",
      summary: "Logged DOT inspection for TRK-08 — clear",
      entityType: "truck",
      entityId: "TRK-08",
    },
    {
      id: "act-6",
      timestamp: hoursAgo(5),
      userId: "u-dispatch-1",
      userName: "Sam Rivera",
      module: "Brokers",
      action: "updated_rate",
      summary: "Updated negotiated rate on LD-4799",
      entityType: "load",
      entityId: "LD-4799",
    },
    {
      id: "act-7",
      timestamp: hoursAgo(8),
      userId: "alpha-owner",
      userName: "Alpha Owner",
      module: "Workflows",
      action: "enabled_workflow",
      summary: "Enabled Auto-invoice on delivery workflow",
      entityType: "workflow",
      entityId: "wf-invoice-delivery",
    },
    {
      id: "act-8",
      timestamp: hoursAgo(14),
      userId: "u-finance-1",
      userName: "Priya Shah",
      module: "Payroll",
      action: "approved_settlement",
      summary: "Approved driver settlement for week of Jul 6",
      entityType: "payroll",
      entityId: "pay-2026-W28",
    },
    {
      id: "act-9",
      timestamp: daysAgo(1),
      userId: "u-dispatch-1",
      userName: "Sam Rivera",
      module: "Dispatch",
      action: "reassigned_truck",
      summary: "Reassigned TRK-12 to load LD-4788",
      entityType: "load",
      entityId: "LD-4788",
    },
    {
      id: "act-10",
      timestamp: daysAgo(2),
      userId: "alpha-owner",
      userName: "Alpha Owner",
      module: "Settings",
      action: "updated_permissions",
      summary: "Granted dispatcher role to Maya Chen",
      entityType: "user",
      entityId: "u-dispatch-2",
    },
  ];
}

function seedApiLogs(): ApiLogEntry[] {
  return [
    {
      id: "api-1",
      timestamp: minsAgo(2),
      method: "GET",
      path: "/api/v1/loads?status=in_transit",
      status: 200,
      latencyMs: 48,
      source: "CarrierOS Web",
      userId: "alpha-owner",
    },
    {
      id: "api-2",
      timestamp: minsAgo(5),
      method: "POST",
      path: "/api/v1/integrations/samsara/sync",
      status: 200,
      latencyMs: 312,
      source: "Samsara",
    },
    {
      id: "api-3",
      timestamp: minsAgo(11),
      method: "POST",
      path: "/api/v1/invoices/INV-2094/send",
      status: 201,
      latencyMs: 186,
      source: "CarrierOS Web",
      userId: "u-finance-1",
    },
    {
      id: "api-4",
      timestamp: minsAgo(18),
      method: "GET",
      path: "/api/v1/drivers/jordan-miles/hos",
      status: 200,
      latencyMs: 94,
      source: "Motive",
    },
    {
      id: "api-5",
      timestamp: minsAgo(28),
      method: "POST",
      path: "/api/v1/webhooks/quickbooks",
      status: 401,
      latencyMs: 620,
      source: "QuickBooks",
    },
    {
      id: "api-6",
      timestamp: hoursAgo(1),
      method: "PUT",
      path: "/api/v1/loads/LD-4821/assign",
      status: 200,
      latencyMs: 71,
      source: "CarrierOS Web",
      userId: "alpha-owner",
    },
    {
      id: "api-7",
      timestamp: hoursAgo(2),
      method: "POST",
      path: "/api/v1/sms/check-call",
      status: 200,
      latencyMs: 210,
      source: "Twilio",
    },
    {
      id: "api-8",
      timestamp: hoursAgo(3),
      method: "GET",
      path: "/api/v1/fleet/trucks/TRK-17/maintenance",
      status: 200,
      latencyMs: 55,
      source: "CarrierOS Web",
      userId: "alpha-owner",
    },
    {
      id: "api-9",
      timestamp: hoursAgo(5),
      method: "POST",
      path: "/api/v1/documents/upload",
      status: 413,
      latencyMs: 1402,
      source: "Driver App",
      userId: "u-driver-4",
    },
    {
      id: "api-10",
      timestamp: hoursAgo(6),
      method: "GET",
      path: "/api/v1/analytics/revenue",
      status: 200,
      latencyMs: 228,
      source: "CarrierOS Web",
      userId: "u-finance-1",
    },
    {
      id: "api-11",
      timestamp: hoursAgo(9),
      method: "DELETE",
      path: "/api/v1/sessions/sess-old-1",
      status: 204,
      latencyMs: 22,
      source: "CarrierOS Web",
      userId: "alpha-owner",
    },
    {
      id: "api-12",
      timestamp: hoursAgo(12),
      method: "POST",
      path: "/api/v1/portal/auth/login",
      status: 200,
      latencyMs: 134,
      source: "Broker Portal",
    },
  ];
}

function seedLoginHistory(): LoginHistoryEntry[] {
  return [
    {
      id: "login-1",
      timestamp: minsAgo(15),
      userId: "alpha-owner",
      userName: "Alpha Owner",
      ip: "73.142.18.44",
      success: true,
      location: "Chicago, IL",
    },
    {
      id: "login-2",
      timestamp: hoursAgo(1),
      userId: "u-dispatch-1",
      userName: "Sam Rivera",
      ip: "98.214.55.12",
      success: true,
      location: "Naperville, IL",
    },
    {
      id: "login-3",
      timestamp: hoursAgo(3),
      userId: "unknown",
      userName: "priya.shah@carrieros.com",
      ip: "185.220.101.22",
      success: false,
      location: "Frankfurt, DE",
      reason: "Invalid password",
    },
    {
      id: "login-4",
      timestamp: hoursAgo(5),
      userId: "u-finance-1",
      userName: "Priya Shah",
      ip: "24.148.90.3",
      success: true,
      location: "Schaumburg, IL",
    },
    {
      id: "login-5",
      timestamp: hoursAgo(14),
      userId: "u-safety-1",
      userName: "Chris Nguyen",
      ip: "67.180.22.91",
      success: true,
      location: "Oak Brook, IL",
    },
    {
      id: "login-6",
      timestamp: daysAgo(1),
      userId: "alpha-owner",
      userName: "Alpha Owner",
      ip: "73.142.18.44",
      success: true,
      location: "Chicago, IL",
    },
    {
      id: "login-7",
      timestamp: daysAgo(1),
      userId: "u-dispatch-2",
      userName: "Maya Chen",
      ip: "104.28.41.77",
      success: false,
      location: "Ashburn, VA",
      reason: "2FA challenge timed out",
    },
    {
      id: "login-8",
      timestamp: daysAgo(2),
      userId: "u-dispatch-2",
      userName: "Maya Chen",
      ip: "72.14.201.104",
      success: true,
      location: "Evanston, IL",
    },
  ];
}

function seedDevices(): DeviceRecord[] {
  return [
    {
      id: "dev-1",
      userId: "alpha-owner",
      userName: "Alpha Owner",
      browser: "Chrome 126",
      os: "macOS Sequoia",
      deviceLabel: "MacBook Pro",
      lastSeenAt: minsAgo(4),
      trusted: true,
      ip: "73.142.18.44",
    },
    {
      id: "dev-2",
      userId: "alpha-owner",
      userName: "Alpha Owner",
      browser: "Safari 18",
      os: "iOS 18.5",
      deviceLabel: "iPhone 16 Pro",
      lastSeenAt: hoursAgo(6),
      trusted: true,
      ip: "73.142.18.44",
    },
    {
      id: "dev-3",
      userId: "u-dispatch-1",
      userName: "Sam Rivera",
      browser: "Edge 126",
      os: "Windows 11",
      deviceLabel: "Dispatch desktop",
      lastSeenAt: minsAgo(40),
      trusted: true,
      ip: "98.214.55.12",
    },
    {
      id: "dev-4",
      userId: "u-finance-1",
      userName: "Priya Shah",
      browser: "Chrome 125",
      os: "Windows 11",
      deviceLabel: "Finance laptop",
      lastSeenAt: hoursAgo(5),
      trusted: true,
      ip: "24.148.90.3",
    },
    {
      id: "dev-5",
      userId: "u-dispatch-2",
      userName: "Maya Chen",
      browser: "Firefox 128",
      os: "Ubuntu 24.04",
      deviceLabel: "Unknown Linux",
      lastSeenAt: daysAgo(1),
      trusted: false,
      ip: "104.28.41.77",
    },
    {
      id: "dev-6",
      userId: "u-safety-1",
      userName: "Chris Nguyen",
      browser: "Chrome 126",
      os: "macOS Sonoma",
      deviceLabel: "Safety MacBook",
      lastSeenAt: hoursAgo(14),
      trusted: true,
      ip: "67.180.22.91",
    },
  ];
}

function seedSessions(): SessionRecord[] {
  return [
    {
      id: "sess-1",
      userId: "alpha-owner",
      userName: "Alpha Owner",
      role: "Owner",
      deviceLabel: "MacBook Pro · Chrome",
      ip: "73.142.18.44",
      location: "Chicago, IL",
      startedAt: minsAgo(15),
      lastActiveAt: minsAgo(1),
      current: true,
    },
    {
      id: "sess-2",
      userId: "u-dispatch-1",
      userName: "Sam Rivera",
      role: "Dispatcher",
      deviceLabel: "Dispatch desktop · Edge",
      ip: "98.214.55.12",
      location: "Naperville, IL",
      startedAt: hoursAgo(1),
      lastActiveAt: minsAgo(12),
    },
    {
      id: "sess-3",
      userId: "u-finance-1",
      userName: "Priya Shah",
      role: "Accounting",
      deviceLabel: "Finance laptop · Chrome",
      ip: "24.148.90.3",
      location: "Schaumburg, IL",
      startedAt: hoursAgo(5),
      lastActiveAt: minsAgo(55),
    },
    {
      id: "sess-4",
      userId: "alpha-owner",
      userName: "Alpha Owner",
      role: "Owner",
      deviceLabel: "iPhone 16 Pro · Safari",
      ip: "73.142.18.44",
      location: "Chicago, IL",
      startedAt: hoursAgo(6),
      lastActiveAt: hoursAgo(6),
    },
    {
      id: "sess-5",
      userId: "u-safety-1",
      userName: "Chris Nguyen",
      role: "Safety",
      deviceLabel: "Safety MacBook · Chrome",
      ip: "67.180.22.91",
      location: "Oak Brook, IL",
      startedAt: hoursAgo(14),
      lastActiveAt: hoursAgo(2),
    },
  ];
}

function seedBackups(): BackupRecord[] {
  return [
    {
      id: "bak-1",
      createdAt: hoursAgo(6),
      label: "Nightly snapshot",
      sizeKb: 18420,
      createdBy: "System",
      includesDocuments: true,
      status: "ready",
    },
    {
      id: "bak-2",
      createdAt: daysAgo(1),
      label: "Manual — pre-permissions change",
      sizeKb: 17890,
      createdBy: "Alpha Owner",
      includesDocuments: true,
      status: "ready",
    },
    {
      id: "bak-3",
      createdAt: daysAgo(3),
      label: "Weekly full backup",
      sizeKb: 22140,
      createdBy: "System",
      includesDocuments: true,
      status: "ready",
    },
    {
      id: "bak-4",
      createdAt: daysAgo(7),
      label: "Settings-only export",
      sizeKb: 420,
      createdBy: "Alpha Owner",
      includesDocuments: false,
      status: "ready",
    },
  ];
}

function seedHealth(): SystemHealthSnapshot {
  return {
    overall: "healthy",
    uptimePercent: 99.97,
    uptimeSince: daysAgo(42),
    checkedAt: minsAgo(1),
    services: [
      {
        id: "db",
        name: "Database",
        status: "healthy",
        latencyMs: 12,
        detail: "Primary + replica in sync",
      },
      {
        id: "api",
        name: "API",
        status: "healthy",
        latencyMs: 48,
        detail: "All regions responding",
      },
      {
        id: "queue",
        name: "Job queue",
        status: "degraded",
        latencyMs: 210,
        detail: "Invoice workers lagged 2m — catching up",
      },
      {
        id: "storage",
        name: "Document storage",
        status: "healthy",
        latencyMs: 34,
        detail: "Object store healthy · 62% capacity",
      },
      {
        id: "integrations",
        name: "Integrations bus",
        status: "healthy",
        latencyMs: 88,
        detail: "Samsara / Twilio / SendGrid OK",
      },
    ],
  };
}

function seedPerformance(): PerformanceMetrics {
  return {
    p50Ms: 62,
    p95Ms: 248,
    requestsPerMin: 184,
    errorRatePercent: 0.4,
    latencySeries: [
      { label: "00", value: 58 },
      { label: "04", value: 52 },
      { label: "08", value: 71 },
      { label: "12", value: 94 },
      { label: "16", value: 88 },
      { label: "20", value: 67 },
      { label: "24", value: 62 },
    ],
    throughputSeries: [
      { label: "00", value: 42 },
      { label: "04", value: 28 },
      { label: "08", value: 156 },
      { label: "12", value: 210 },
      { label: "16", value: 198 },
      { label: "20", value: 120 },
      { label: "24", value: 184 },
    ],
  };
}

function seedErrors(): ErrorMonitorEntry[] {
  return [
    {
      id: "err-1",
      timestamp: minsAgo(18),
      message: "QuickBooks webhook rejected — invalid OAuth token",
      severity: "critical",
      source: "integrations/quickbooks",
      stackSnippet:
        "OAuthError: token_expired\n  at verifyWebhook (qb.ts:142)\n  at POST /api/v1/webhooks/quickbooks",
      count: 4,
      resolved: false,
    },
    {
      id: "err-2",
      timestamp: hoursAgo(2),
      message: "Document upload exceeded 25MB limit",
      severity: "warning",
      source: "documents/upload",
      stackSnippet:
        "PayloadTooLargeError: entity too large\n  at parseBody (upload.ts:58)\n  at POST /api/v1/documents/upload",
      count: 2,
      resolved: false,
    },
    {
      id: "err-3",
      timestamp: hoursAgo(6),
      message: "Rate-limit hit on Twilio SMS check-call",
      severity: "warning",
      source: "integrations/twilio",
      stackSnippet:
        "TwilioError: 20429 Too Many Requests\n  at sendSms (twilio.ts:89)",
      count: 1,
      resolved: true,
      resolvedAt: hoursAgo(5),
    },
    {
      id: "err-4",
      timestamp: hoursAgo(12),
      message: "Unhandled rejection in workflow runner",
      severity: "critical",
      source: "workflows/runner",
      stackSnippet:
        "TypeError: Cannot read properties of undefined (reading 'loadId')\n  at executeStep (runner.ts:204)\n  at runWorkflow (runner.ts:91)",
      count: 1,
      resolved: false,
    },
    {
      id: "err-5",
      timestamp: daysAgo(1),
      message: "Stale cache key for driver HOS snapshot",
      severity: "info",
      source: "fleet/hos",
      stackSnippet:
        "CacheMiss: hos:jordan-miles expired\n  at getHos (hos-cache.ts:33)",
      count: 7,
      resolved: true,
      resolvedAt: hoursAgo(20),
    },
  ];
}

function seedFeatureFlags(): FeatureFlag[] {
  return [
    {
      id: "alph_voice",
      label: "Alph Voice",
      description: "Voice check-calls and spoken Alph summaries for dispatch.",
      enabled: true,
    },
    {
      id: "workflow_engine",
      label: "Workflow engine",
      description: "Automations for invoices, POD requests, and notifications.",
      enabled: true,
    },
    {
      id: "portal_2fa",
      label: "Portal 2FA",
      description: "Require two-factor authentication for broker portal logins.",
      enabled: false,
    },
    {
      id: "trip_replay",
      label: "Trip replay",
      description: "Playback of GPS breadcrumbs on load tracking.",
      enabled: true,
    },
    {
      id: "maintenance_auto_schedule",
      label: "Auto maintenance schedule",
      description: "Suggest PM work orders from mileage and engine hours.",
      enabled: false,
    },
    {
      id: "broker_scorecards",
      label: "Broker scorecards",
      description: "Payment reliability and volume scores on broker profiles.",
      enabled: true,
    },
  ];
}

export function createSeedAdminState(): AdminStoreState {
  return {
    activityLogs: seedActivity(),
    apiLogs: seedApiLogs(),
    loginHistory: seedLoginHistory(),
    devices: seedDevices(),
    sessions: seedSessions(),
    backups: seedBackups(),
    backupSchedule: "daily",
    health: seedHealth(),
    performance: seedPerformance(),
    errors: seedErrors(),
    featureFlags: seedFeatureFlags(),
    maintenanceMode: false,
    maintenanceMessage: DEFAULT_MAINTENANCE_MESSAGE,
  };
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

let memoryState: AdminStoreState | null = null;
const listeners = new Set<() => void>();

function cloneState(state: AdminStoreState): AdminStoreState {
  return structuredClone(state);
}

function readFromStorage(): AdminStoreState | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AdminStoreState>;
    const seed = createSeedAdminState();
    return {
      ...seed,
      ...parsed,
      featureFlags: mergeFlags(seed.featureFlags, parsed.featureFlags),
      health: parsed.health ?? seed.health,
      performance: parsed.performance ?? seed.performance,
    };
  } catch {
    return null;
  }
}

function mergeFlags(
  seed: FeatureFlag[],
  stored: FeatureFlag[] | undefined,
): FeatureFlag[] {
  if (!stored?.length) return seed;
  const byId = new Map(stored.map((f) => [f.id, f]));
  return seed.map((flag) => {
    const existing = byId.get(flag.id);
    return existing ? { ...flag, enabled: existing.enabled } : flag;
  });
}

function writeToStorage(state: AdminStoreState) {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors in demo
  }
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function getAdminStore(): AdminStoreState {
  if (!memoryState) {
    memoryState = readFromStorage() ?? createSeedAdminState();
    if (canUseStorage() && !localStorage.getItem(STORAGE_KEY)) {
      writeToStorage(memoryState);
    }
  }
  return memoryState;
}

export function subscribeAdminStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function commit(next: AdminStoreState) {
  memoryState = next;
  writeToStorage(next);
  notify();
  return memoryState;
}

export function updateAdminStore(
  updater: (prev: AdminStoreState) => AdminStoreState,
): AdminStoreState {
  const prev = getAdminStore();
  return commit(updater(cloneState(prev)));
}

export function listActivityLogs(): ActivityLogEntry[] {
  return getAdminStore().activityLogs;
}

export function listApiLogs(): ApiLogEntry[] {
  return getAdminStore().apiLogs;
}

export function listLoginHistory(): LoginHistoryEntry[] {
  return getAdminStore().loginHistory;
}

export function listDevices(): DeviceRecord[] {
  return getAdminStore().devices;
}

export function listSessions(): SessionRecord[] {
  return getAdminStore().sessions;
}

export function listBackups(): BackupRecord[] {
  return getAdminStore().backups;
}

export function getBackupSchedule(): BackupSchedule {
  return getAdminStore().backupSchedule;
}

export function setBackupSchedule(schedule: BackupSchedule): AdminStoreState {
  return updateAdminStore((prev) => ({ ...prev, backupSchedule: schedule }));
}

export function createBackup(input?: {
  label?: string;
  includesDocuments?: boolean;
  createdBy?: string;
}): BackupRecord {
  const record: BackupRecord = {
    id: `bak-${Date.now()}`,
    createdAt: new Date().toISOString(),
    label: input?.label ?? `Manual backup — ${new Date().toLocaleString()}`,
    sizeKb: 16_000 + Math.floor(Math.random() * 4_000),
    createdBy: input?.createdBy ?? "Alpha Owner",
    includesDocuments: input?.includesDocuments ?? true,
    status: "ready",
  };

  updateAdminStore((prev) => ({
    ...prev,
    backups: [record, ...prev.backups],
  }));

  return record;
}

export function revokeSession(sessionId: string): SessionRecord | null {
  const session = getAdminStore().sessions.find((s) => s.id === sessionId);
  if (!session || session.current) return null;

  updateAdminStore((prev) => ({
    ...prev,
    sessions: prev.sessions.filter((s) => s.id !== sessionId),
  }));

  return session;
}

export function setDeviceTrusted(
  deviceId: string,
  trusted: boolean,
): DeviceRecord | null {
  let updated: DeviceRecord | null = null;
  updateAdminStore((prev) => ({
    ...prev,
    devices: prev.devices.map((d) => {
      if (d.id !== deviceId) return d;
      updated = { ...d, trusted };
      return updated;
    }),
  }));
  return updated;
}

export function resolveError(errorId: string): ErrorMonitorEntry | null {
  let updated: ErrorMonitorEntry | null = null;
  updateAdminStore((prev) => ({
    ...prev,
    errors: prev.errors.map((e) => {
      if (e.id !== errorId) return e;
      updated = {
        ...e,
        resolved: true,
        resolvedAt: new Date().toISOString(),
      };
      return updated;
    }),
  }));
  return updated;
}

export function appendActivityLog(
  entry: Omit<ActivityLogEntry, "id" | "timestamp"> & {
    id?: string;
    timestamp?: string;
  },
): ActivityLogEntry {
  const full: ActivityLogEntry = {
    id: entry.id ?? `act-${Date.now()}`,
    timestamp: entry.timestamp ?? new Date().toISOString(),
    userId: entry.userId,
    userName: entry.userName,
    module: entry.module,
    action: entry.action,
    summary: entry.summary,
    entityType: entry.entityType,
    entityId: entry.entityId,
  };

  updateAdminStore((prev) => ({
    ...prev,
    activityLogs: [full, ...prev.activityLogs].slice(0, 200),
  }));

  return full;
}

export function downloadBackupJson(backup: BackupRecord): void {
  if (!canUseStorage()) return;
  const payload = {
    backupId: backup.id,
    label: backup.label,
    createdAt: backup.createdAt,
    createdBy: backup.createdBy,
    includesDocuments: backup.includesDocuments,
    exportedAt: new Date().toISOString(),
    note: "Demo stub — not a full database dump.",
    snapshot: {
      loads: 128,
      drivers: 34,
      trucks: 28,
      invoices: 412,
    },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `carrieros-backup-${backup.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function simulateRestore(backupId: string): {
  ok: boolean;
  message: string;
} {
  const backup = getAdminStore().backups.find((b) => b.id === backupId);
  if (!backup) {
    return { ok: false, message: "Backup not found." };
  }

  appendActivityLog({
    userId: "alpha-owner",
    userName: "Alpha Owner",
    module: "Admin",
    action: "restore_simulated",
    summary: `Simulated restore from “${backup.label}” — no live data wiped`,
    entityType: "backup",
    entityId: backup.id,
  });

  return {
    ok: true,
    message: `Restore simulated from “${backup.label}”. Live data was not changed.`,
  };
}
