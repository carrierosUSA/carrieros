import {
  executeWorkflow,
  emitWorkflowEvent,
  samplePayloadForTrigger,
} from "@/lib/workflows/engine";
import type {
  Workflow,
  WorkflowDraft,
  WorkflowEventPayload,
  WorkflowRun,
  WorkflowTriggerType,
} from "@/lib/workflows/types";

const STORAGE_KEY = "carrieros.workflows.v1";
const RUNS_STORAGE_KEY = "carrieros.workflow-runs.v1";

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function seedWorkflows(): Workflow[] {
  const createdAt = "2026-07-10T14:00:00.000Z";
  return [
    {
      id: "wf-delivery-invoice",
      name: "Delivery → Invoice",
      description: "When a delivery completes, draft an invoice for billing.",
      enabled: true,
      createdAt,
      updatedAt: createdAt,
      trigger: { type: "delivery_completed" },
      conditions: [],
      actions: [
        {
          id: "act-1",
          type: "create_invoice",
          params: { note: "Auto-invoice on delivery" },
        },
      ],
      runCount: 12,
      lastRunAt: "2026-07-16T18:22:00.000Z",
    },
    {
      id: "wf-pod-accounting",
      name: "POD → Notify accounting",
      description: "Alert accounting as soon as proof of delivery is uploaded.",
      enabled: true,
      createdAt,
      updatedAt: createdAt,
      trigger: { type: "pod_uploaded" },
      conditions: [
        {
          id: "cond-1",
          field: "documentType",
          operator: "equals",
          value: "POD",
        },
      ],
      actions: [
        {
          id: "act-1",
          type: "notify_accounting",
          params: { message: "POD uploaded — ready to invoice." },
        },
      ],
      runCount: 8,
      lastRunAt: "2026-07-16T11:05:00.000Z",
    },
    {
      id: "wf-driver-assigned-details",
      name: "Driver assigned → Send load details",
      description: "Share pickup, delivery, and rate details with the driver.",
      enabled: true,
      createdAt,
      updatedAt: createdAt,
      trigger: { type: "driver_assigned" },
      conditions: [],
      actions: [
        {
          id: "act-1",
          type: "send_load_details",
          params: { channel: "app" },
        },
      ],
      runCount: 21,
      lastRunAt: "2026-07-17T09:14:00.000Z",
    },
    {
      id: "wf-invoice-overdue-broker",
      name: "Invoice overdue → Email broker",
      description: "Follow up with the broker when an invoice is past due.",
      enabled: true,
      createdAt,
      updatedAt: createdAt,
      trigger: { type: "invoice_overdue" },
      conditions: [
        {
          id: "cond-1",
          field: "daysOverdue",
          operator: "greater_than",
          value: "7",
        },
      ],
      actions: [
        {
          id: "act-1",
          type: "email_broker",
          params: {
            subject: "Overdue invoice reminder",
            body: "Please review payment status for this invoice.",
          },
        },
      ],
      runCount: 3,
      lastRunAt: "2026-07-15T16:40:00.000Z",
    },
    {
      id: "wf-breakdown-safety",
      name: "Truck breakdown → Notify safety",
      description: "Escalate roadside breakdowns to the safety team.",
      enabled: true,
      createdAt,
      updatedAt: createdAt,
      trigger: { type: "truck_breakdown" },
      conditions: [
        {
          id: "cond-1",
          field: "severity",
          operator: "not_equals",
          value: "low",
        },
      ],
      actions: [
        {
          id: "act-1",
          type: "notify_safety",
          params: { message: "Truck breakdown reported — review immediately." },
        },
      ],
      runCount: 2,
      lastRunAt: "2026-07-14T07:55:00.000Z",
    },
    {
      id: "wf-medical-expiring",
      name: "Medical expiring → Notify driver + safety",
      description:
        "Remind the driver and safety when a medical card is about to expire.",
      enabled: true,
      createdAt,
      updatedAt: createdAt,
      trigger: { type: "driver_medical_expiring" },
      conditions: [
        {
          id: "cond-1",
          field: "daysUntilExpiry",
          operator: "less_than",
          value: "30",
        },
      ],
      actions: [
        {
          id: "act-1",
          type: "notify_driver",
          params: {
            message: "Your medical card is expiring soon. Please renew.",
          },
        },
        {
          id: "act-2",
          type: "notify_safety",
          params: {
            message: "Driver medical card expiring — follow up on renewal.",
          },
        },
      ],
      runCount: 5,
      lastRunAt: "2026-07-13T12:00:00.000Z",
    },
  ];
}

