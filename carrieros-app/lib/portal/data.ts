import { loads as seedLoads } from "@/lib/data/loads";
import { dispatchBoardSeedLoads } from "@/lib/dispatch/demo-loads";
import { listInvoices } from "@/lib/data/finance-store";
import { getCompanyById } from "@/lib/data/companies";
import { DEMO_TENANT_ID } from "@/lib/data/tenant";
import {
  portalDocumentsSeed,
  portalLoadRequestsSeed,
  portalNotificationsSeed,
  portalThreadsSeed,
  getPortalCompanyById,
  getPortalUsersForCompany,
} from "@/lib/portal/seed";
import type {
  PortalDocument,
  PortalLoadRequest,
  PortalMessageThread,
  PortalNotification,
  PortalSession,
} from "@/lib/portal/types";
import type { Load } from "@/lib/types";
import type { FinanceInvoice } from "@/lib/types/finance";

const ALL_LOADS: Load[] = [...seedLoads, ...dispatchBoardSeedLoads];

let loadRequestStore: PortalLoadRequest[] = portalLoadRequestsSeed.map((r) => ({
  ...r,
}));
let documentStore: PortalDocument[] = portalDocumentsSeed.map((d) => ({ ...d }));
let notificationStore: PortalNotification[] = portalNotificationsSeed.map(
  (n) => ({ ...n }),
);
let threadStore: PortalMessageThread[] = portalThreadsSeed.map((t) => ({
  ...t,
  messages: t.messages.map((m) => ({ ...m })),
}));

export function getPortalLoadsForSession(session: PortalSession): Load[] {
  return ALL_LOADS.filter((load) => {
    if (session.linkedBrokerId && load.brokerId === session.linkedBrokerId) {
      return true;
    }
    if (
      session.linkedCustomerId &&
      load.customerId === session.linkedCustomerId
    ) {
      return true;
    }
    return false;
  });
}

export function getPortalInvoicesForSession(
  session: PortalSession,
): FinanceInvoice[] {
  const all = listInvoices(DEMO_TENANT_ID);
  if (session.linkedBrokerId) {
    return all.filter((inv) => inv.brokerId === session.linkedBrokerId);
  }
  // Shippers: show invoices tied to their loads
  const loadIds = new Set(getPortalLoadsForSession(session).map((l) => l.id));
  return all.filter((inv) => inv.loadId && loadIds.has(inv.loadId));
}

