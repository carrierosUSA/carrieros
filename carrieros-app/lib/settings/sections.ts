import type { SettingsSectionId } from "@/lib/settings/types";

export type SettingsNavItem = {
  id: SettingsSectionId;
  label: string;
  description: string;
  group: "workspace" | "plans" | "templates" | "platform" | "security";
};

export const SETTINGS_SECTION_IDS: SettingsSectionId[] = [
  "company",
  "users",
  "permissions",
  "billing",
  "subscription",
  "notifications",
  "branding",
  "email-templates",
  "sms-templates",
  "invoice-templates",
  "document-templates",
  "automation",
  "ai-policy",
  "api-keys",
  "integrations",
  "backup",
  "security",
  "audit-logs",
];

export const SETTINGS_NAV: SettingsNavItem[] = [
  {
    id: "company",
    label: "Company",
    description: "Identity, address, and units",
    group: "workspace",
  },
  {
    id: "users",
    label: "Users",
    description: "Invite teammates and assign roles",
    group: "workspace",
  },
  {
    id: "permissions",
    label: "Permissions",
    description: "Roles and access matrix",
    group: "workspace",
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Channels and quiet hours",
    group: "workspace",
  },
  {
    id: "branding",
    label: "Branding",
    description: "Logo, color, and email footer",
    group: "workspace",
  },
  {
    id: "billing",
    label: "Billing",
    description: "Payment method and invoices",
    group: "plans",
  },
  {
    id: "subscription",
    label: "Subscription",
    description: "Plan, seats, and upgrades",
    group: "plans",
  },
  {
    id: "email-templates",
    label: "Email templates",
    description: "Invoice, rate con, POD, reminders",
    group: "templates",
  },
  {
    id: "sms-templates",
    label: "SMS templates",
    description: "Check call, POD, appointments",
    group: "templates",
  },
  {
    id: "invoice-templates",
    label: "Invoice templates",
    description: "Layout, logo, and terms",
    group: "templates",
  },
  {
    id: "document-templates",
    label: "Document templates",
    description: "Packet checklists and naming",
    group: "templates",
  },
  {
    id: "automation",
    label: "Automation",
    description: "Summary — full tools in Advanced",
    group: "platform",
  },
  {
    id: "ai-policy",
    label: "AI Safety Policy",
    description: "Company prefs — full policy in Advanced",
    group: "platform",
  },
  {
    id: "api-keys",
    label: "API keys",
    description: "Create and revoke keys",
    group: "platform",
  },
  {
    id: "integrations",
    label: "Integrations",
    description: "Quick toggles — full center in Advanced",
    group: "platform",
  },
  {
    id: "backup",
    label: "Backup",
    description: "Export and schedule",
    group: "platform",
  },
  {
    id: "security",
    label: "Security",
    description: "2FA, sessions, password policy",
    group: "security",
  },
  {
    id: "audit-logs",
    label: "Audit logs",
    description: "Who changed what",
    group: "security",
  },
];

export const SETTINGS_GROUP_LABELS: Record<SettingsNavItem["group"], string> = {
  workspace: "Workspace",
  plans: "Plans & billing",
  templates: "Templates",
  platform: "Platform",
  security: "Security",
};

export function parseSettingsSection(
  value: string | null | undefined,
): SettingsSectionId {
  if (value && SETTINGS_SECTION_IDS.includes(value as SettingsSectionId)) {
    return value as SettingsSectionId;
  }
  return "company";
}

export function getSettingsNavItem(
  id: SettingsSectionId,
): SettingsNavItem | undefined {
  return SETTINGS_NAV.find((item) => item.id === id);
}
