import type {
  AlphDailySummary,
  AlphTier,
  CarrierNotification,
  NotificationPriority,
} from "@/lib/types/notifications";

const PRIORITY_WEIGHT: Record<NotificationPriority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Alph auto-prioritization: maps urgency + category signals into review tiers.
 * Prefer explicit alphTier on the notification when already seeded.
 */
export function resolveAlphTier(
  notification: Pick<CarrierNotification, "priority" | "alphTier" | "category" | "type">,
): AlphTier {
  if (notification.alphTier) return notification.alphTier;

  if (notification.priority === "critical") return "immediate_action";
  if (notification.priority === "high") return "should_review_today";

  const urgentTypes = new Set([
    "delay",
    "missing_pod",
    "missing_invoice",
    "payment_overdue",
    "breakdown_reported",
    "accident_reported",
    "api_error",
    "integration_failed",
    "cdl_expiring",
    "medical_expiring",
    "insurance_expiring",
  ]);

  if (urgentTypes.has(notification.type)) {
    return notification.priority === "low"
      ? "should_review_today"
      : "immediate_action";
  }

  if (notification.priority === "medium") return "should_review_today";
  return "informational";
}

export function sortByAlphPriority(
  a: CarrierNotification,
  b: CarrierNotification,
): number {
  const tierRank: Record<AlphTier, number> = {
    immediate_action: 0,
    should_review_today: 1,
    informational: 2,
  };
  const ta = resolveAlphTier(a);
  const tb = resolveAlphTier(b);
  if (tierRank[ta] !== tierRank[tb]) return tierRank[ta] - tierRank[tb];
  if (PRIORITY_WEIGHT[b.priority] !== PRIORITY_WEIGHT[a.priority]) {
    return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
  }
  return b.createdAt.localeCompare(a.createdAt);
}

function titlesMatching(
  notifications: CarrierNotification[],
  predicate: (n: CarrierNotification) => boolean,
  limit = 4,
): string[] {
  return notifications
    .filter(predicate)
    .sort(sortByAlphPriority)
    .slice(0, limit)
    .map((n) => n.title);
}

/**
 * Builds Alph Daily Summary from the live notification board.
 */
export function generateAlphDailySummary(
  notifications: CarrierNotification[],
  now = new Date(),
): AlphDailySummary {
  const active = notifications.filter((n) => !n.dismissedAt && !n.archivedAt);
  const todayStart = startOfDay(now).getTime();

  const todaysPriorities = active
    .filter(
      (n) =>
        resolveAlphTier(n) === "immediate_action" ||
        (n.priority === "critical" && new Date(n.createdAt).getTime() >= todayStart),
    )
    .sort(sortByAlphPriority)
    .slice(0, 5)
    .map((n) => n.title);

  return {
    todaysPriorities:
      todaysPriorities.length > 0
        ? todaysPriorities
        : ["No critical priorities — operations look calm."],
    missingDocuments: titlesMatching(
      active,
      (n) =>
        n.category === "documents" &&
        (n.type.includes("missing") || n.type === "document_rejected"),
    ),
    upcomingDeliveries: titlesMatching(
      active,
      (n) =>
        n.category === "dispatch" &&
        (n.type === "appointment_changed" ||
          n.type === "delay" ||
          n.type === "load_assigned"),
    ),
    driversAvailable: titlesMatching(
      active,
      (n) =>
        n.category === "driver" &&
        (n.type === "checked_out" || n.type === "completed_delivery"),
    ),
    pmDue: titlesMatching(
      active,
      (n) =>
        n.category === "maintenance" &&
        (n.type === "pm_due" ||
          n.type === "tire_replacement_due" ||
          n.type === "warranty_expiring"),
    ),
    invoicesReady: titlesMatching(
      active,
      (n) =>
        (n.category === "accounting" || n.category === "documents") &&
        (n.type === "invoice_created" ||
          n.type === "invoice_sent" ||
          n.type === "payroll_ready"),
    ),
    paymentsDue: titlesMatching(
      active,
      (n) =>
        n.category === "accounting" &&
        (n.type === "payment_overdue" || n.type === "payment_received"),
    ),
    criticalAlerts: titlesMatching(
      active,
      (n) => n.priority === "critical" || resolveAlphTier(n) === "immediate_action",
      6,
    ),
    generatedAt: now.toISOString(),
  };
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
