/**
 * Integration Center domain types.
 * Runtime state lives in the client store; catalog is static metadata.
 */

export type IntegrationCategory =
  | "maps"
  | "eld_telematics"
  | "accounting"
  | "communication"
  | "payments"
  | "storage"
  | "marketplace";

export type IntegrationStatus =
  | "connected"
  | "disconnected"
  | "error"
  | "pending";

export type IntegrationProviderId =
  | "google_maps"
  | "mapbox"
  | "motive"
  | "samsara"
  | "geotab"
  | "omnitracs"
  | "quickbooks"
  | "xero"
  | "twilio"
  | "sendgrid"
  | "stripe"
  | "google_drive"
  | "dropbox"
  | "onedrive";

export type IntegrationAuthMode = "api_key" | "oauth";

export type IntegrationHealth = {
  lastSyncAt: string | null;
  latencyMs: number | null;
  /** 0–100 */
  successRate: number | null;
  /** Recent sample points for a sparkline (0–100). */
  sparkline: number[];
};

export type IntegrationLogLevel = "success" | "fail" | "info";

export type IntegrationLogEntry = {
  id: string;
  providerId: IntegrationProviderId;
  timestamp: string;
  level: IntegrationLogLevel;
  message: string;
  latencyMs?: number;
};

export type IntegrationCredentials = {
  mode: IntegrationAuthMode;
  /** Masked demo key only — never store real secrets in git. */
  apiKeyMasked?: string;
  connectedAccountLabel?: string;
};

export type IntegrationRuntimeState = {
  providerId: IntegrationProviderId;
  enabled: boolean;
  status: IntegrationStatus;
  credentials?: IntegrationCredentials;
  health: IntegrationHealth;
  errorMessage?: string;
  comingSoon?: boolean;
};

export type IntegrationCatalogItem = {
  id: IntegrationProviderId;
  name: string;
  description: string;
  category: Exclude<IntegrationCategory, "marketplace">;
  docsUrl: string;
  authMode: IntegrationAuthMode;
  initials: string;
  comingSoon?: boolean;
  /** Pointer to an existing stub module for future wiring. */
  relatedStub?: string;
};

export type IntegrationStoreState = {
  connections: Record<IntegrationProviderId, IntegrationRuntimeState>;
  logs: IntegrationLogEntry[];
  updatedAt: string;
};

export type IntegrationHealthSummary = {
  connected: number;
  disconnected: number;
  error: number;
  pending: number;
  enabled: number;
  avgSuccessRate: number | null;
  avgLatencyMs: number | null;
};

export const INTEGRATION_CATEGORY_LABELS: Record<IntegrationCategory, string> =
  {
    maps: "Maps",
    eld_telematics: "ELD / Telematics",
    accounting: "Accounting",
    communication: "Communication",
    payments: "Payments",
    storage: "Storage",
    marketplace: "API Marketplace",
  };

export const INTEGRATION_STATUS_LABELS: Record<IntegrationStatus, string> = {
  connected: "Connected",
  disconnected: "Disconnected",
  error: "Error",
  pending: "Pending",
};
