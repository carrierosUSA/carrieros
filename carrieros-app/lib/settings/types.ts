import type { NotificationPreferences } from "@/lib/types/notifications";
import type { BuiltInRoleId } from "@/lib/permissions/types";

export type SettingsSectionId =
  | "company"
  | "users"
  | "permissions"
  | "billing"
  | "subscription"
  | "notifications"
  | "branding"
  | "email-templates"
  | "sms-templates"
  | "invoice-templates"
  | "document-templates"
  | "automation"
  | "ai-policy"
  | "api-keys"
  | "integrations"
  | "backup"
  | "security"
  | "audit-logs";

export type DistanceUnit = "miles" | "kilometers";
export type TemperatureUnit = "f" | "c";
export type WeightUnit = "lb" | "kg";

export type CompanySettings = {
  name: string;
  mcNumber: string;
  dotNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  logoDataUrl: string | null;
  timezone: string;
  distanceUnit: DistanceUnit;
  temperatureUnit: TemperatureUnit;
  weightUnit: WeightUnit;
};

export type SettingsUserStatus = "active" | "invited" | "disabled";

export type SettingsUser = {
  id: string;
  name: string;
  email: string;
  title: string;
  roleId: BuiltInRoleId | string;
  status: SettingsUserStatus;
  invitedAt?: string;
  lastActiveAt?: string;
};

export type BillingSettings = {
  billingEmail: string;
  cardBrand: string;
  cardLast4: string;
  cardExpMonth: number;
  cardExpYear: number;
  invoices: BillingInvoice[];
};

export type BillingInvoice = {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "open" | "failed";
  description: string;
};

export type SubscriptionPlanId = "starter" | "growth" | "enterprise";

export type SubscriptionSettings = {
  plan: SubscriptionPlanId;
  seats: number;
  seatsUsed: number;
  renewsAt: string;
  features: string[];
};

export type BrandingSettings = {
  logoDataUrl: string | null;
  primaryColor: string;
  emailFooter: string;
};

export type EmailTemplateId =
  | "invoice"
  | "rate_con"
  | "pod_request"
  | "payment_reminder";

export type SmsTemplateId =
  | "check_call"
  | "pod_request"
  | "appointment_reminder";

export type MessageTemplate = {
  id: string;
  name: string;
  subject?: string;
  body: string;
  updatedAt: string;
};

export type InvoiceTemplateSettings = {
  showLogo: boolean;
  showCompanyAddress: boolean;
  showPaymentTerms: boolean;
  showBankDetails: boolean;
  terms: string;
  footerNote: string;
  layout: "classic" | "compact" | "modern";
};

export type DocumentPacketChecklist = {
  id: string;
  name: string;
  items: string[];
  namingPattern: string;
};

export type DocumentTemplateSettings = {
  packets: DocumentPacketChecklist[];
  defaultNamingPattern: string;
};

export type ApiKeyRecord = {
  id: string;
  name: string;
  prefix: string;
  lastFour: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

export type IntegrationProviderId =
  | "quickbooks"
  | "xero"
  | "stripe"
  | "plaid"
  | "twilio"
  | "samsara"
  | "motive"
  | "geotab"
  | "fmcsa";

export type IntegrationConnectionStatus =
  | "connected"
  | "disconnected"
  | "error";

export type IntegrationConnection = {
  providerId: IntegrationProviderId;
  status: IntegrationConnectionStatus;
  connectedAt?: string;
  lastSyncAt?: string;
  note?: string;
};

export type BackupSchedule = "off" | "daily" | "weekly";

export type BackupSettings = {
  lastBackupAt: string | null;
  schedule: BackupSchedule;
  includeDocuments: boolean;
};

export type SecuritySettings = {
  require2fa: boolean;
  sessionTimeoutMinutes: number;
  minPasswordLength: number;
  requireSpecialChar: boolean;
  requireNumber: boolean;
  ipAllowlistEnabled: boolean;
  ipAllowlist: string[];
};

export type SettingsAuditEntry = {
  id: string;
  timestamp: string;
  actorName: string;
  action: string;
  resource: string;
  details: string;
  ip?: string;
};

export type WorkflowSummaryItem = {
  id: string;
  name: string;
  enabled: boolean;
  triggerLabel: string;
  lastRunAt?: string;
};

export type CarrierSettingsState = {
  company: CompanySettings;
  users: SettingsUser[];
  billing: BillingSettings;
  subscription: SubscriptionSettings;
  notifications: NotificationPreferences;
  branding: BrandingSettings;
  emailTemplates: MessageTemplate[];
  smsTemplates: MessageTemplate[];
  invoiceTemplate: InvoiceTemplateSettings;
  documentTemplates: DocumentTemplateSettings;
  apiKeys: ApiKeyRecord[];
  integrations: IntegrationConnection[];
  backup: BackupSettings;
  security: SecuritySettings;
  auditLog: SettingsAuditEntry[];
  workflowSummaries: WorkflowSummaryItem[];
  updatedAt: string;
};

export const SEMANTIC_BLUE_PALETTE = [
  { id: "blue-600", value: "#2563EB", label: "Primary blue" },
  { id: "blue-700", value: "#1D4ED8", label: "Deep blue" },
  { id: "blue-500", value: "#3B82F6", label: "Bright blue" },
  { id: "blue-800", value: "#1E40AF", label: "Navy" },
  { id: "sky-600", value: "#0284C7", label: "Sky" },
] as const;
