export type PlatformModuleStatus = "live" | "coming";

export type AppStoreCategory =
  | "eld"
  | "fuel"
  | "insurance"
  | "accounting"
  | "ocr"
  | "ai"
  | "maintenance"
  | "cameras"
  | "gps"
  | "payroll"
  | "hr"
  | "compliance"
  | "telematics"
  | "apis"
  | "enterprise";

export type AppPermissionScope =
  | "loads.read"
  | "loads.write"
  | "drivers.read"
  | "fleet.read"
  | "documents.read"
  | "documents.write"
  | "finance.read"
  | "finance.write"
  | "compliance.read"
  | "webhooks.write"
  | "location.read";

export type PartnerLevel =
  | "registered"
  | "verified"
  | "gold"
  | "platinum"
  | "enterprise"
  | "technology"
  | "manufacturer"
  | "government";

export type AutomationTriggerId =
  | "pod_uploaded"
  | "maintenance_due"
  | "insurance_expires"
  | "truck_empty"
  | "driver_available"
  | "payment_received"
  | "load_delivered"
  | "compliance_alert";

export type AutomationActionId =
  | "create_invoice"
  | "schedule_maintenance"
  | "notify_team"
  | "suggest_loads"
  | "match_freight"
  | "sync_accounting"
  | "request_document"
  | "open_workflow";

export type PlatformLanguage =
  | "en"
  | "es"
  | "fr"
  | "pt"
  | "hi"
  | "pl"
  | "ru"
  | "zh";

export type CorePlatformModule = {
  id: string;
  title: string;
  description: string;
  href: string;
  status: PlatformModuleStatus;
  group: "ops" | "people" | "money" | "safety" | "intelligence";
  ctaLabel?: string;
};

export type EcosystemNode = {
  id: string;
  title: string;
  description: string;
  href: string;
  status: PlatformModuleStatus;
  brand?: string;
};

export type PlatformApp = {
  id: string;
  name: string;
  developer: string;
  category: AppStoreCategory;
  tagline: string;
  description: string;
  permissions: AppPermissionScope[];
  revenueShareNote: string;
  website?: string;
  rating: number;
  installsLabel: string;
  featured?: boolean;
};

export type InstalledApp = {
  appId: string;
  installedAt: string;
  enabledScopes: AppPermissionScope[];
};

export type PlatformPartner = {
  id: string;
  name: string;
  level: PartnerLevel;
  category: string;
  description: string;
  region: string;
  contactEmail: string;
  apiAccess: "none" | "sandbox" | "production";
  integrationStatus: "not_started" | "in_progress" | "live" | "certified";
  leadsOpen: number;
  certification: string;
  marketingAssets: string[];
  analytics: {
    impressions: number;
    leads: number;
    conversions: number;
    apiCalls30d: number;
  };
};

export type DeveloperDocSection = {
  id: string;
  title: string;
  body: string;
};

export type ApiKeyRecord = {
  id: string;
  name: string;
  prefix: string;
  secretHint: string;
  createdAt: string;
  lastUsedAt?: string;
  revokedAt?: string;
  environment: "sandbox" | "production";
};

export type SandboxRequestLog = {
  id: string;
  at: string;
  method: string;
  path: string;
  status: number;
  latencyMs: number;
  note: string;
};

export type PlatformAutomationRecipe = {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTriggerId;
  action: AutomationActionId;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  linkedWorkflowHref?: string;
};

export type PlatformAuditEntry = {
  id: string;
  at: string;
  actor: string;
  action: string;
  resource: string;
  details: string;
};

export type FraudFlag = {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  detail: string;
  href?: string;
};

export type BusinessHealthScore = {
  score: number;
  label: string;
  drivers: Array<{ label: string; value: number; href: string }>;
};

export const APP_CATEGORY_LABELS: Record<AppStoreCategory, string> = {
  eld: "ELDs",
  fuel: "Fuel",
  insurance: "Insurance",
  accounting: "Accounting",
  ocr: "OCR",
  ai: "AI Assistants",
  maintenance: "Maintenance",
  cameras: "Cameras",
  gps: "GPS",
  payroll: "Payroll",
  hr: "HR",
  compliance: "Compliance",
  telematics: "Telematics",
  apis: "APIs",
  enterprise: "Custom Enterprise",
};

export const PERMISSION_SCOPE_LABELS: Record<AppPermissionScope, string> = {
  "loads.read": "Read loads",
  "loads.write": "Create & update loads",
  "drivers.read": "Read drivers",
  "fleet.read": "Read fleet",
  "documents.read": "Read documents",
  "documents.write": "Upload documents",
  "finance.read": "Read finance",
  "finance.write": "Create invoices & payments",
  "compliance.read": "Read compliance",
  "webhooks.write": "Send webhooks",
  "location.read": "Read location",
};

export const PARTNER_LEVEL_LABELS: Record<PartnerLevel, string> = {
  registered: "Registered",
  verified: "Verified",
  gold: "Gold",
  platinum: "Platinum",
  enterprise: "Enterprise",
  technology: "Technology",
  manufacturer: "Manufacturer",
  government: "Government",
};

export const AUTOMATION_TRIGGER_LABELS: Record<AutomationTriggerId, string> = {
  pod_uploaded: "POD uploaded",
  maintenance_due: "Maintenance due",
  insurance_expires: "Insurance expires",
  truck_empty: "Truck empty",
  driver_available: "Driver available",
  payment_received: "Payment received",
  load_delivered: "Load delivered",
  compliance_alert: "Compliance alert",
};

export const AUTOMATION_ACTION_LABELS: Record<AutomationActionId, string> = {
  create_invoice: "Create invoice",
  schedule_maintenance: "Schedule maintenance",
  notify_team: "Notify team",
  suggest_loads: "Suggest loads",
  match_freight: "Match freight",
  sync_accounting: "Sync accounting",
  request_document: "Request document",
  open_workflow: "Open workflow builder",
};

export const LANGUAGE_LABELS: Record<PlatformLanguage, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  pt: "Português",
  hi: "हिन्दी",
  pl: "Polski",
  ru: "Русский",
  zh: "中文",
};
