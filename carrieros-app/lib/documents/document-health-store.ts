import { DEMO_TENANT_ID } from "@/lib/data/tenant";
import type {
  DocumentHealthTimelineEvent,
  DocumentRequest,
  HealthDocumentInventoryItem,
} from "@/lib/documents/types";

/**
 * Mock inventory + requests for Document Health.
 * Packet store docs are merged at compute time; this adds extras + quality flags.
 */

export const healthDocumentInventory: HealthDocumentInventoryItem[] = [
  // load-24001 — rate con only (packet), plus blurry BOL attempt elsewhere
  {
    id: "health-24001-bol-blur",
    loadId: "load-24001",
    kind: "bol",
    label: "BOL",
    fileName: "LD-24001-bol-blur.jpg",
    capturedAt: "2026-07-02T14:08:00Z",
    status: "captured",
    flags: { blurry: true },
  },
  // load-24002 — complete packet; also mark as healthy extras
  {
    id: "health-24002-pod-sig",
    loadId: "load-24002",
    kind: "receiver_signature",
    label: "Receiver Signature",
    fileName: "LD-24002-receiver-sig.pdf",
    capturedAt: "2026-07-02T16:12:00Z",
    status: "approved",
  },
  // load-24010 — duplicate rate con + wrong type
  {
    id: "health-24010-ratecon-dup",
    loadId: "load-24010",
    kind: "rate_confirmation",
    label: "Rate Confirmation",
    fileName: "LD-24010-ratecon-copy.pdf",
    capturedAt: "2026-07-04T08:30:00Z",
    status: "scanned",
    flags: { duplicateOf: "doc-load-24010-ratecon" },
  },
  {
    id: "health-24010-wrong-type",
    loadId: "load-24010",
    kind: "pod",
    label: "POD",
    fileName: "LD-24010-fuel-as-pod.jpg",
    capturedAt: "2026-07-04T09:00:00Z",
    status: "captured",
    flags: { wrongType: true },
  },
  // load-24013 — delivered, missing POD; empty page upload
  {
    id: "health-24013-empty",
    loadId: "load-24013",
    kind: "pod",
    label: "POD",
    fileName: "LD-24013-blank.pdf",
    capturedAt: "2026-07-03T18:00:00Z",
    status: "captured",
    flags: { emptyPage: true },
  },
  // load-24014 — has POD in packet sense; missing invoice + fuel
  {
    id: "health-24014-fuel",
    loadId: "load-24014",
    kind: "fuel_receipt",
    label: "Fuel Receipt",
    fileName: "LD-24014-fuel-expired.jpg",
    capturedAt: "2026-06-01T12:00:00Z",
    status: "captured",
    flags: { expired: true, expiresAt: "2026-06-15T00:00:00Z" },
  },
  // load-24019 — reefer, missing temp logs; wrong load assignment
  {
    id: "health-24019-wrong-load",
    loadId: "load-24019",
    kind: "bol",
    label: "BOL",
    fileName: "LD-24008-bol-misfiled.pdf",
    capturedAt: "2026-07-04T11:00:00Z",
    status: "scanned",
    flags: { wrongLoadId: "load-24008" },
  },
  // load-24020 — ready-ish, missing invoice + signatures
  {
    id: "health-24020-driver-sig",
    loadId: "load-24020",
    kind: "driver_signature",
    label: "Driver Signature",
    fileName: "LD-24020-driver-sig.pdf",
    capturedAt: "2026-07-02T14:00:00Z",
    status: "scanned",
    flags: { missingSignature: true },
  },
  // load-24008 — missing pages on BOL
  {
    id: "health-24008-bol-pages",
    loadId: "load-24008",
    kind: "bol",
    label: "BOL",
    fileName: "LD-24008-bol-page1.pdf",
    capturedAt: "2026-07-05T09:30:00Z",
    status: "captured",
    flags: { missingPages: true },
  },
];

/** Soft-require lumper on these loads (heuristic until AI detects lumper charges). */
export const lumperExpectedLoadIds = new Set([
  "load-24013",
  "load-24014",
]);

/** Soft-require fuel receipt verification on these loads. */
export const fuelExpectedLoadIds = new Set([
  "load-24010",
  "load-24014",
  "load-24016",
  "load-24019",
]);

export const documentHealthRequests: DocumentRequest[] = [
  {
    id: "dreq-1",
    loadId: "load-24013",
    loadReference: "LD-24013",
    target: "driver",
    documentKind: "pod",
    status: "pending",
    requestedAt: "2026-07-03T19:00:00Z",
    requestedBy: "Dispatcher",
    channel: "sms",
    note: "Broker needs POD to release payment.",
  },
  {
    id: "dreq-2",
    loadId: "load-24012",
    loadReference: "LD-24012",
    target: "broker",
    documentKind: "rate_confirmation",
    status: "pending",
    requestedAt: "2026-07-05T10:00:00Z",
    requestedBy: "Dispatcher",
    channel: "email",
  },
  {
    id: "dreq-3",
    loadId: "load-24014",
    loadReference: "LD-24014",
    target: "driver",
    documentKind: "lumper_receipt",
    status: "pending",
    requestedAt: "2026-07-03T15:00:00Z",
    requestedBy: "Accounting",
    channel: "push",
  },
  {
    id: "dreq-4",
    loadId: "load-24006",
    loadReference: "LD-24006",
    target: "broker",
    documentKind: "bol",
    status: "pending",
    requestedAt: "2026-07-05T11:30:00Z",
    requestedBy: "Dispatcher",
    channel: "portal",
  },
];