function seedRuns(workflows: Workflow[]): WorkflowRun[] {
  return workflows
    .filter((wf) => wf.lastRunAt)
    .slice(0, 4)
    .map((wf, index) => ({
      id: `run-seed-${index + 1}`,
      workflowId: wf.id,
      status: "success" as const,
      triggeredAt: wf.lastRunAt!,
      triggerType: wf.trigger.type,
      eventPayload: samplePayloadForTrigger(wf.trigger.type),
      conditionPassed: true,
      logs: wf.actions.map((action) => ({
        actionId: action.id,
        actionType: action.type,
        message: `Seeded run for ${action.type}`,
        ok: true,
      })),
      summary: `Seeded run for “${wf.name}”.`,
    }));
}

let workflows: Workflow[] = seedWorkflows();
let runs: WorkflowRun[] = seedRuns(workflows);
let hydrated = false;

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function persist() {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
    localStorage.setItem(RUNS_STORAGE_KEY, JSON.stringify(runs.slice(0, 200)));
  } catch {
    // ignore quota errors
  }
}

export function hydrateWorkflowStore() {
  if (hydrated || !canUseStorage()) return;
  hydrated = true;
  try {
    const rawWorkflows = localStorage.getItem(STORAGE_KEY);
    const rawRuns = localStorage.getItem(RUNS_STORAGE_KEY);
    if (rawWorkflows) {
      const parsed = JSON.parse(rawWorkflows) as Workflow[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        workflows = parsed;
      }
    }
    if (rawRuns) {
      const parsedRuns = JSON.parse(rawRuns) as WorkflowRun[];
      if (Array.isArray(parsedRuns)) {
        runs = parsedRuns;
      }
    }
  } catch {
    // keep seeds
  }
  emit();
}

