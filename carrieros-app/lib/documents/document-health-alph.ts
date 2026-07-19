import type { AlphFixAction, AlphIssue } from "@/lib/dispatch/alph-issues";
import type {
  DocumentHealthSnapshot,
  DocumentIssue,
  DocumentQuickAction,
} from "@/lib/documents/types";

/**
 * Maps Document Health issues → Alph issue strip format.
 * Extends AlphFixAction via uploadDocument / document request actions.
 */

export type DocumentAlphFixAction =
  | AlphFixAction
  | "uploadDocument"
  | "requestFromDriver"
  | "requestFromBroker"
  | "markException"
  | "ignoreIssue";

export type DocumentAlphIssue = Omit<AlphIssue, "fixAction"> & {
  fixAction: DocumentAlphFixAction;
  documentIssueId: string;
  quickAction: DocumentQuickAction;
};

const ACTION_TO_ALPH: Record<DocumentQuickAction, DocumentAlphFixAction> = {
  uploadNow: "uploadDocument",
  takePhoto: "uploadDocument",
  requestFromDriver: "requestFromDriver",
  requestFromBroker: "requestFromBroker",
  markAsException: "markException",
  ignore: "ignoreIssue",
};

const ACTION_LABELS: Record<DocumentQuickAction, string> = {
  uploadNow: "Upload Now",
  takePhoto: "Take Photo",
  requestFromDriver: "Request Driver",
  requestFromBroker: "Request Broker",
  markAsException: "Mark Exception",
  ignore: "Ignore",
};

export function documentIssueToAlph(issue: DocumentIssue): DocumentAlphIssue {
  // Prefer requestPod for classic POD missing so existing load-detail wiring works
  let fixAction: DocumentAlphFixAction = ACTION_TO_ALPH[issue.primaryAction];
  if (issue.kind === "missing" && issue.documentKind === "pod") {
    fixAction = "requestPod";
  }

  return {
    id: `doc-health-${issue.id}`,
    severity: issue.severity,
    message: issue.message,
    fixLabel:
      fixAction === "requestPod"
        ? "Request POD"
        : ACTION_LABELS[issue.primaryAction],
    fixAction,
    viewTarget: "load-carrier-documents",
    documentIssueId: issue.id,
    quickAction: issue.primaryAction,
  };
}

export function documentHealthToAlphIssues(
  snapshot: DocumentHealthSnapshot,
  limit = 5,
): DocumentAlphIssue[] {
  return snapshot.issues.slice(0, limit).map(documentIssueToAlph);
}

/** Merge operational Alph issues with document health (dedupe POD). */
export function mergeAlphWithDocumentHealth(
  operational: AlphIssue[],
  snapshot: DocumentHealthSnapshot,
): AlphIssue[] {
  const docIssues = documentHealthToAlphIssues(snapshot);
  const hasOperationalPod = operational.some(
    (issue) =>
      issue.id === "pod-missing" || issue.id === "broker-pod-request",
  );

  const filteredDoc = docIssues.filter((issue) => {
    if (
      hasOperationalPod &&
      issue.documentIssueId.includes("missing-pod")
    ) {
      return false;
    }
    return true;
  });

  // Cast fixAction back to AlphIssue — extended actions handled by strip consumers
  const asAlph: AlphIssue[] = filteredDoc.map((issue) => ({
    id: issue.id,
    severity: issue.severity,
    message: issue.message,
    fixLabel: issue.fixLabel,
    fixAction: issue.fixAction as AlphFixAction,
    viewTarget: issue.viewTarget,
  }));

  const merged = [...operational, ...asAlph];
  const seen = new Set<string>();
  const unique: AlphIssue[] = [];

  for (const issue of merged) {
    if (seen.has(issue.id)) {
      continue;
    }
    seen.add(issue.id);
    unique.push(issue);
  }

  return unique.sort((left, right) => {
    if (left.severity === right.severity) {
      return 0;
    }
    return left.severity === "critical" ? -1 : 1;
  });
}
