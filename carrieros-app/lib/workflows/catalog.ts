import type {
  ActionCatalogEntry,
  ConditionOperator,
  TriggerCatalogEntry,
  WorkflowActionType,
  WorkflowTriggerType,
} from "@/lib/workflows/types";

export const CONDITION_OPERATOR_LABELS: Record<ConditionOperator, string> = {
  equals: "equals",
  not_equals: "does not equal",
  contains: "contains",
  greater_than: "is greater than",
  less_than: "is less than",
  is_empty: "is empty",
  is_not_empty: "is not empty",
};

export const CONDITION_OPERATORS: ConditionOperator[] = [
  "equals",
  "not_equals",
  "contains",
  "greater_than",
  "less_than",
  "is_empty",
  "is_not_empty",
];

const LOAD_STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "assigned", label: "Assigned" },
  { value: "in_transit", label: "In transit" },
  { value: "delivered", label: "Delivered" },
  { value: "invoiced", label: "Invoiced" },
];

export const TRIGGER_CATALOG: TriggerCatalogEntry[] = [
  {
    type: "delivery_completed",
    label: "Delivery completed",
    description: "Fires when a load is marked delivered.",
    fields: [
      { key: "loadStatus", label: "Load status", valueType: "enum", enumOptions: LOAD_STATUS_OPTIONS },
      { key: "brokerName", label: "Broker", valueType: "string" },
      { key: "amount", label: "Rate amount", valueType: "number" },
      { key: "miles", label: "Miles", valueType: "number" },
    ],
  },
  {
    type: "pod_uploaded",
    label: "POD uploaded",
    description: "Fires when a proof of delivery document is uploaded.",
    fields: [
      { key: "documentType", label: "Document type", valueType: "string" },
      { key: "loadReference", label: "Load reference", valueType: "string" },
      { key: "brokerName", label: "Broker", valueType: "string" },
    ],
  },
  {
    type: "driver_assigned",
    label: "Driver assigned",
    description: "Fires when a driver is assigned to a load.",
    fields: [
      { key: "driverName", label: "Driver name", valueType: "string" },
      { key: "loadStatus", label: "Load status", valueType: "enum", enumOptions: LOAD_STATUS_OPTIONS },
      { key: "brokerName", label: "Broker", valueType: "string" },
      { key: "originCity", label: "Origin city", valueType: "string" },
    ],
  },
  {
    type: "invoice_overdue",
    label: "Invoice overdue",
    description: "Fires when an invoice past due date is still unpaid.",
    fields: [
      { key: "amount", label: "Invoice amount", valueType: "number" },
      { key: "daysOverdue", label: "Days overdue", valueType: "number" },
      { key: "brokerName", label: "Broker", valueType: "string" },
      { key: "invoiceStatus", label: "Invoice status", valueType: "string" },
    ],
  },
  {
    type: "truck_breakdown",
    label: "Truck breakdown",
    description: "Fires when a truck reports a breakdown or roadside event.",
    fields: [
      { key: "truckUnit", label: "Truck unit", valueType: "string" },
      { key: "severity", label: "Severity", valueType: "enum", enumOptions: [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
        { value: "critical", label: "Critical" },
      ] },
      { key: "location", label: "Location", valueType: "string" },
    ],
  },
  {
    type: "driver_medical_expiring",
    label: "Driver medical expiring",
    description: "Fires when a driver’s medical card is nearing expiry.",
    fields: [
      { key: "driverName", label: "Driver name", valueType: "string" },
      { key: "daysUntilExpiry", label: "Days until expiry", valueType: "number" },
      { key: "medicalStatus", label: "Medical status", valueType: "string" },
    ],
  },
  {
    type: "load_created",
    label: "Load created",
    description: "Fires when a new load is created.",
    fields: [
      { key: "brokerName", label: "Broker", valueType: "string" },
      { key: "amount", label: "Rate amount", valueType: "number" },
      { key: "equipmentType", label: "Equipment type", valueType: "string" },
    ],
  },
  {
    type: "document_missing",
    label: "Document missing",
    description: "Fires when a required document is flagged missing.",
    fields: [
      { key: "documentType", label: "Document type", valueType: "string" },
      { key: "loadReference", label: "Load reference", valueType: "string" },
      { key: "daysMissing", label: "Days missing", valueType: "number" },
    ],
  },
  {
    type: "payment_received",
    label: "Payment received",
    description: "Fires when a payment is recorded against an invoice.",
    fields: [
      { key: "amount", label: "Payment amount", valueType: "number" },
      { key: "brokerName", label: "Broker", valueType: "string" },
      { key: "invoiceNumber", label: "Invoice number", valueType: "string" },
    ],
  },
  {
    type: "pm_due",
    label: "PM due",
    description: "Fires when preventive maintenance is due on a truck.",
    fields: [
      { key: "truckUnit", label: "Truck unit", valueType: "string" },
      { key: "daysUntilDue", label: "Days until due", valueType: "number" },
      { key: "pmType", label: "PM type", valueType: "string" },
    ],
  },
];