export function subscribeWorkflows(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getWorkflowsSnapshot(): Workflow[] {
  return workflows;
}

export function getRunsSnapshot(): WorkflowRun[] {
  return runs;
}

export function listWorkflows(): Workflow[] {
  return workflows
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getWorkflowById(id: string): Workflow | undefined {
  return workflows.find((wf) => wf.id === id);
}

export function listRunsForWorkflow(workflowId: string): WorkflowRun[] {
  return runs
    .filter((run) => run.workflowId === workflowId)
    .sort((a, b) => b.triggeredAt.localeCompare(a.triggeredAt));
}

export function listAllRuns(limit = 50): WorkflowRun[] {
  return runs
    .slice()
    .sort((a, b) => b.triggeredAt.localeCompare(a.triggeredAt))
    .slice(0, limit);
}

export function createWorkflow(draft: WorkflowDraft): Workflow {
  const stamp = nowIso();
  const workflow: Workflow = {
    id: id("wf"),
    name: draft.name.trim() || "Untitled workflow",
    description: draft.description.trim(),
    enabled: draft.enabled,
    createdAt: stamp,
    updatedAt: stamp,
    trigger: { ...draft.trigger, params: { ...draft.trigger.params } },
    conditions: draft.conditions.map((c) => ({ ...c })),
    actions: draft.actions.map((a) => ({
      ...a,
      params: a.params ? { ...a.params } : undefined,
    })),
    runCount: 0,
  };
  workflows = [workflow, ...workflows];
  persist();
  emit();
  return workflow;
}

export function updateWorkflow(
  workflowId: string,
  draft: Partial<WorkflowDraft>,
): Workflow | undefined {
  const existing = workflows.find((wf) => wf.id === workflowId);
  if (!existing) return undefined;

  const next: Workflow = {
    ...existing,
    name: draft.name?.trim() || existing.name,
    description:
      draft.description !== undefined
        ? draft.description.trim()
        : existing.description,
    enabled: draft.enabled ?? existing.enabled,
    trigger: draft.trigger
      ? { ...draft.trigger, params: { ...draft.trigger.params } }
      : existing.trigger,
    conditions: draft.conditions
      ? draft.conditions.map((c) => ({ ...c }))
      : existing.conditions,
    actions: draft.actions
      ? draft.actions.map((a) => ({
          ...a,
          params: a.params ? { ...a.params } : undefined,
        }))
      : existing.actions,
    updatedAt: nowIso(),
  };

  workflows = workflows.map((wf) => (wf.id === workflowId ? next : wf));
  persist();
  emit();
  return next;
}

export function setWorkflowEnabled(
  workflowId: string,
  enabled: boolean,
): Workflow | undefined {
  return updateWorkflow(workflowId, { enabled });
}

export function deleteWorkflow(workflowId: string): boolean {
  const before = workflows.length;
  workflows = workflows.filter((wf) => wf.id !== workflowId);
  runs = runs.filter((run) => run.workflowId !== workflowId);
  if (workflows.length === before) return false;
  persist();
  emit();
  return true;
}

function recordRun(workflow: Workflow, run: WorkflowRun) {
  runs = [run, ...runs].slice(0, 200);
  workflows = workflows.map((wf) =>
    wf.id === workflow.id
      ? {
          ...wf,
          runCount: wf.runCount + 1,
          lastRunAt: run.triggeredAt,
          updatedAt: nowIso(),
        }
      : wf,
  );
  persist();
  emit();
}

export function testRunWorkflow(
  workflowId: string,
  payload?: WorkflowEventPayload,
): WorkflowRun | undefined {
  const workflow = getWorkflowById(workflowId);
  if (!workflow) return undefined;

  const eventPayload =
    payload ?? samplePayloadForTrigger(workflow.trigger.type);
  const run = executeWorkflow(workflow, eventPayload);
  recordRun(workflow, run);
  return run;
}

export function simulateWorkflowEvent(
  type: WorkflowTriggerType,
  payload?: WorkflowEventPayload,
) {
  const eventPayload = payload ?? samplePayloadForTrigger(type);
  return emitWorkflowEvent(type, eventPayload, workflows, (workflow, run) => {
    recordRun(workflow, run);
  });
}

export function filterWorkflowsByQuery(
  items: Workflow[],
  query: string,
): Workflow[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((wf) => {
    const haystack = [
      wf.name,
      wf.description,
      wf.trigger.type,
      ...wf.actions.map((a) => a.type),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function buildWorkflowStats(items: Workflow[]) {
  return {
    total: items.length,
    enabled: items.filter((wf) => wf.enabled).length,
    disabled: items.filter((wf) => !wf.enabled).length,
    totalRuns: items.reduce((sum, wf) => sum + wf.runCount, 0),
  };
}

export function emptyWorkflowDraft(): WorkflowDraft {
  return {
    name: "",
    description: "",
    enabled: true,
    trigger: { type: "delivery_completed" },
    conditions: [],
    actions: [],
  };
}

export function draftFromWorkflow(workflow: Workflow): WorkflowDraft {
  return {
    name: workflow.name,
    description: workflow.description,
    enabled: workflow.enabled,
    trigger: { ...workflow.trigger, params: { ...workflow.trigger.params } },
    conditions: workflow.conditions.map((c) => ({ ...c })),
    actions: workflow.actions.map((a) => ({
      ...a,
      params: a.params ? { ...a.params } : undefined,
    })),
  };
}

export function isWorkflowDraftComplete(draft: WorkflowDraft): {
  complete: boolean;
  reason?: string;
} {
  if (!draft.name.trim()) {
    return { complete: false, reason: "Add a workflow name" };
  }
  if (!draft.trigger?.type) {
    return { complete: false, reason: "Choose a trigger" };
  }
  if (draft.actions.length === 0) {
    return { complete: false, reason: "Add at least one action" };
  }
  for (const action of draft.actions) {
    if (action.type === "webhook" && !action.params?.url?.trim()) {
      return { complete: false, reason: "Webhook actions need a URL" };
    }
    if (
      action.type === "create_notification" &&
      !action.params?.title?.trim()
    ) {
      return { complete: false, reason: "Notification actions need a title" };
    }
    if (
      action.type === "request_document" &&
      !action.params?.documentType?.trim()
    ) {
      return {
        complete: false,
        reason: "Document request needs a document type",
      };
    }
  }
  for (const condition of draft.conditions) {
    if (!condition.field) {
      return { complete: false, reason: "Every condition needs a field" };
    }
    if (
      condition.operator !== "is_empty" &&
      condition.operator !== "is_not_empty" &&
      !condition.value.trim()
    ) {
      return { complete: false, reason: "Fill in each condition value" };
    }
  }
  return { complete: true };
}
