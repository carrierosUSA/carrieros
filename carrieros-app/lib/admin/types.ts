export type AdminTabId =
  | "audit"
  | "activity"
  | "api"
  | "login"
  | "devices"
  | "sessions"
  | "backups"
  | "restore"
  | "health"
  | "performance"
  | "errors"
  | "flags"
  | "maintenance"
  | "eld"
  | "support";

export type HealthStatus = "healthy" | "degraded" | "down";

export type ActivityLogEntry = {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  module: string;
  action: string;
  summary: string;
  entityType?: string;
  entityId?: string;
};

export type ApiLogEntry = {
  id: string;
  timestamp: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  status: number;
  latencyMs: number;
  source: string;
  userId?: string;
};

export type LoginHistoryEntry = {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  ip: string;
  success: boolean;
  location: string;
  reason?: string;
};

export type DeviceRecord = {
  id: string;
  userId: string;
  userName: string;
  browser: string;
  os: string;
  deviceLabel: string;
  lastSeenAt: string;
  trusted: boolean;
  ip: string;
};

export type SessionRecord = {
  id: string;
  userId: string;
  userName: string;
  role: string;
  deviceLabel: string;
  ip: string;
  location: string;
  startedAt: string;
  lastActiveAt: string;
  current?: boolean;
};

export type BackupRecord = {
  id: string;
  createdAt: string;
  label: string;
  sizeKb: number;
  createdBy: string;
  includesDocuments: boolean;
  status: "ready" | "running" | "failed";
};

export type BackupSchedule = "off" | "daily" | "weekly";

export type SystemServiceHealth = {
  id: string;
  name: string;
  status: HealthStatus;
  latencyMs: number;
  detail: string;
};

export type SystemHealthSnapshot = {
  overall: HealthStatus;
  uptimePercent: number;
  uptimeSince: string;
  services: SystemServiceHealth[];
  checkedAt: string;
};

export type PerformancePoint = {
  label: string;
  value: number;
};

export type PerformanceMetrics = {
  p50Ms: number;
  p95Ms: number;
  requestsPerMin: number;
  errorRatePercent: number;
  latencySeries: PerformancePoint[];
  throughputSeries: PerformancePoint[];
};

export type ErrorSeverity = "critical" | "warning" | "info";

export type ErrorMonitorEntry = {
  id: string;
  timestamp: string;
  message: string;
  severity: ErrorSeverity;
  source: string;
  stackSnippet: string;
  count: number;
  resolved: boolean;
  resolvedAt?: string;
};

export type FeatureFlagId =
  | "alph_voice"
  | "workflow_engine"
  | "portal_2fa"
  | "trip_replay"
  | "maintenance_auto_schedule"
  | "broker_scorecards";

export type FeatureFlag = {
  id: FeatureFlagId;
  label: string;
  description: string;
  enabled: boolean;
};

export type AdminStoreState = {
  activityLogs: ActivityLogEntry[];
  apiLogs: ApiLogEntry[];
  loginHistory: LoginHistoryEntry[];
  devices: DeviceRecord[];
  sessions: SessionRecord[];
  backups: BackupRecord[];
  backupSchedule: BackupSchedule;
  health: SystemHealthSnapshot;
  performance: PerformanceMetrics;
  errors: ErrorMonitorEntry[];
  featureFlags: FeatureFlag[];
  maintenanceMode: boolean;
  maintenanceMessage: string;
};

export const ADMIN_TABS: { id: AdminTabId; label: string; group: string }[] = [
  { id: "audit", label: "Audit logs", group: "Logs" },
  { id: "activity", label: "Activity", group: "Logs" },
  { id: "api", label: "API logs", group: "Logs" },
  { id: "login", label: "Login history", group: "Access" },
  { id: "devices", label: "Devices", group: "Access" },
  { id: "sessions", label: "Sessions", group: "Access" },
  { id: "backups", label: "Backups", group: "Data" },
  { id: "restore", label: "Restore", group: "Data" },
  { id: "health", label: "System health", group: "Ops" },
  { id: "performance", label: "Performance", group: "Ops" },
  { id: "errors", label: "Errors", group: "Ops" },
  { id: "flags", label: "Feature flags", group: "Control" },
  { id: "maintenance", label: "Maintenance", group: "Control" },
  { id: "eld", label: "ELD requests", group: "Integrations" },
  { id: "support", label: "Support queue", group: "Support" },
];

export const DEFAULT_MAINTENANCE_MESSAGE =
  "Transpo.ai is undergoing scheduled maintenance. Dispatch and read-only views remain available. Writes may be delayed.";
