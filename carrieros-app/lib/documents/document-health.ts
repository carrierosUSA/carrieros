import { loadDocumentStore, invoiceDraftStore } from "@/lib/data/document-store";
import {
  exceptionIssueKeys,
  fuelExpectedLoadIds,
  getInventoryForLoad,
  getTimelineForLoad,
  ignoredIssueKeys,
  issueKey,
  lumperExpectedLoadIds,
} from "@/lib/documents/document-health-store";
import {
  getRequiredDocumentsConfig,
  HEALTH_DOCUMENT_LABELS,
  isDocumentRequired,
  isRuleVisible,
  type RequiredDocumentRule,
} from "@/lib/documents/required-documents";
import type {
  DocumentHealthChecklistItem,
  DocumentHealthScore,
  DocumentHealthSnapshot,
  DocumentHealthSort,
  DocumentIssue,
  DocumentIssueKind,
  DocumentIssueSeverity,
  DocumentQuickAction,
  DocumentWaitingOn,
  HealthDocumentInventoryItem,
  HealthDocumentKind,
} from "@/lib/documents/types";
import type { Load, LoadDocumentRecord, LoadDocumentType } from "@/lib/types";

const PACKET_TO_HEALTH: Partial<Record<LoadDocumentType, HealthDocumentKind>> = {
  rate_confirmation: "rate_confirmation",
  bol: "bol",
  final_pod: "pod",
  lumper_receipt: "lumper_receipt",
  invoice: "invoice",
};

function hashIndex(seed: string, size: number): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash + seed.charCodeAt(index) * (index + 1)) % size;
  }
  return hash;
}

function mapPacketDocs(loadId: string): HealthDocumentInventoryItem[] {
  return loadDocumentStore
    .filter((doc) => doc.loadId === loadId)
    .map((doc) => packetToInventory(doc))
    .filter((item): item is HealthDocumentInventoryItem => Boolean(item));
}

function packetToInventory(
  doc: LoadDocumentRecord,
): HealthDocumentInventoryItem | null {
  const kind = PACKET_TO_HEALTH[doc.type];
  if (!kind) {
    return null;
  }

  if (doc.status === "missing") {
    return null;
  }

  return {
    id: doc.id,
    loadId: doc.loadId,
    kind,
    label: doc.label,
    fileName: doc.fileName,
    capturedAt: doc.capturedAt,
    status:
      doc.status === "approved"
        ? "approved"
        : doc.status === "scanned"
          ? "scanned"
          : "captured",
  };
}

function collectInventory(loadId: string): HealthDocumentInventoryItem[] {
  const fromPacket = mapPacketDocs(loadId);
  const fromHealth = getInventoryForLoad(loadId);
  const seen = new Set(fromPacket.map((item) => item.id));
  const merged = [...fromPacket];

  for (const item of fromHealth) {
    if (!seen.has(item.id)) {
      merged.push(item);
    }
  }

  // Invoice draft counts as invoice present
  const hasInvoiceDraft = invoiceDraftStore.some(
    (draft) => draft.loadId === loadId,
  );
  if (hasInvoiceDraft && !merged.some((item) => item.kind === "invoice")) {
    merged.push({
      id: `invoice-draft-${loadId}`,
      loadId,
      kind: "invoice",
      label: "Invoice",
      status: "approved",
      capturedAt: invoiceDraftStore.find((d) => d.loadId === loadId)?.generatedAt,
    });
  }

  return merged;
}

function docsOfKind(
  inventory: HealthDocumentInventoryItem[],
  kind: HealthDocumentKind,
): HealthDocumentInventoryItem[] {
  return inventory.filter((item) => item.kind === kind);
}

function usableDocs(
  inventory: HealthDocumentInventoryItem[],
  kind: HealthDocumentKind,
): HealthDocumentInventoryItem[] {
  return docsOfKind(inventory, kind).filter((item) => {
    const flags = item.flags;
    if (!flags) {
      return true;
    }
    // Wrong-type / empty / wrong-load don't count as present
    if (flags.wrongType || flags.emptyPage || flags.wrongLoadId) {
      return false;
    }
    return true;
  });
}

function ownerToWaiting(
  owner: RequiredDocumentRule["defaultOwner"],
): DocumentIssue["waitingOn"] {
  switch (owner) {
    case "broker":
      return "broker";
    case "driver":
      return "driver";
    case "accounting":
      return "accounting";
    default:
      return "none";
  }
}

function primaryActionFor(
  owner: RequiredDocumentRule["defaultOwner"],
): DocumentQuickAction {
  switch (owner) {
    case "broker":
      return "requestFromBroker";
    case "driver":
      return "requestFromDriver";
    case "accounting":
      return "uploadNow";
    default:
      return "uploadNow";
  }
}

