import type { CarrierNotification } from "@/lib/types/notifications";
import { DEMO_TENANT_ID } from "@/lib/data/tenant";

export type RealtimeNotificationEvent = {
  type: "notification.created" | "notification.updated" | "heartbeat";
  notification?: CarrierNotification;
  at: string;
};

export type RealtimeUnsubscribe = () => void;

export type RealtimeSubscribeOptions = {
  /** Polling interval when WebSocket is not available (ms). */
  intervalMs?: number;
  /** Chance (0–1) to emit a mock notification each tick. */
  emitProbability?: number;
};

const LIVE_TEMPLATES: Array<Omit<CarrierNotification, "id" | "createdAt" | "tenantId">> = [
  {
    category: "dispatch",
    type: "delay",
    title: "Delay reported on LD-24008",
    body: "Driver flagged 45 minutes behind schedule approaching Phoenix.",
    priority: "high",
    alphTier: "immediate_action",
    entityRefs: [
      { type: "load", id: "load-24008", label: "LD-24008" },
    ],
    actions: [
      {
        id: "view-load",
        label: "View Load",
        kind: "navigate",
        href: "/loads/load-24008",
        primary: true,
      },
      { id: "dismiss", label: "Dismiss", kind: "dismiss" },
    ],
    channels: ["in_app", "push", "desktop"],
  },
  {
    category: "documents",
    type: "pod_uploaded",
    title: "POD uploaded for LD-24005",
    body: "Driver submitted proof of delivery. Ready for OCR review.",
    priority: "medium",
    alphTier: "should_review_today",
    entityRefs: [
      { type: "load", id: "load-24005", label: "LD-24005" },
      { type: "document", id: "doc-pod-24005", label: "POD" },
    ],
    actions: [
      {
        id: "open-docs",
        label: "Open Documents",
        kind: "navigate",
        href: "/documents",
        primary: true,
      },
      { id: "mark-read", label: "Mark read", kind: "mark_read" },
    ],
    channels: ["in_app", "email"],
  },
  {
    category: "broker",
    type: "message_received",
    title: "Broker message received",
    body: "Freightline asked about appointment window on LD-24002.",
    priority: "medium",
    alphTier: "should_review_today",
    entityRefs: [
      { type: "broker", id: "broker-freightline", label: "Freightline" },
      { type: "load", id: "load-24002", label: "LD-24002" },
    ],
    actions: [
      {
        id: "open-portal",
        label: "Open Portal",
        kind: "navigate",
        href: "/portal",
        primary: true,
      },
      {
        id: "view-load",
        label: "View Load",
        kind: "navigate",
        href: "/loads/load-24002",
      },
    ],
    channels: ["in_app", "push"],
  },
  {
    category: "system",
    type: "api_error",
    title: "Telematics sync hiccup",
    body: "Samsara webhook returned 503. Retrying automatically.",
    priority: "low",
    alphTier: "informational",
    entityRefs: [],
    actions: [
      {
        id: "open-settings",
        label: "Integrations",
        kind: "navigate",
        href: "/settings",
        primary: true,
      },
      { id: "dismiss", label: "Dismiss", kind: "dismiss" },
    ],
    channels: ["in_app"],
  },
];

let sequence = 0;

/**
 * WebSocket-ready realtime layer.
 * Today: mock event stream via polling that occasionally appends new notifications.
 * Tomorrow: swap `subscribeNotificationStream` internals to a real WS client.
 */
export function subscribeNotificationStream(
  onEvent: (event: RealtimeNotificationEvent) => void,
  options: RealtimeSubscribeOptions = {},
): RealtimeUnsubscribe {
  const intervalMs = options.intervalMs ?? 28_000;
  const emitProbability = options.emitProbability ?? 0.35;

  onEvent({
    type: "heartbeat",
    at: new Date().toISOString(),
  });

  const timer = setInterval(() => {
    onEvent({
      type: "heartbeat",
      at: new Date().toISOString(),
    });

    if (Math.random() > emitProbability) return;

    const template =
      LIVE_TEMPLATES[Math.floor(Math.random() * LIVE_TEMPLATES.length)];
    sequence += 1;
    const notification: CarrierNotification = {
      ...template,
      tenantId: DEMO_TENANT_ID,
      id: `notif-live-${Date.now()}-${sequence}`,
      createdAt: new Date().toISOString(),
    };

    onEvent({
      type: "notification.created",
      notification,
      at: notification.createdAt,
    });
  }, intervalMs);

  return () => clearInterval(timer);
}

/**
 * Placeholder for a future WebSocket connection factory.
 */
export function createNotificationWebSocketStub(_url: string): {
  connect: () => void;
  disconnect: () => void;
  readyState: "stub";
} {
  return {
    readyState: "stub",
    connect: () => {
      // no-op until WS endpoint exists
    },
    disconnect: () => {
      // no-op
    },
  };
}
