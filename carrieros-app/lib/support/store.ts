"use client";

import { DEMO_TENANT_ID } from "@/lib/data/tenant";
import { prependNotification } from "@/lib/data/notification-store";
import { runSafeAutoHeal } from "@/lib/support/auto-heal";
import { buildSupportHealth, detectSeedIssues } from "@/lib/support/detection";
import { buildSetupProgress } from "@/lib/support/setup";
import type {
  AutoHealActionId,
  IssueStatus,
  ProductImprovement,
  SetupStepId,
  SupportIssue,
  SupportStoreSnapshot,
  SupportTimelineEvent,
} from "@/lib/support/types";

const STORAGE_KEY = "carrieros.support.v1";

function nowIso() {
  return new Date().toISOString();
}

function ticketNumber(seq: number) {
  return `COS-${10000 + seq}`;
}

function createDefaultStore(): SupportStoreSnapshot {
  return {
    setup: buildSetupProgress(),
    issues: detectSeedIssues(DEMO_TENANT_ID),
    health: buildSupportHealth(),
    productImprovements: [
      {
        id: "pi-eld-token",
        title: "Improve ELD token refresh logic",
        issueIds: ["issue-eld-token"],
        companiesAffected: 14,
        recommendedFix:
          "Proactively refresh ELD tokens 24 hours before expiry and alert on refresh failure.",
        createdAt: "2026-07-17T11:00:00Z",
        status: "open",
      },
    ],
    auditLog: [
      {
        id: "sa-1",
        at: "2026-07-17T06:22:00Z",
        action: "auto_heal",
        detail: "Cleared KPI cache and recalculated dashboard",
        safe: true,
      },
    ],
  };
}

let memory: SupportStoreSnapshot | null = null;
/** Deterministic SSR/hydration snapshot — never reads localStorage. */
let serverSnapshot: SupportStoreSnapshot | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function load(): SupportStoreSnapshot {
  if (memory) return memory;
  if (typeof window === "undefined") {
    memory = createDefaultStore();
    return memory;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      memory = JSON.parse(raw) as SupportStoreSnapshot;
      return memory;
    }
  } catch {
    /* ignore */
  }
  memory = createDefaultStore();
  persist();
  return memory;
}

function persist() {
  if (typeof window === "undefined" || !memory) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  emit();
}

