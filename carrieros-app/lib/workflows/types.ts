export type WorkflowTriggerType =
  | "delivery_completed"
  | "pod_uploaded"
  | "driver_assigned"
  | "invoice_overdue"
  | "truck_breakdown"
  | "driver_medical_expiring"
  | "load_created"
  | "document_missing"
  | "payment_received"
  | "pm_due";

export type WorkflowActionType =
  | "create_invoice"
  | "notify_accounting"
  | "send_load_details"
  | "email_broker"
  | "notify_safety"
  | "notify_driver"
  | "create_notification"
  | "send_sms"
  | "request_document"
  | "assign_task"
  | "webhook";

export type ConditionOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "greater_than"
  | "less_than"
  | "is_empty"
  | "is_not_empty";

export type WorkflowCondition = {
  id: string;
  field: string;
  operator: ConditionOperator;
  value: string;
};

export type WorkflowTrigger = {
  type: WorkflowTriggerType;
  params?: Record<string, string>;
};

export type WorkflowAction = {
  id: string;
  type: WorkflowActionType;
  params?: Record<string, string>;
};

export type WorkflowRunStatus = "success" | "skipped" | "failed";

export type WorkflowRunLogEntry = {
  actionId: string;
  actionType: WorkflowActionType;
  message: string;
  ok: boolean;
};

export type WorkflowRun = {
  id: string;
  workflowId: string;
  status: WorkflowRunStatus;
  triggeredAt: string;
  triggerType: WorkflowTriggerType;
  eventPayload: Record<string, unknown>;
  conditionPassed: boolean;
  logs: WorkflowRunLogEntry[];
  summary: string;
};

export type Workflow = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  runCount: number;
  lastRunAt?: string;
};

export type WorkflowEventPayload = Record<string, unknown> & {
  triggerType?: WorkflowTriggerType;
};

export type WorkflowDraft = {
  name: string;
  description: string;
  enabled: boolean;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
};

export type ConditionFieldDef = {
  key: string;
  label: string;
  valueType: "string" | "number" | "enum";
  enumOptions?: { value: string; label: string }[];
};

export type TriggerCatalogEntry = {
  type: WorkflowTriggerType;
  label: string;
  description: string;
  fields: ConditionFieldDef[];
};

export type ActionCatalogEntry = {
  type: WorkflowActionType;
  label: string;
  description: string;
  params: {
    key: string;
    label: string;
    placeholder?: string;
    required?: boolean;
  }[];
};

export type ActionAdapterResult = {
  ok: boolean;
  message: string;
};