function missingMessage(
  kind: HealthDocumentKind,
  label: string,
  severity: DocumentIssueSeverity,
): string {
  switch (kind) {
    case "pod":
      return severity === "critical"
        ? "POD Missing — cannot be invoiced"
        : "POD Missing";
    case "invoice":
      return "Invoice Missing — Create invoice now";
    case "rate_confirmation":
      return "Rate Confirmation Missing — Upload before dispatch";
    case "fuel_receipt":
      return "Fuel Receipt Missing — expense cannot be verified";
    case "lumper_receipt":
      return "Lumper Receipt Missing — reimbursement risk";
    case "bol":
      return "BOL Missing — needed for pickup proof";
    case "temperature_logs":
      return "Temperature Logs Missing — reefer compliance risk";
    case "receiver_signature":
      return "Receiver Signature Missing — POD incomplete";
    default:
      return `${label} Missing`;
  }
}

function qualityMessage(
  issueKind: DocumentIssueKind,
  label: string,
): string {
  switch (issueKind) {
    case "duplicate":
      return `Duplicate ${label} upload detected`;
    case "wrong_type":
      return `Wrong document type — file labeled as ${label}`;
    case "blurry":
      return `Blurry ${label} — re-upload needed`;
    case "empty_page":
      return `Empty page detected on ${label}`;
    case "missing_signature":
      return `Missing signature on ${label}`;
    case "missing_pages":
      return `Missing pages on ${label}`;
    case "wrong_load":
      return `${label} assigned to the wrong load`;
    case "expired":
      return `${label} expired`;
    default:
      return `${label} issue detected`;
  }
}

function pushIssue(
  issues: DocumentIssue[],
  issue: DocumentIssue,
): void {
  const key = issueKey(issue.loadId, issue.kind, issue.documentKind);
  if (ignoredIssueKeys.has(key)) {
    issues.push({ ...issue, ignored: true });
    return;
  }
  if (exceptionIssueKeys.has(key)) {
    issues.push({ ...issue, exception: true });
    return;
  }
  issues.push(issue);
}

function detectQualityIssues(
  load: Load,
  inventory: HealthDocumentInventoryItem[],
  issues: DocumentIssue[],
): void {
  for (const item of inventory) {
    const flags = item.flags;
    if (!flags) {
      continue;
    }

    const label = item.label || HEALTH_DOCUMENT_LABELS[item.kind];

    const flagChecks: Array<{
      active: boolean;
      kind: DocumentIssueKind;
      severity: DocumentIssueSeverity;
      action: DocumentQuickAction;
    }> = [
      {
        active: Boolean(flags.duplicateOf),
        kind: "duplicate",
        severity: "warning",
        action: "ignore",
      },
      {
        active: Boolean(flags.wrongType),
        kind: "wrong_type",
        severity: "critical",
        action: "uploadNow",
      },
      {
        active: Boolean(flags.blurry),
        kind: "blurry",
        severity: "warning",
        action: "takePhoto",
      },
      {
        active: Boolean(flags.emptyPage),
        kind: "empty_page",
        severity: "critical",
        action: "uploadNow",
      },
      {
        active: Boolean(flags.missingSignature),
        kind: "missing_signature",
        severity: "critical",
        action: "requestFromDriver",
      },
      {
        active: Boolean(flags.missingPages),
        kind: "missing_pages",
        severity: "warning",
        action: "requestFromBroker",
      },
      {
        active: Boolean(flags.wrongLoadId),
        kind: "wrong_load",
        severity: "critical",
        action: "uploadNow",
      },
      {
        active: Boolean(flags.expired),
        kind: "expired",
        severity: "warning",
        action: "uploadNow",
      },
    ];

    for (const check of flagChecks) {
      if (!check.active) {
        continue;
      }

      pushIssue(issues, {
        id: `${load.id}-${check.kind}-${item.kind}-${item.id}`,
        loadId: load.id,
        kind: check.kind,
        documentKind: item.kind,
        severity: check.severity,
        message: qualityMessage(check.kind, label),
        detail: item.fileName,
        primaryAction: check.action,
        waitingOn:
          check.action === "requestFromDriver"
            ? "driver"
            : check.action === "requestFromBroker"
              ? "broker"
              : "none",
        confidence: 0.72 + hashIndex(`${item.id}-${check.kind}`, 20) / 100,
        documentId: item.id,
      });
    }
  }
}

