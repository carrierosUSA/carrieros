export type NotificationCategory =
  | "dispatch"
  | "driver"
  | "documents"
  | "accounting"
  | "maintenance"
  | "safety"
  | "broker"
  | "system";

export type NotificationPriority = "critical" | "high" | "medium" | "low";

export type NotificationChannel =
  | "in_app"
  | "push"
  | "email"
  | "sms"
  | "desktop";

export type AlphTier =
  | "immediate_action"
  | "should_review_today"
  | "informational";

export type NotificationActionKind =
  | "navigate"
  | "mark_read"
  | "dismiss"
  | "archive"
  | "ignore";

export type NotificationEntityType =
  | "load"
  | "driver"
  | "document"
  | "invoice"
  | "truck"
  | "trailer"
  | "broker"
  | "user"
  | "work_order";

export type NotificationAction = {
  id: string;
  label: string;
  kind: NotificationActionKind;
  href?: string;
  primary?: boolean;
};

export type NotificationEntityRef = {
  type: NotificationEntityType;
  id: string;
  label: string;
};

export type CarrierNotification = {
  id: string;
  tenantId: string;
  category: NotificationCategory;
  type: string;
  title: string;
  body: string;
  priority: NotificationPriority;
  alphTier: AlphTier;
  createdAt: string;
  readAt?: string | null;
  dismissedAt?: string | null;
  archivedAt?: string | null;
  entityRefs: NotificationEntityRef[];
  actions: NotificationAction[];
  channels?: NotificationChannel[];
};

export type NotificationGroupKey =
  | "today"
  | "yesterday"
  | "this_week"
  | "earlier";

export type NotificationGroup = {
  key: NotificationGroupKey;
  label: string;
  items: CarrierNotification[];
};

export type NotificationFilterCategory = NotificationCategory | "all";

export type NotificationChannelPreferences = Record<NotificationChannel, boolean>;

export type NotificationPreferences = {
  channels: NotificationChannelPreferences;
  quietHoursEnabled: boolean;
};

export type AlphDailySummary = {
  todaysPriorities: string[];
  missingDocuments: string[];
  upcomingDeliveries: string[];
  driversAvailable: string[];
  pmDue: string[];
  invoicesReady: string[];
  paymentsDue: string[];
  criticalAlerts: string[];
  generatedAt: string;
};

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  "dispatch",
  "driver",
  "documents",
  "accounting",
  "maintenance",
  "safety",
  "broker",
  "system",
];

export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategory, string> = {
  dispatch: "Dispatch",
  driver: "Driver",
  documents: "Documents",
  accounting: "Accounting",
  maintenance: "Maintenance",
  safety: "Safety",
  broker: "Broker",
  system: "System",
};

export const NOTIFICATION_PRIORITIES: NotificationPriority[] = [
  "critical",
  "high",
  "medium",
  "low",
];

export const NOTIFICATION_PRIORITY_LABELS: Record<NotificationPriority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const NOTIFICATION_CHANNELS: NotificationChannel[] = [
  "in_app",
  "push",
  "email",
  "sms",
  "desktop",
];

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  in_app: "In-App",
  push: "Push",
  email: "Email",
  sms: "SMS",
  desktop: "Desktop Notification",
};

export const ALPH_TIER_LABELS: Record<AlphTier, string> = {
  immediate_action: "Immediate Action Required",
  should_review_today: "Should Review Today",
  informational: "Informational",
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  channels: {
    in_app: true,
    push: true,
    email: true,
    sms: false,
    desktop: true,
  },
  quietHoursEnabled: false,
};