export function listPortalLoadRequests(companyId: string): PortalLoadRequest[] {
  return loadRequestStore
    .filter((r) => r.companyId === companyId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createPortalLoadRequest(
  input: Omit<PortalLoadRequest, "id" | "reference" | "createdAt" | "updatedAt" | "status"> & {
    status?: PortalLoadRequest["status"];
  },
): PortalLoadRequest {
  const n = loadRequestStore.length + 1000;
  const now = new Date().toISOString();
  const request: PortalLoadRequest = {
    ...input,
    id: `plr-${Date.now()}`,
    reference: `REQ-${n}`,
    status: input.status ?? "submitted",
    createdAt: now,
    updatedAt: now,
  };
  loadRequestStore = [request, ...loadRequestStore];
  return request;
}

export function cancelPortalLoadRequest(
  companyId: string,
  requestId: string,
): PortalLoadRequest | null {
  const idx = loadRequestStore.findIndex(
    (r) => r.id === requestId && r.companyId === companyId,
  );
  if (idx < 0) return null;
  const current = loadRequestStore[idx];
  if (current.status === "cancelled" || current.status === "completed") {
    return current;
  }
  const updated: PortalLoadRequest = {
    ...current,
    status: "cancelled",
    updatedAt: new Date().toISOString(),
  };
  loadRequestStore = [
    ...loadRequestStore.slice(0, idx),
    updated,
    ...loadRequestStore.slice(idx + 1),
  ];
  return updated;
}

export function duplicatePortalLoadRequest(
  companyId: string,
  requestId: string,
  userId: string,
): PortalLoadRequest | null {
  const source = loadRequestStore.find(
    (r) => r.id === requestId && r.companyId === companyId,
  );
  if (!source) return null;
  return createPortalLoadRequest({
    companyId,
    createdByUserId: userId,
    originCity: source.originCity,
    originState: source.originState,
    destinationCity: source.destinationCity,
    destinationState: source.destinationState,
    pickupDate: source.pickupDate,
    deliveryDate: source.deliveryDate,
    commodity: source.commodity,
    equipmentType: source.equipmentType,
    weight: source.weight,
    pieces: source.pieces,
    notes: source.notes ? `Duplicated from ${source.reference}. ${source.notes}` : `Duplicated from ${source.reference}.`,
  });
}

export function listPortalDocuments(companyId: string): PortalDocument[] {
  return documentStore
    .filter((d) => d.companyId === companyId)
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export function uploadPortalDocument(
  doc: Omit<PortalDocument, "id" | "uploadedAt" | "status"> & {
    status?: PortalDocument["status"];
  },
): PortalDocument {
  const created: PortalDocument = {
    ...doc,
    id: `pdoc-${Date.now()}`,
    status: doc.status ?? "uploaded",
    uploadedAt: new Date().toISOString(),
  };
  documentStore = [created, ...documentStore];
  return created;
}

export function listPortalNotifications(
  companyId: string,
): PortalNotification[] {
  return notificationStore
    .filter((n) => n.companyId === companyId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function markPortalNotificationRead(id: string) {
  notificationStore = notificationStore.map((n) =>
    n.id === id ? { ...n, read: true } : n,
  );
}

export function markAllPortalNotificationsRead(companyId: string) {
  notificationStore = notificationStore.map((n) =>
    n.companyId === companyId ? { ...n, read: true } : n,
  );
}

export function listPortalThreads(companyId: string): PortalMessageThread[] {
  return threadStore
    .filter((t) => t.companyId === companyId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function sendPortalMessage(
  companyId: string,
  threadId: string,
  senderName: string,
  body: string,
): PortalMessageThread | null {
  const idx = threadStore.findIndex(
    (t) => t.id === threadId && t.companyId === companyId,
  );
  if (idx < 0) return null;
  const thread = threadStore[idx];
  const message = {
    id: `pmsg-${Date.now()}`,
    threadId,
    sender: "portal" as const,
    senderName,
    body,
    sentAt: new Date().toISOString(),
  };
  const updated: PortalMessageThread = {
    ...thread,
    unread: 0,
    updatedAt: message.sentAt,
    messages: [...thread.messages, message],
  };
  threadStore = [
    ...threadStore.slice(0, idx),
    updated,
    ...threadStore.slice(idx + 1),
  ];
  return updated;
}

export function getPortalDashboardStats(session: PortalSession) {
  const loads = getPortalLoadsForSession(session);
  const invoices = getPortalInvoicesForSession(session);
  const docs = listPortalDocuments(session.companyId);
  const notifications = listPortalNotifications(session.companyId);
  const today = "2026-07-17";

  const activeStatuses = new Set([
    "pending",
    "dispatched",
    "picked_up",
    "in_transit",
  ]);
  const activeLoads = loads.filter((l) => activeStatuses.has(l.status));
  const upcomingPickups = loads.filter(
    (l) => l.pickupDate >= today && activeStatuses.has(l.status),
  );
  const deliveriesToday = loads.filter(
    (l) => l.deliveryDate === today && l.status !== "cancelled",
  );
  const completedLoads = loads.filter(
    (l) => l.status === "delivered" || l.status === "invoiced",
  );
  const openInvoices = invoices.filter(
    (i) => i.status === "sent" || i.status === "overdue" || i.status === "partial",
  );
  const docsAwaiting = docs.filter((d) => d.status === "awaiting_review");

  return {
    activeLoads: activeLoads.length,
    upcomingPickups: upcomingPickups.length,
    deliveriesToday: deliveriesToday.length,
    completedLoads: completedLoads.length,
    openInvoices: openInvoices.length,
    documentsAwaitingReview: docsAwaiting.length,
    unreadNotifications: notifications.filter((n) => !n.read).length,
    outstandingBalance: openInvoices.reduce(
      (sum, inv) => sum + Math.max(0, inv.amount - inv.amountPaid),
      0,
    ),
  };
}

export function getPortalCompanyProfile(session: PortalSession) {
  const portalCompany = getPortalCompanyById(session.companyId);
  const directory = session.directoryCompanyId
    ? getCompanyById(session.directoryCompanyId)
    : undefined;
  const users = getPortalUsersForCompany(session.companyId);
  return { portalCompany, directory, users };
}

export function buildPortalAlphInsights(session: PortalSession) {
  const loads = getPortalLoadsForSession(session);
  const stats = getPortalDashboardStats(session);
  const inTransit = loads.filter((l) => l.status === "in_transit");
  const delayed = loads.filter((l) => l.complianceStatus === "attention");

  return {
    summary:
      stats.activeLoads === 0
        ? "No active shipments right now. Create a load request when you're ready."
        : `You have ${stats.activeLoads} active shipment${stats.activeLoads === 1 ? "" : "s"} with ${stats.deliveriesToday} delivery${stats.deliveriesToday === 1 ? "" : "ies"} due today.`,
    delayExplanation:
      delayed.length > 0
        ? `${delayed.length} load${delayed.length === 1 ? "" : "s"} need attention — check documents or assignment status.`
        : "No delays flagged. All tracked loads look on schedule.",
    etaPrediction:
      inTransit.length > 0
        ? `${inTransit[0].reference} is in transit toward ${inTransit[0].destination.city}, ${inTransit[0].destination.state}. Live ETA is available on Tracking.`
        : "No loads currently in transit. ETAs will appear once a truck is moving.",
    documentStatus:
      stats.documentsAwaitingReview > 0
        ? `${stats.documentsAwaitingReview} document${stats.documentsAwaitingReview === 1 ? "" : "s"} awaiting your review.`
        : "Document packet looks complete for recent shipments.",
    smartInsight:
      session.companyType === "broker"
        ? "Quick Pay invoices clear fastest when POD is uploaded within 2 hours of delivery."
        : "Duplicate your last Houston → Dallas request to book a similar lane in one click.",
  };
}