function detectMissingIssues(
  load: Load,
  inventory: HealthDocumentInventoryItem[],
  issues: DocumentIssue[],
): void {
  const config = getRequiredDocumentsConfig();
  const equipment =
    load.equipmentType ??
    (load.customerId === "customer-gulf-foods" ? "reefer" : undefined);

  for (const rule of config.rules) {
    if (!isRuleVisible(rule, load.status, equipment)) {
      continue;
    }

    const softRequireLumper =
      rule.kind === "lumper_receipt" && lumperExpectedLoadIds.has(load.id);
    const softRequireFuel =
      rule.kind === "fuel_receipt" && fuelExpectedLoadIds.has(load.id);

    const required =
      isDocumentRequired(rule, load.status, equipment) ||
      softRequireLumper ||
      softRequireFuel;

    if (!required) {
      continue;
    }

    const present = usableDocs(inventory, rule.kind).length > 0;
    if (present) {
      continue;
    }

    // If only a broken upload exists (empty/wrong type), missing is implied by quality issue
    const broken = docsOfKind(inventory, rule.kind).some(
      (item) =>
        item.flags?.emptyPage ||
        item.flags?.wrongType ||
        item.flags?.wrongLoadId,
    );
    if (broken) {
      continue;
    }

    const severity: DocumentIssueSeverity =
      rule.criticalWhenMissing || softRequireLumper ? "critical" : "warning";

    // Pre-dispatch rate con is always critical
    const adjustedSeverity =
      rule.kind === "rate_confirmation" &&
      (load.status === "pending" || load.status === "dispatched")
        ? "critical"
        : severity;

    pushIssue(issues, {
      id: `${load.id}-missing-${rule.kind}`,
      loadId: load.id,
      kind: "missing",
      documentKind: rule.kind,
      severity: adjustedSeverity,
      message: missingMessage(rule.kind, rule.label, adjustedSeverity),
      primaryAction: primaryActionFor(rule.defaultOwner),
      waitingOn: ownerToWaiting(rule.defaultOwner),
      confidence: 0.95,
    });
  }
}

function computeScore(issues: DocumentIssue[]): DocumentHealthScore {
  const active = issues.filter((issue) => !issue.ignored && !issue.exception);
  const critical = active.filter((issue) => issue.severity === "critical");
  const warnings = active.filter((issue) => issue.severity === "warning");

  if (active.length === 0) {
    return { level: "complete", percent: 100, label: "Complete" };
  }

  if (critical.length > 0) {
    const percent = Math.max(15, 70 - critical.length * 18 - warnings.length * 5);
    return { level: "critical", percent, label: "Critical" };
  }

  const percent = Math.max(40, 90 - warnings.length * 12);
  return { level: "warning", percent, label: "Warning" };
}

function resolveWaitingOn(
  load: Load,
  issues: DocumentIssue[],
  hasPod: boolean,
  hasInvoice: boolean,
): DocumentWaitingOn {
  const active = issues.filter((issue) => !issue.ignored && !issue.exception);

  if (
    (load.status === "delivered" || load.status === "invoiced") &&
    hasPod &&
    !hasInvoice &&
    active.every((issue) => issue.documentKind === "invoice" || issue.severity === "warning")
  ) {
    const onlyInvoiceOrSoft = active.every(
      (issue) =>
        issue.documentKind === "invoice" ||
        issue.documentKind === "fuel_receipt" ||
        issue.severity === "warning",
    );
    if (hasPod && onlyInvoiceOrSoft && !hasInvoice) {
      return "ready_to_invoice";
    }
  }

  if (hasPod && hasInvoice && active.length === 0) {
    return "none";
  }

  if (active.some((issue) => issue.waitingOn === "broker")) {
    return "broker";
  }
  if (active.some((issue) => issue.waitingOn === "driver")) {
    return "driver";
  }
  if (active.some((issue) => issue.waitingOn === "accounting")) {
    return "accounting";
  }

  if (
    load.status === "delivered" &&
    hasPod &&
    !hasInvoice
  ) {
    return "ready_to_invoice";
  }

  return "none";
}

function buildChecklist(
  load: Load,
  inventory: HealthDocumentInventoryItem[],
  issues: DocumentIssue[],
): DocumentHealthChecklistItem[] {
  const config = getRequiredDocumentsConfig();
  const equipment =
    load.equipmentType ??
    (load.customerId === "customer-gulf-foods" ? "reefer" : undefined);

  return config.rules
    .filter((rule) => isRuleVisible(rule, load.status, equipment))
    .map((rule) => {
      const softRequire =
        (rule.kind === "lumper_receipt" && lumperExpectedLoadIds.has(load.id)) ||
        (rule.kind === "fuel_receipt" && fuelExpectedLoadIds.has(load.id));
      const required =
        isDocumentRequired(rule, load.status, equipment) || softRequire;
      const present = usableDocs(inventory, rule.kind).length > 0;
      const related = issues.filter(
        (issue) =>
          issue.documentKind === rule.kind &&
          !issue.ignored &&
          !issue.exception,
      );
      const exception = issues.some(
        (issue) =>
          issue.documentKind === rule.kind && issue.exception,
      );
      const ignored = issues.some(
        (issue) => issue.documentKind === rule.kind && issue.ignored,
      );

      let status: DocumentHealthChecklistItem["status"] = "missing";
      if (exception) {
        status = "exception";
      } else if (ignored && !present) {
        status = "ignored";
      } else if (present) {
        status = "on_file";
      }

      return {
        kind: rule.kind,
        label: rule.label,
        required,
        present,
        status,
        issueIds: related.map((issue) => issue.id),
      };
    });
}