export function subscribeSupportStore(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSupportStore(): SupportStoreSnapshot {
  return load();
}

/**
 * Snapshot for SSR and the first client hydration render.
 * Must stay identical across server/client and must not touch localStorage.
 * Live client state (including persisted demo status changes) is applied
 * via getSupportStore after hydration.
 */
export function getSupportStoreServerSnapshot(): SupportStoreSnapshot {
  if (!serverSnapshot) {
    serverSnapshot = createDefaultStore();
  }
  return serverSnapshot;
}

export function getOpenCarrierIssues(): SupportIssue[] {
  return getSupportStore().issues.filter(
    (i) =>
      i.carrierVisible &&
      !["resolved", "closed"].includes(i.status),
  );
}

function notifyCarrier(issue: SupportIssue, title: string, body: string) {
  prependNotification({
    tenantId: DEMO_TENANT_ID,
    id: `notif-support-${issue.id}-${Date.now()}`,
    category: "system",
    type: "support_issue",
    title,
    body,
    priority:
      issue.severity === "critical"
        ? "critical"
        : issue.severity === "high"
          ? "high"
          : "medium",
    alphTier:
      issue.severity === "critical" || issue.severity === "high"
        ? "immediate_action"
        : "should_review_today",
    createdAt: nowIso(),
    entityRefs: [{ type: "user", id: DEMO_TENANT_ID, label: "Your company" }],
    actions: [
      {
        id: "view",
        label: "View Details",
        kind: "navigate",
        href: `/support?issue=${issue.id}`,
        primary: true,
      },
      { id: "dismiss", label: "Dismiss", kind: "dismiss" },
    ],
    channels: ["in_app", "push", "desktop"],
  });
}

function pushTimeline(
  issue: SupportIssue,
  event: Omit<SupportTimelineEvent, "id">,
) {
  issue.timeline = [
    { id: `tl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, ...event },
    ...issue.timeline,
  ];
}

export function markSetupStep(
  stepId: SetupStepId,
  status: SupportStoreSnapshot["setup"]["steps"][number]["status"],
  skipped = false,
) {
  const store = load();
  store.setup.steps = store.setup.steps.map((step) =>
    step.id === stepId ? { ...step, status, skipped } : step,
  );
  const completed = store.setup.steps.filter((s) => s.status === "completed").length;
  store.setup.completed = completed;
  store.setup.percent = Math.round((completed / store.setup.total) * 100);
  store.setup.requiredMissing = store.setup.steps.filter(
    (s) => s.critical && s.status !== "completed",
  ).length;
  persist();
}

export function attemptAutoResolve(
  issueId: string,
  action: AutoHealActionId,
): SupportIssue | null {
  const store = load();
  const issue = store.issues.find((i) => i.id === issueId);
  if (!issue) return null;

  issue.status = "auto_repairing";
  issue.updatedAt = nowIso();
  pushTimeline(issue, {
    at: nowIso(),
    kind: "auto_repairing",
    message: "Alph is attempting a safe automatic repair.",
    actor: "alph",
    visibleToCarrier: true,
  });

  const attempt = runSafeAutoHeal(action, issue.integration ?? issue.title);
  issue.repairAttempts = [attempt, ...issue.repairAttempts];

  store.auditLog.unshift({
    id: `sa-${Date.now()}`,
    at: attempt.at,
    action: attempt.action,
    detail: attempt.detail,
    safe: attempt.safe,
  });

  if (attempt.result === "success") {
    issue.status = "resolved";
    issue.resolvedAt = nowIso();
    issue.updatedAt = nowIso();
    issue.resolutionSummary = attempt.detail;
    issue.rootCause = issue.alphDiagnosis;
    pushTimeline(issue, {
      at: nowIso(),
      kind: "resolved",
      message: `Resolved by Alph at ${new Date().toLocaleTimeString()}.`,
      actor: "alph",
      visibleToCarrier: true,
    });
    notifyCarrier(
      issue,
      "Resolved",
      `${issue.title} — ${attempt.detail}`,
    );
  } else if (attempt.result === "needs_approval") {
    escalateIssue(issueId, "Risky action blocked — needs human approval.");
  } else {
    escalateIssue(issueId, "Automatic repair did not succeed.");
  }

  persist();
  return issue;
}

export function escalateIssue(issueId: string, reason: string): SupportIssue | null {
  const store = load();
  const issue = store.issues.find((i) => i.id === issueId);
  if (!issue) return null;

  issue.status = "escalated";
  issue.updatedAt = nowIso();
  issue.assignedTeam = queueLabel(issue.queue);
  issue.estimatedUpdate = "Transpo.ai support will update within 4 business hours";
  pushTimeline(issue, {
    at: nowIso(),
    kind: "escalated",
    message: `Escalated to Transpo.ai Support. ${reason}`,
    actor: "alph",
    visibleToCarrier: true,
  });
  notifyCarrier(
    issue,
    "Escalated to Transpo.ai Support",
    `Ticket ${issue.ticketNumber} · ${issue.title}`,
  );
  persist();
  return issue;
}

export function updateIssueStatus(issueId: string, status: IssueStatus) {
  const store = load();
  const issue = store.issues.find((i) => i.id === issueId);
  if (!issue) return;
  issue.status = status;
  issue.updatedAt = nowIso();
  persist();
}

export function markIssueResolved(
  issueId: string,
  payload: {
    resolutionSummary: string;
    rootCause: string;
    changesMade: string;
    testingCompleted: string;
    prevention: string;
    notifyCarrier?: boolean;
  },
): SupportIssue | null {
  const store = load();
  const issue = store.issues.find((i) => i.id === issueId);
  if (!issue) return null;

  issue.status = "resolved";
  issue.resolvedAt = nowIso();
  issue.updatedAt = nowIso();
  issue.resolutionSummary = payload.resolutionSummary;
  issue.rootCause = payload.rootCause;
  issue.changesMade = payload.changesMade;
  issue.testingCompleted = payload.testingCompleted;
  issue.prevention = payload.prevention;
  pushTimeline(issue, {
    at: nowIso(),
    kind: "resolved",
    message: payload.resolutionSummary,
    actor: "support",
    visibleToCarrier: true,
  });

  if (payload.notifyCarrier !== false) {
    notifyCarrier(
      issue,
      "Problem Resolved",
      `The issue affecting your account has been fixed. ${issue.title}`,
    );
  }

  // Recurring detection → product improvement
  const similar = store.issues.filter(
    (i) => i.category === issue.category && i.rootCause === payload.rootCause,
  );
  if (similar.length >= 2) {
    const existing = store.productImprovements.find((p) =>
      p.title.toLowerCase().includes(issue.category),
    );
    if (!existing) {
      const improvement: ProductImprovement = {
        id: `pi-${Date.now()}`,
        title: `Prevent recurring ${issue.category} issues`,
        issueIds: similar.map((s) => s.id),
        companiesAffected: similar.length,
        recommendedFix: payload.prevention,
        createdAt: nowIso(),
        status: "open",
      };
      store.productImprovements.unshift(improvement);
    }
  }

  persist();
  return issue;
}

export function reopenIssue(issueId: string): SupportIssue | null {
  const store = load();
  const issue = store.issues.find((i) => i.id === issueId);
  if (!issue) return null;
  issue.status = "reopened";
  issue.resolvedAt = undefined;
  issue.updatedAt = nowIso();
  pushTimeline(issue, {
    at: nowIso(),
    kind: "reopened",
    message: "Carrier reported the issue is still happening.",
    actor: "carrier",
    visibleToCarrier: true,
  });
  persist();
  return issue;
}

export function confirmResolved(issueId: string) {
  const store = load();
  const issue = store.issues.find((i) => i.id === issueId);
  if (!issue) return;
  issue.status = "closed";
  issue.updatedAt = nowIso();
  pushTimeline(issue, {
    at: nowIso(),
    kind: "closed",
    message: "Carrier confirmed everything is working.",
    actor: "carrier",
    visibleToCarrier: true,
  });
  persist();
}

export function runFollowUpCheck(issueId: string): "ok" | "regressed" {
  const store = load();
  const issue = store.issues.find((i) => i.id === issueId);
  if (!issue) return "ok";
  const result = Math.random() > 0.85 ? "regressed" : "ok";
  issue.followUpChecks = [
    ...(issue.followUpChecks ?? []),
    { at: nowIso(), result },
  ];
  if (result === "regressed") {
    issue.status = "reopened";
    pushTimeline(issue, {
      at: nowIso(),
      kind: "reopened",
      message: "Alph follow-up detected the problem returned.",
      actor: "alph",
      visibleToCarrier: true,
    });
    notifyCarrier(issue, "Issue returned", `${issue.title} was automatically reopened.`);
  }
  persist();
  return result;
}

export function createSupportIssue(
  partial: Pick<
    SupportIssue,
    "title" | "summary" | "humanMessage" | "category" | "severity" | "queue" | "alphDiagnosis"
  > &
    Partial<SupportIssue>,
): SupportIssue {
  const store = load();
  const issue: SupportIssue = {
    id: `issue-${Date.now()}`,
    ticketNumber: ticketNumber(store.issues.length + 1),
    tenantId: DEMO_TENANT_ID,
    status: "detected",
    detectedAt: nowIso(),
    updatedAt: nowIso(),
    repairAttempts: [],
    autoResolvable: partial.autoResolvable ?? false,
    risky: partial.risky ?? false,
    carrierVisible: true,
    timeline: [
      {
        id: `tl-${Date.now()}`,
        at: nowIso(),
        kind: "detected",
        message: partial.humanMessage,
        actor: "alph",
        visibleToCarrier: true,
      },
    ],
    ...partial,
    title: partial.title,
    summary: partial.summary,
    humanMessage: partial.humanMessage,
    category: partial.category,
    severity: partial.severity,
    queue: partial.queue,
    alphDiagnosis: partial.alphDiagnosis,
  };
  store.issues.unshift(issue);
  notifyCarrier(issue, "Issue Found", issue.humanMessage);
  persist();
  return issue;
}

function queueLabel(queue: SupportIssue["queue"]): string {
  const map: Record<SupportIssue["queue"], string> = {
    technical: "Technical",
    billing: "Billing",
    integrations: "Integrations",
    compliance: "Compliance",
    accounting: "Accounting",
    data: "Data",
    security: "Security",
    product: "Product",
    user_training: "User Training",
  };
  return map[queue];
}

export function resetSupportStore() {
  memory = createDefaultStore();
  persist();
}
