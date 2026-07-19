import { runActionAdapter } from "@/lib/workflows/adapters";
import { getActionLabel, getTriggerLabel } from "@/lib/workflows/catalog";
import type {
  ConditionOperator,
  Workflow,
  WorkflowCondition,
  WorkflowEventPayload,
  WorkflowRun,
  WorkflowRunLogEntry,
  WorkflowTriggerType,
} from "@/lib/workflows/types";

function getFieldValue(
  payload: WorkflowEventPayload,
  field: string,
): unknown {
  return payload[field];
}

function asComparableString(value: unknown): string {
  if (value == null) return "";
  return String(value);
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function evaluateCondition(
  payload: WorkflowEventPayload,
  condition: WorkflowCondition,
): boolean {
  const raw = getFieldValue(payload, condition.field);
  const operator: ConditionOperator = condition.operator;
  const expected = condition.value;

  switch (operator) {
    case "is_empty":
      return raw == null || asComparableString(raw).trim() === "";
    case "is_not_empty":
      return raw != null && asComparableString(raw).trim() !== "";
    case "equals":
      return asComparableString(raw).toLowerCase() === expected.toLowerCase();
    case "not_equals":
      return asComparableString(raw).toLowerCase() !== expected.toLowerCase();
    case "contains":
      return asComparableString(raw)
        .toLowerCase()
        .includes(expected.toLowerCase());
    case "greater_than": {
      const left = asNumber(raw);
      const right = asNumber(expected);
      return left != null && right != null && left > right;
    }
    case "less_than": {
      const left = asNumber(raw);
      const right = asNumber(expected);
      return left != null && right != null && left < right;
    }
    default:
      return false;
  }
}

/** All conditions must pass (AND). Empty conditions = always true. */
export function evaluateConditions(
  payload: WorkflowEventPayload,
  conditions: WorkflowCondition[],
): boolean {
  if (conditions.length === 0) return true;
  return conditions.every((condition) => evaluateCondition(payload, condition));
}

export function executeWorkflow(
  workflow: Workflow,
  eventPayload: WorkflowEventPayload,
): WorkflowRun {
  const triggeredAt = new Date().toISOString();
  const triggerType =
    (eventPayload.triggerType as WorkflowTriggerType | undefined) ??
    workflow.trigger.type;

  const conditionPassed = evaluateConditions(
    eventPayload,
    workflow.conditions,
  );

  if (!conditionPassed) {
    return {
      id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      workflowId: workflow.id,
      status: "skipped",
      triggeredAt,
      triggerType,
      eventPayload,
      conditionPassed: false,
      logs: [],
      summary: `Skipped — conditions not met for “${workflow.name}”.`,
    };
  }

  const logs: WorkflowRunLogEntry[] = [];
  let allOk = true;

  for (const action of workflow.actions) {
    const result = runActionAdapter(action, eventPayload);
    logs.push({
      actionId: action.id,
      actionType: action.type,
      message: result.message,
      ok: result.ok,
    });
    if (!result.ok) allOk = false;
  }

  const actionSummary = logs
    .map((log) => `${getActionLabel(log.actionType)}: ${log.message}`)
    .join(" · ");

  return {
    id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    workflowId: workflow.id,
    status: allOk ? "success" : "failed",
    triggeredAt,
    triggerType,
    eventPayload,
    conditionPassed: true,
    logs,
    summary:
      logs.length === 0
        ? `Ran “${workflow.name}” with no actions.`
        : `Ran “${workflow.name}” (${getTriggerLabel(triggerType)}). ${actionSummary}`,
  };
}

export type EmitWorkflowEventResult = {
  matched: number;
  runs: WorkflowRun[];
};

/**
 * Event bus stub: match enabled workflows by trigger type and execute.
 * Ready to swap for a real event bus later.
 */
export function emitWorkflowEvent(
  type: WorkflowTriggerType,
  payload: WorkflowEventPayload,
  workflows: Workflow[],
  onRun?: (workflow: Workflow, run: WorkflowRun) => void,
): EmitWorkflowEventResult {
  const eventPayload: WorkflowEventPayload = { ...payload, triggerType: type };
  const matched = workflows.filter(
    (wf) => wf.enabled && wf.trigger.type === type,
  );
  const runs: WorkflowRun[] = [];

  for (const workflow of matched) {
    const run = executeWorkflow(workflow, eventPayload);
    runs.push(run);
    onRun?.(workflow, run);
  }

  return { matched: matched.length, runs };
}

/** Sample payloads for UI "Simulate event" and test runs. */
export function samplePayloadForTrigger(
  type: WorkflowTriggerType,
): WorkflowEventPayload {
  const samples: Record<WorkflowTriggerType, WorkflowEventPayload> = {
    delivery_completed: {
      loadReference: "LD-24110",
      loadStatus: "delivered",
      brokerName: "FreightLine Logistics",
      amount: 2450,
      miles: 612,
      driverName: "Onkar Singh",
    },
    pod_uploaded: {
      loadReference: "LD-24110",
      documentType: "POD",
      brokerName: "FreightLine Logistics",
    },
    driver_assigned: {
      loadReference: "LD-24112",
      driverName: "Lovepreet Kaur",
      loadStatus: "assigned",
      brokerName: "Capital Freight Partners",
      originCity: "Dallas",
    },
    invoice_overdue: {
      invoiceNumber: "INV-1042",
      amount: 3200,
      daysOverdue: 14,
      brokerName: "FreightLine Logistics",
      invoiceStatus: "overdue",
    },
    truck_breakdown: {
      truckUnit: "102",
      severity: "high",
      location: "I-35 near Austin, TX",
      driverName: "Onkar Singh",
    },
    driver_medical_expiring: {
      driverName: "Onkar Singh",
      daysUntilExpiry: 12,
      medicalStatus: "expiring_soon",
    },
    load_created: {
      loadReference: "LD-24120",
      brokerName: "Capital Freight Partners",
      amount: 1890,
      equipmentType: "Dry van",
    },
    document_missing: {
      loadReference: "LD-24105",
      documentType: "Rate confirmation",
      daysMissing: 2,
    },
    payment_received: {
      invoiceNumber: "INV-1038",
      amount: 2100,
      brokerName: "FreightLine Logistics",
    },
    pm_due: {
      truckUnit: "104",
      daysUntilDue: 3,
      pmType: "A-service",
    },
  };

  return { ...samples[type], triggerType: type };
}
