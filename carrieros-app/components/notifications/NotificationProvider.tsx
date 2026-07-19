"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  archiveNotification,
  dismissNotification,
  getNotificationPreferences,
  getNotificationsSnapshot,
  ignoreNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  prependNotification,
  subscribeNotifications,
  updateNotificationPreferences,
} from "@/lib/data/notification-store";
import { generateAlphDailySummary } from "@/lib/notifications/alph-priority";
import { deliverNotification } from "@/lib/notifications/delivery";
import {
  buildNotificationBoard,
  isNotificationUnread,
  type NotificationBoardQuery,
} from "@/lib/notifications/notification-board";
import { subscribeNotificationStream } from "@/lib/notifications/realtime";
import type {
  AlphDailySummary,
  CarrierNotification,
  NotificationAction,
  NotificationFilterCategory,
  NotificationPreferences,
} from "@/lib/types/notifications";

type NotificationCenterContextValue = {
  notifications: CarrierNotification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  open: boolean;
  setOpen: (open: boolean) => void;
  category: NotificationFilterCategory;
  setCategory: (category: NotificationFilterCategory) => void;
  search: string;
  setSearch: (search: string) => void;
  showPreferences: boolean;
  setShowPreferences: (show: boolean) => void;
  board: ReturnType<typeof buildNotificationBoard>;
  alphSummary: AlphDailySummary;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  archive: (id: string) => void;
  ignore: (id: string) => void;
  runAction: (notification: CarrierNotification, action: NotificationAction) => string | null;
  updatePreferences: (next: Partial<NotificationPreferences>) => void;
  livePulse: boolean;
};

const NotificationCenterContext =
  createContext<NotificationCenterContextValue | null>(null);

function useNotificationStore() {
  const notifications = useSyncExternalStore(
    subscribeNotifications,
    listNotifications,
    getNotificationsSnapshot,
  );
  const preferences = useSyncExternalStore(
    subscribeNotifications,
    getNotificationPreferences,
    getNotificationPreferences,
  );
  return { notifications, preferences };
}

export function useNotificationCenter() {
  const ctx = useContext(NotificationCenterContext);
  if (!ctx) {
    throw new Error(
      "useNotificationCenter must be used within NotificationProvider",
    );
  }
  return ctx;
}

type NotificationProviderProps = {
  children: ReactNode;
};

export default function NotificationProvider({
  children,
}: NotificationProviderProps) {
  const { notifications, preferences } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const [category, setCategory] =
    useState<NotificationFilterCategory>("all");
  const [search, setSearch] = useState("");
  const [showPreferences, setShowPreferences] = useState(false);
  const [livePulse, setLivePulse] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeNotificationStream((event) => {
      if (event.type === "heartbeat") {
        setLivePulse((v) => !v);
        return;
      }
      if (event.type === "notification.created" && event.notification) {
        prependNotification(event.notification);
        void deliverNotification(
          event.notification,
          getNotificationPreferences(),
        );
        setLivePulse((v) => !v);
      }
    });
    return unsubscribe;
  }, []);

  const query: NotificationBoardQuery = useMemo(
    () => ({ category, search }),
    [category, search],
  );

  const board = useMemo(
    () => buildNotificationBoard(notifications, query),
    [notifications, query],
  );

  const alphSummary = useMemo(
    () => generateAlphDailySummary(notifications),
    [notifications],
  );

  const unreadCount = useMemo(
    () => notifications.filter(isNotificationUnread).length,
    [notifications],
  );

  const markRead = useCallback((id: string) => {
    markNotificationRead(id);
  }, []);

  const markAllRead = useCallback(() => {
    markAllNotificationsRead();
  }, []);

  const dismiss = useCallback((id: string) => {
    dismissNotification(id);
  }, []);

  const archive = useCallback((id: string) => {
    archiveNotification(id);
  }, []);

  const ignore = useCallback((id: string) => {
    ignoreNotification(id);
  }, []);

  const updatePreferences = useCallback(
    (next: Partial<NotificationPreferences>) => {
      updateNotificationPreferences(next);
    },
    [],
  );

  const runAction = useCallback(
    (notification: CarrierNotification, action: NotificationAction) => {
      switch (action.kind) {
        case "mark_read":
          markNotificationRead(notification.id);
          return null;
        case "dismiss":
        case "ignore":
          dismissNotification(notification.id);
          return null;
        case "archive":
          archiveNotification(notification.id);
          return null;
        case "navigate":
          markNotificationRead(notification.id);
          return action.href ?? null;
        default:
          return null;
      }
    },
    [],
  );

  const value: NotificationCenterContextValue = {
    notifications,
    unreadCount,
    preferences,
    open,
    setOpen,
    category,
    setCategory,
    search,
    setSearch,
    showPreferences,
    setShowPreferences,
    board,
    alphSummary,
    markRead,
    markAllRead,
    dismiss,
    archive,
    ignore,
    runAction,
    updatePreferences,
    livePulse,
  };

  return (
    <NotificationCenterContext.Provider value={value}>
      {children}
    </NotificationCenterContext.Provider>
  );
}