export const ACTION_CATALOG: ActionCatalogEntry[] = [
  {
    type: "create_invoice",
    label: "Create invoice",
    description: "Draft an invoice for the related load.",
    params: [
      { key: "note", label: "Note", placeholder: "Auto-created from workflow" },
    ],
  },
  {
    type: "notify_accounting",
    label: "Notify accounting",
    description: "Send an in-app alert to the accounting team.",
    params: [
      { key: "message", label: "Message", placeholder: "POD ready for billing" },
    ],
  },
  {
    type: "send_load_details",
    label: "Send load details",
    description: "Share load details with the assigned driver.",
    params: [
      { key: "channel", label: "Channel", placeholder: "sms or app" },
    ],
  },
  {
    type: "email_broker",
    label: "Email broker",
    description: "Send an email to the load’s broker.",
    params: [
      { key: "subject", label: "Subject", placeholder: "Overdue invoice reminder" },
      { key: "body", label: "Body", placeholder: "Please review payment status…" },
    ],
  },
  {
    type: "notify_safety",
    label: "Notify safety",
    description: "Alert the safety team in Notification Center.",
    params: [
      { key: "message", label: "Message", placeholder: "Safety attention needed" },
    ],
  },
  {
    type: "notify_driver",
    label: "Notify driver",
    description: "Send a notification to the driver.",
    params: [
      { key: "message", label: "Message", placeholder: "Your medical card is expiring" },
    ],
  },
  {
    type: "create_notification",
    label: "Create notification",
    description: "Push a general notification to Notification Center.",
    params: [
      { key: "title", label: "Title", placeholder: "Workflow alert", required: true },
      { key: "body", label: "Body", placeholder: "Something needs attention" },
    ],
  },
  {
    type: "send_sms",
    label: "Send SMS",
    description: "Send an SMS message (stub).",
    params: [
      { key: "to", label: "To", placeholder: "Driver or contact" },
      { key: "message", label: "Message", placeholder: "SMS body" },
    ],
  },
  {
    type: "request_document",
    label: "Request document",
    description: "Request a missing document from the driver or broker.",
    params: [
      { key: "documentType", label: "Document type", placeholder: "POD", required: true },
    ],
  },
  {
    type: "assign_task",
    label: "Assign task",
    description: "Create a follow-up task for a team member.",
    params: [
      { key: "assignee", label: "Assignee", placeholder: "Accounting" },
      { key: "title", label: "Task title", placeholder: "Follow up on invoice" },
    ],
  },
  {
    type: "webhook",
    label: "Webhook",
    description: "POST to an external URL (stub).",
    params: [
      { key: "url", label: "URL", placeholder: "https://example.com/hook", required: true },
    ],
  },
];

const triggerByType = Object.fromEntries(
  TRIGGER_CATALOG.map((entry) => [entry.type, entry]),
) as Record<WorkflowTriggerType, TriggerCatalogEntry>;

const actionByType = Object.fromEntries(
  ACTION_CATALOG.map((entry) => [entry.type, entry]),
) as Record<WorkflowActionType, ActionCatalogEntry>;

export function getTriggerLabel(type: WorkflowTriggerType): string {
  return triggerByType[type]?.label ?? type;
}

export function getTriggerDescription(type: WorkflowTriggerType): string {
  return triggerByType[type]?.description ?? "";
}

export function getTriggerFields(type: WorkflowTriggerType) {
  return triggerByType[type]?.fields ?? [];
}

export function getActionLabel(type: WorkflowActionType): string {
  return actionByType[type]?.label ?? type;
}

export function getActionDescription(type: WorkflowActionType): string {
  return actionByType[type]?.description ?? "";
}

export function getActionParams(type: WorkflowActionType) {
  return actionByType[type]?.params ?? [];
}

export function getFieldLabel(
  triggerType: WorkflowTriggerType,
  fieldKey: string,
): string {
  const field = getTriggerFields(triggerType).find((f) => f.key === fieldKey);
  return field?.label ?? fieldKey;
}
