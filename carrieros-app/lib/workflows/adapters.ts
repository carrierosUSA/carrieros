import { prependNotification } from "@/lib/data/notification-store";
import { DEMO_TENANT_ID } from "@/lib/data/tenant";
import { getActionLabel } from "@/lib/workflows/catalog";
import type {
  ActionAdapterResult,
  WorkflowAction,
  WorkflowActionType,
  WorkflowEventPayload,
} from "@/lib/workflows/types";

type AdapterFn = (
  action: WorkflowAction,
  payload: WorkflowEventPayload,
) => ActionAdapterResult;

function str(value: unknown, fallback = ""): string {
  if (value == null) return fallback;
  return String(value);
}

function pushInAppNotification(input: {
  category: "accounting" | "safety" | "driver" | "dispatch" | "system" | "broker";
  type: string;
  title: string;
  body: string;
  priority?: "critical" | "high" | "medium" | "low";
}) {
  const id = `notif-wf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  prependNotification({
    id,
    tenantId: DEMO_TENANT_ID,
    category: input.category,
    type: input.type,
    title: input.title,
    body: input.body,
    priority: input.priority ?? "medium",
    alphTier: input.priority === "critical" ? "immediate_action" : "should_review_today",
    createdAt: new Date().toISOString(),
    entityRefs: [],
    actions: [
      {
        id: `${id}-open`,
        label: "Open workflows",
        kind: "navigate",
        href: "/workflows",
        primary: true,
      },
    ],
    channels: ["in_app"],
  });
  return id;
}

const adapters: Record<WorkflowActionType, AdapterFn> = {
  create_invoice: (action, payload) => {
    const loadRef = str(payload.loadReference, "load");
    const note = action.params?.note || "Auto-created from workflow";
    return {
      ok: true,
      message: `Invoice draft stub created for ${loadRef}. Note: ${note}`,
    };
  },

  notify_accounting: (action, payload) => {
    const message =
      action.params?.message ||
      `Accounting attention needed for ${str(payload.loadReference, "a load")}.`;
    pushInAppNotification({
      category: "accounting",
      type: "workflow.notify_accounting",
      title: "Accounting notified",
      body: message,
      priority: "high",
    });
    return { ok: true, message: `Notified accounting: ${message}` };
  },

  send_load_details: (action, payload) => {
    const driver = str(payload.driverName, "driver");
    const channel = action.params?.channel || "app";
    return {
      ok: true,
      message: `Load details sent to ${driver} via ${channel} (stub).`,
    };
  },

  email_broker: (action, payload) => {
    const broker = str(payload.brokerName, "broker");
    const subject = action.params?.subject || "Transpo.ai update";
    return {
      ok: true,
      message: `Email logged to ${broker}: “${subject}” (stub).`,
    };
  },

  notify_safety: (action, payload) => {
    const message =
      action.params?.message ||
      `Safety alert: ${str(payload.truckUnit || payload.driverName, "event")}.`;
    pushInAppNotification({
      category: "safety",
      type: "workflow.notify_safety",
      title: "Safety notified",
      body: message,
      priority: "critical",
    });
    return { ok: true, message: `Notified safety: ${message}` };
  },

  notify_driver: (action, payload) => {
    const driver = str(payload.driverName, "driver");
    const message =
      action.params?.message || "You have a new message from Transpo.ai.";
    pushInAppNotification({
      category: "driver",
      type: "workflow.notify_driver",
      title: `Driver notified: ${driver}`,
      body: message,
      priority: "high",
    });
    return { ok: true, message: `Notified ${driver}: ${message}` };
  },

  create_notification: (action) => {
    const title = action.params?.title || "Workflow notification";
    const body = action.params?.body || "A workflow created this notification.";
    pushInAppNotification({
      category: "system",
      type: "workflow.create_notification",
      title,
      body,
      priority: "medium",
    });
    return { ok: true, message: `Notification created: ${title}` };
  },

  send_sms: (action, payload) => {
    const to = action.params?.to || str(payload.driverName, "recipient");
    const message = action.params?.message || "Transpo.ai SMS stub";
    return { ok: true, message: `SMS stub to ${to}: “${message}”` };
  },

  request_document: (action, payload) => {
    const docType = action.params?.documentType || "document";
    const loadRef = str(payload.loadReference, "load");
    return {
      ok: true,
      message: `Document request stub: ${docType} for ${loadRef}.`,
    };
  },

  assign_task: (action) => {
    const assignee = action.params?.assignee || "Team";
    const title = action.params?.title || "Workflow task";
    return {
      ok: true,
      message: `Task assigned to ${assignee}: “${title}” (stub).`,
    };
  },

  webhook: (action) => {
    const url = action.params?.url;
    if (!url) {
      return { ok: false, message: "Webhook URL is required." };
    }
    return { ok: true, message: `Webhook stub POST to ${url}.` };
  },
};

export function runActionAdapter(
  action: WorkflowAction,
  payload: WorkflowEventPayload,
): ActionAdapterResult {
  const adapter = adapters[action.type];
  if (!adapter) {
    return {
      ok: false,
      message: `No adapter for ${getActionLabel(action.type)}.`,
    };
  }
  try {
    return adapter(action, payload);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Action failed",
    };
  }
}
