/**
 * Document Health types — Alph Missing Documents System.
 * Structured for future OCR / AI classification without changing call sites.
 */

export const HEALTH_DOCUMENT_KINDS = [
  "rate_confirmation",
  "bol",
  "pod",
  "invoice",
  "lumper_receipt",
  "fuel_receipt",
  "scale_ticket",
  "washout_receipt",
  "temperature_logs",
  "driver_signature",
  "receiver_signature",
  "pickup_photos",
  "delivery_photos",
  "custom",
] as const;

export type HealthDocumentKind = (typeof HEALTH_DOCUMENT_KINDS)[number];

export type DocumentHealthLevel = "complete" | "warning" | "critical";

export type DocumentHealthScore = {
  level: DocumentHealthLevel;
  /** 0–100 */
  percent: number;
  label: string;
};

export type DocumentIssueKind =
  | "missing"
  | "duplicate"
  | "wrong_type"
  | "blurry"
  | "empty_page"
  | "missing_signature"
  | "missing_pages"
  | "wrong_load"
  | "expired";

export type DocumentIssueSeverity = "warning" | "critical";

export type DocumentQuickAction =
  | "uploadNow"
  | "takePhoto"
  | "requestFromDriver"
  | "requestFromBroker"
  | "markAsException"
  | "ignore";

export type DocumentWaitingOn =
  | "none"
  | "driver"
  | "broker"
  | "accounting"
  | "ready_to_invoice";

export type DocumentIssue = {
  id: string;
  loadId: string;
  kind: DocumentIssueKind;
  documentKind: HealthDocumentKind;
  severity: DocumentIssueSeverity;
  message: string;
  detail?: string;
  /** Suggested primary quick action */
  primaryAction: DocumentQuickAction;
  /** Who is blocking resolution */
  waitingOn: Exclude<DocumentWaitingOn, "none" | "ready_to_invoice"> | "none";
  /** Heuristic confidence until real OCR/AI lands */
  confidence: number;
  documentId?: string;
  ignored?: boolean;
  exception?: boolean;
};

export type DocumentHealthChecklistItem = {
  kind: HealthDocumentKind;
  label: string;
  required: boolean;
  present: boolean;
  status: "missing" | "on_file" | "exception" | "ignored";
  issueIds: string[];
};

export type DocumentHealthTimelineEventType =
  | "requested"
  | "uploaded"
  | "reviewed"
  | "approved"
  | "rejected"
  | "reuploaded"
  | "downloaded"
  | "shared"
  | "exception"
  | "ignored";

export type DocumentHealthTimelineEvent = {
  id: string;
  loadId: string;
  type: DocumentHealthTimelineEventType;
  label: string;
  occurredAt: string;
  actorName?: string;
  documentKind?: HealthDocumentKind;
  detail?: string;
};

export type DocumentRequestTarget = "driver" | "broker";

export type DocumentRequestStatus = "pending" | "fulfilled" | "cancelled";

export type DocumentRequest = {
  id: string;
  loadId: string;
  loadReference: string;
  target: DocumentRequestTarget;
  documentKind: HealthDocumentKind;
  status: DocumentRequestStatus;
  requestedAt: string;
  requestedBy: string;
  channel: "sms" | "email" | "push" | "portal";
  note?: string;
};

export type DocumentHealthSnapshot = {
  loadId: string;
  loadReference: string;
  score: DocumentHealthScore;
  issues: DocumentIssue[];
  checklist: DocumentHealthChecklistItem[];
  waitingOn: DocumentWaitingOn;
  criticalCount: number;
  warningCount: number;
  missingRequiredCount: number;
  readyToInvoice: boolean;
  timeline: DocumentHealthTimelineEvent[];
};

export type DocumentHealthSort =
  | "most_critical"
  | "ready_to_invoice"
  | "waiting_on_driver"
  | "waiting_on_broker"
  | "waiting_on_accounting";

export type DocumentInventoryFlags = {
  blurry?: boolean;
  emptyPage?: boolean;
  missingSignature?: boolean;
  missingPages?: boolean;
  wrongType?: boolean;
  wrongLoadId?: string;
  expired?: boolean;
  duplicateOf?: string;
  /** ISO date when doc expires */
  expiresAt?: string;
};

/** Extended inventory row used by health heuristics (maps to packet docs + extras). */
export type HealthDocumentInventoryItem = {
  id: string;
  loadId: string;
  kind: HealthDocumentKind;
  label: string;
  fileName?: string;
  capturedAt?: string;
  status: "captured" | "scanned" | "approved";
  flags?: DocumentInventoryFlags;
};
