export type CopilotRole =
  | "driver"
  | "dispatcher"
  | "safety"
  | "maintenance"
  | "accounting"
  | "owner";

export type CopilotSeverity = "info" | "success" | "warning" | "critical";

export type CopilotMemoryKind =
  | "preferred_truck"
  | "preferred_route"
  | "frequent_contact"
  | "favorite_fuel_stop"
  | "customer_pref"
  | "driver_habit"
  | "frequent_doc"
  | "conversation"
  | "previous_issue"
  | "company_pref"
  | "dispatch_habit"
  | "other";

export type CopilotMemoryItem = {
  id: string;
  role: CopilotRole;
  kind: CopilotMemoryKind;
  label: string;
  value: string;
  updatedAt: string;
};

export type CopilotAlertAction = {
  label: string;
  href?: string;
  commandId?: string;
  primary?: boolean;
};

export type CopilotAlertStatus = "active" | "dismissed" | "snoozed" | "acted";

export type CopilotAlert = {
  id: string;
  role: CopilotRole | "all";
  title: string;
  body: string;
  severity: CopilotSeverity;
  category: string;
  createdAt: string;
  status: CopilotAlertStatus;
  snoozeUntil?: string;
  actions: CopilotAlertAction[];
};

export type CopilotCommandRisk = "safe" | "confirm";

export type CopilotCommandDef = {
  id: string;
  phrase: string;
  label: string;
  description: string;
  roles: CopilotRole[] | "all";
  href?: string;
  risk: CopilotCommandRisk;
  demoResult: string;
  keywords: string[];
};

export type CopilotCommandResult = {
  commandId: string;
  phrase: string;
  title: string;
  body: string;
  href?: string;
  requiresConfirm: boolean;
  confirmed?: boolean;
  ranAt: string;
};

export type CopilotLearningInsight = {
  id: string;
  role: CopilotRole | "all";
  title: string;
  detail: string;
  basedOn: string;
  improved: string;
  automationHref?: string;
  automationLabel?: string;
};

export type CopilotActivityItem = {
  id: string;
  role: CopilotRole;
  title: string;
  detail: string;
  at: string;
  href?: string;
};

export type CopilotSuggestedAction = {
  id: string;
  label: string;
  href?: string;
  commandId?: string;
  description: string;
};

export type CopilotRoleDefinition = {
  id: CopilotRole;
  name: string;
  title: string;
  tagline: string;
  href: string;
  capabilities: string[];
  suggestedActions: CopilotSuggestedAction[];
  commandChips: string[];
};

export type CopilotPersistedState = {
  activeRole: CopilotRole;
  memory: CopilotMemoryItem[];
  alerts: CopilotAlert[];
  learningPrefs: Record<string, string | number | boolean>;
  recentCommands: CopilotCommandResult[];
  activity: CopilotActivityItem[];
};
