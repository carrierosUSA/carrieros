import type {
  CarrierNotification,
  NotificationFilterCategory,
  NotificationGroup,
  NotificationGroupKey,
} from "@/lib/types/notifications";
import { resolveAlphTier, sortByAlphPriority } from "@/lib/notifications/alph-priority";

export type NotificationBoardQuery = {
  category?: NotificationFilterCategory;
  search?: string;
  includeDismissed?: boolean;
  includeArchived?: boolean;
  unreadOnly?: boolean;
};

export type NotificationBoardResult = {
  groups: NotificationGroup[];
  flat: CarrierNotification[];
  unreadCount: number;
  totalCount: number;
  categoryCounts: Record<string, number>;
};

const GROUP_LABELS: Record<NotificationGroupKey, string> = {
  today: "Today",
  yesterday: "Yesterday",
  this_week: "This Week",
  earlier: "Earlier",
};

export function isNotificationUnread(n: CarrierNotification): boolean {
  return !n.readAt && !n.dismissedAt && !n.archivedAt;
}

export function filterNotifications(
  notifications: CarrierNotification[],
  query: NotificationBoardQuery = {},
): CarrierNotification[] {
  const q = (query.search ?? "").trim().toLowerCase();
  const category = query.category ?? "all";

  return notifications
    .filter((n) => {
      if (!query.includeDismissed && n.dismissedAt) return false;
      if (!query.includeArchived && n.archivedAt) return false;
      if (query.unreadOnly && !isNotificationUnread(n)) return false;
      if (category !== "all" && n.category !== category) return false;
      if (!q) return true;

      const haystack = [
        n.title,
        n.body,
        n.type,
        n.category,
        ...n.entityRefs.map((e) => `${e.label} ${e.id} ${e.type}`),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    })
    .sort(sortByAlphPriority);
}

export function groupNotifications(
  notifications: CarrierNotification[],
  now = new Date(),
): NotificationGroup[] {
  const buckets: Record<NotificationGroupKey, CarrierNotification[]> = {
    today: [],
    yesterday: [],
    this_week: [],
    earlier: [],
  };

  for (const n of notifications) {
    buckets[groupKeyForDate(n.createdAt, now)].push(n);
  }

  return (Object.keys(buckets) as NotificationGroupKey[])
    .filter((key) => buckets[key].length > 0)
    .map((key) => ({
      key,
      label: GROUP_LABELS[key],
      items: buckets[key],
    }));
}

export function buildNotificationBoard(
  notifications: CarrierNotification[],
  query: NotificationBoardQuery = {},
  now = new Date(),
): NotificationBoardResult {
  const flat = filterNotifications(notifications, query);
  const unreadCount = notifications.filter(isNotificationUnread).length;
  const categoryCounts: Record<string, number> = { all: 0 };

  for (const n of notifications) {
    if (n.dismissedAt || n.archivedAt) continue;
    categoryCounts.all = (categoryCounts.all ?? 0) + 1;
    categoryCounts[n.category] = (categoryCounts[n.category] ?? 0) + 1;
  }

  return {
    groups: groupNotifications(flat, now),
    flat,
    unreadCount,
    totalCount: flat.length,
    categoryCounts,
  };
}

export function unreadCountByCategory(
  notifications: CarrierNotification[],
): Partial<Record<string, number>> {
  const counts: Partial<Record<string, number>> = {};
  for (const n of notifications) {
    if (!isNotificationUnread(n)) continue;
    counts[n.category] = (counts[n.category] ?? 0) + 1;
  }
  return counts;
}

export function enrichWithAlphTier(
  notification: CarrierNotification,
): CarrierNotification {
  return {
    ...notification,
    alphTier: resolveAlphTier(notification),
  };
}

function groupKeyForDate(iso: string, now: Date): NotificationGroupKey {
  const created = new Date(iso);
  const today = startOfDay(now);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const weekStart = new Date(today);
  const day = weekStart.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  weekStart.setDate(weekStart.getDate() - diffToMonday);

  if (created >= today) return "today";
  if (created >= yesterday) return "yesterday";
  if (created >= weekStart) return "this_week";
  return "earlier";
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatRelativeTime(iso: string, now = new Date()): string {
  const then = new Date(iso).getTime();
  const diffMs = now.getTime() - then;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