export function computeDocumentHealth(load: Load): DocumentHealthSnapshot {
  const inventory = collectInventory(load.id);
  const issues: DocumentIssue[] = [];

  detectQualityIssues(load, inventory, issues);
  detectMissingIssues(load, inventory, issues);

  const activeIssues = issues.filter(
    (issue) => !issue.ignored && !issue.exception,
  );
  const score = computeScore(issues);
  const hasPod = usableDocs(inventory, "pod").length > 0;
  const hasInvoice = usableDocs(inventory, "invoice").length > 0;
  const waitingOn = resolveWaitingOn(load, issues, hasPod, hasInvoice);
  const checklist = buildChecklist(load, inventory, issues);
  const missingRequiredCount = checklist.filter(
    (item) => item.required && item.status === "missing",
  ).length;

  return {
    loadId: load.id,
    loadReference: load.reference,
    score,
    issues: activeIssues.sort((a, b) => {
      if (a.severity === b.severity) {
        return 0;
      }
      return a.severity === "critical" ? -1 : 1;
    }),
    checklist,
    waitingOn,
    criticalCount: activeIssues.filter((i) => i.severity === "critical").length,
    warningCount: activeIssues.filter((i) => i.severity === "warning").length,
    missingRequiredCount,
    readyToInvoice:
      waitingOn === "ready_to_invoice" ||
      (hasPod &&
        load.status === "delivered" &&
        activeIssues.every(
          (issue) =>
            issue.documentKind === "invoice" || issue.severity === "warning",
        )),
    timeline: getTimelineForLoad(load.id),
  };
}

export function computeDocumentHealthForLoads(
  loads: Load[],
): DocumentHealthSnapshot[] {
  return loads
    .filter((load) => load.status !== "cancelled")
    .map((load) => computeDocumentHealth(load));
}

export function sortDocumentHealthSnapshots(
  snapshots: DocumentHealthSnapshot[],
  sort: DocumentHealthSort,
): DocumentHealthSnapshot[] {
  const copy = [...snapshots];

  switch (sort) {
    case "most_critical":
      return copy.sort((a, b) => {
        const levelRank = { critical: 0, warning: 1, complete: 2 } as const;
        const levelDiff = levelRank[a.score.level] - levelRank[b.score.level];
        if (levelDiff !== 0) {
          return levelDiff;
        }
        return b.criticalCount - a.criticalCount || a.score.percent - b.score.percent;
      });
    case "ready_to_invoice":
      return copy.sort((a, b) => {
        if (a.readyToInvoice === b.readyToInvoice) {
          return a.loadReference.localeCompare(b.loadReference);
        }
        return a.readyToInvoice ? -1 : 1;
      });
    case "waiting_on_driver":
      return copy.sort((a, b) => {
        const aWait = a.waitingOn === "driver" ? 0 : 1;
        const bWait = b.waitingOn === "driver" ? 0 : 1;
        return aWait - bWait || a.score.percent - b.score.percent;
      });
    case "waiting_on_broker":
      return copy.sort((a, b) => {
        const aWait = a.waitingOn === "broker" ? 0 : 1;
        const bWait = b.waitingOn === "broker" ? 0 : 1;
        return aWait - bWait || a.score.percent - b.score.percent;
      });
    case "waiting_on_accounting":
      return copy.sort((a, b) => {
        const aWait =
          a.waitingOn === "accounting" || a.waitingOn === "ready_to_invoice"
            ? 0
            : 1;
        const bWait =
          b.waitingOn === "accounting" || b.waitingOn === "ready_to_invoice"
            ? 0
            : 1;
        return aWait - bWait || a.score.percent - b.score.percent;
      });
    default:
      return copy;
  }
}

export function getHealthScoreTone(
  level: DocumentHealthScore["level"],
): "success" | "warning" | "critical" {
  switch (level) {
    case "complete":
      return "success";
    case "warning":
      return "warning";
    case "critical":
      return "critical";
  }
}