export const documentHealthTimelineSeed: DocumentHealthTimelineEvent[] = [
  {
    id: "dht-1",
    loadId: "load-24002",
    type: "uploaded",
    label: "Rate Confirmation uploaded",
    occurredAt: "2026-07-01T09:10:00Z",
    actorName: "Broker portal",
    documentKind: "rate_confirmation",
  },
  {
    id: "dht-2",
    loadId: "load-24002",
    type: "reviewed",
    label: "BOL reviewed by Alph",
    occurredAt: "2026-07-02T10:16:00Z",
    actorName: "Alph",
    documentKind: "bol",
  },
  {
    id: "dht-3",
    loadId: "load-24002",
    type: "approved",
    label: "POD approved",
    occurredAt: "2026-07-02T16:11:00Z",
    actorName: "Dispatcher",
    documentKind: "pod",
  },
  {
    id: "dht-4",
    loadId: "load-24013",
    type: "requested",
    label: "POD requested from driver",
    occurredAt: "2026-07-03T19:00:00Z",
    actorName: "Dispatcher",
    documentKind: "pod",
  },
  {
    id: "dht-5",
    loadId: "load-24013",
    type: "rejected",
    label: "POD rejected — empty page",
    occurredAt: "2026-07-03T18:05:00Z",
    actorName: "Alph",
    documentKind: "pod",
    detail: "Empty page detected",
  },
  {
    id: "dht-6",
    loadId: "load-24010",
    type: "uploaded",
    label: "Duplicate rate confirmation uploaded",
    occurredAt: "2026-07-04T08:30:00Z",
    actorName: "Broker portal",
    documentKind: "rate_confirmation",
  },
  {
    id: "dht-7",
    loadId: "load-24014",
    type: "shared",
    label: "Packet shared with accounting",
    occurredAt: "2026-07-03T16:00:00Z",
    actorName: "Dispatcher",
  },
  {
    id: "dht-8",
    loadId: "load-24020",
    type: "downloaded",
    label: "POD downloaded",
    occurredAt: "2026-07-02T15:00:00Z",
    actorName: "Accounting",
    documentKind: "pod",
  },
];

/** Mutable ignored / exception issue keys: `${loadId}:${issueKind}:${documentKind}` */
export const ignoredIssueKeys = new Set<string>();
export const exceptionIssueKeys = new Set<string>();

export const liveTimelineEvents: DocumentHealthTimelineEvent[] = [
  ...documentHealthTimelineSeed,
];

export const liveDocumentRequests: DocumentRequest[] = [
  ...documentHealthRequests,
];

export function issueKey(
  loadId: string,
  kind: string,
  documentKind: string,
): string {
  return `${loadId}:${kind}:${documentKind}`;
}

export function markIssueIgnored(
  loadId: string,
  kind: string,
  documentKind: string,
): void {
  ignoredIssueKeys.add(issueKey(loadId, kind, documentKind));
  liveTimelineEvents.unshift({
    id: `dht-live-${Date.now()}`,
    loadId,
    type: "ignored",
    label: `Issue ignored — ${documentKind.replaceAll("_", " ")}`,
    occurredAt: new Date().toISOString(),
    actorName: "Dispatcher",
    documentKind: documentKind as DocumentHealthTimelineEvent["documentKind"],
  });
}

export function markIssueException(
  loadId: string,
  kind: string,
  documentKind: string,
): void {
  exceptionIssueKeys.add(issueKey(loadId, kind, documentKind));
  liveTimelineEvents.unshift({
    id: `dht-live-${Date.now()}`,
    loadId,
    type: "exception",
    label: `Marked as exception — ${documentKind.replaceAll("_", " ")}`,
    occurredAt: new Date().toISOString(),
    actorName: "Dispatcher",
    documentKind: documentKind as DocumentHealthTimelineEvent["documentKind"],
  });
}

export function recordDocumentRequest(
  request: Omit<DocumentRequest, "id" | "requestedAt" | "status">,
): DocumentRequest {
  const created: DocumentRequest = {
    ...request,
    id: `dreq-live-${Date.now()}`,
    status: "pending",
    requestedAt: new Date().toISOString(),
  };
  liveDocumentRequests.unshift(created);
  liveTimelineEvents.unshift({
    id: `dht-live-${Date.now()}`,
    loadId: request.loadId,
    type: "requested",
    label: `${request.documentKind.replaceAll("_", " ")} requested from ${request.target}`,
    occurredAt: created.requestedAt,
    actorName: request.requestedBy,
    documentKind: request.documentKind,
  });
  return created;
}

export function getTimelineForLoad(
  loadId: string,
): DocumentHealthTimelineEvent[] {
  return liveTimelineEvents
    .filter((event) => event.loadId === loadId)
    .sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1));
}

export function getPendingRequests(): DocumentRequest[] {
  return liveDocumentRequests.filter((request) => request.status === "pending");
}

export function getInventoryForLoad(
  loadId: string,
): HealthDocumentInventoryItem[] {
  return healthDocumentInventory.filter((item) => item.loadId === loadId);
}

export function tenantId(): string {
  return DEMO_TENANT_ID;
}
