import { prependNotification } from "@/lib/data/notification-store";
import { DEMO_TENANT_ID } from "@/lib/data/tenant";
import { getIntegrationsStore } from "@/lib/integrations/store";
import { ELD_CATALOG } from "./catalog";
import type {
  EldCallNote,
  EldConnectionRuntime,
  EldConnectionStatus,
  EldFallbackImport,
  EldFallbackImportKind,
  EldIntegrationRequest,
  EldNegotiationStatus,
  EldProviderId,
  EldRejectionReason,
  EldRequestStatus,
  EldStoreState,
  EldUploadedDoc,
} from "./types";
import { ELD_REQUEST_STATUS_LABELS } from "./types";

const STORAGE_KEY = "carrieros.eld.v1";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function seedConnections(): Record<EldProviderId, EldConnectionRuntime> {
  const connections: Record<EldProviderId, EldConnectionRuntime> = {};
  for (const provider of ELD_CATALOG) {
    connections[provider.id] = {
      providerId: provider.id,
      status: provider.status,
      connectedAt:
        provider.status === "connected" ? daysAgo(40) : undefined,
      lastSyncAt: provider.status === "connected" ? daysAgo(0) : undefined,
    };
  }
  return syncWithIntegrations(connections);
}

/** Keep Samsara (and other shared ELDs) aligned with Integration Center. */
function syncWithIntegrations(
  connections: Record<EldProviderId, EldConnectionRuntime>,
): Record<EldProviderId, EldConnectionRuntime> {
  try {
    const integrations = getIntegrationsStore();
    const next = { ...connections };

    for (const provider of ELD_CATALOG) {
      if (!provider.integrationProviderId) continue;
      const runtime = integrations.connections[provider.integrationProviderId];
      if (!runtime) continue;

      if (runtime.status === "connected" && runtime.enabled) {
        next[provider.id] = {
          ...next[provider.id],
          providerId: provider.id,
          status: "connected",
          connectedAt: next[provider.id]?.connectedAt ?? new Date().toISOString(),
          lastSyncAt: runtime.health.lastSyncAt ?? new Date().toISOString(),
        };
      } else if (next[provider.id]?.status === "connected") {
        // Integration Center disconnected — fall back to catalog default if available
        const catalogStatus =
          provider.status === "connected" ? "available" : provider.status;
        next[provider.id] = {
          ...next[provider.id],
          status: catalogStatus,
          connectedAt: undefined,
        };
      }
    }

    return next;
  } catch {
    return connections;
  }
}

function seedRequests(): EldIntegrationRequest[] {
  return [
    {
      id: "eld-req-001",
      providerId: "verizon_connect",
      providerName: "Verizon Connect",
      carrierCompany: "Lone Star Alpha Carrier",
      mcNumber: "MC-927451",
      dotNumber: "USDOT-3482910",
      eldAccountNumber: "VC-88421",
      contactName: "Jordan Lee",
      contactEmail: "jordan@lonestar-alpha.com",
      contactPhone: "(210) 555-0180",
      truckCount: 28,
      featuresNeeded: ["live_gps", "state_mileage", "driver_hos", "fuel_data"],
      apiDocuments: [],
      eldRepresentative: {
        name: "Casey Nguyen",
        email: "casey.nguyen@verizonconnect.example",
        phone: "(800) 555-0144",
        title: "Partner Manager",
      },
      notes: "Need state mileage for IFTA Q3.",
      status: "waiting_for_response",
      negotiationStatus: "outreach_sent",
      assignedTeammate: "Alex Rivera",
      createdAt: daysAgo(12),
      updatedAt: daysAgo(3),
      statusHistory: [
        { status: "submitted", at: daysAgo(12) },
        { status: "carrier_contacted_eld", at: daysAgo(10) },
        { status: "waiting_for_response", at: daysAgo(3), note: "Follow-up sent" },
      ],
    },
    {
      id: "eld-req-002",
      providerId: "abc_eld",
      providerName: "ABC ELD",
      carrierCompany: "Lone Star Alpha Carrier",
      mcNumber: "MC-927451",
      dotNumber: "USDOT-3482910",
      eldAccountNumber: "ABC-1102",
      contactName: "Priya Shah",
      contactEmail: "priya@lonestar-alpha.com",
      contactPhone: "(210) 555-0192",
      truckCount: 6,
      featuresNeeded: ["vehicle_mileage", "state_mileage", "fuel_data"],
      apiDocuments: [
        {
          id: "doc-abc-1",
          fileName: "abc-eld-export-guide.pdf",
          uploadedAt: daysAgo(5),
          note: "Portal CSV export instructions",
        },
      ],
      eldRepresentative: {
        email: "support@abc-eld.example",
      },
      notes: "Owner-ops still on ABC — want fallback path if API never opens.",
      status: "technical_review",
      negotiationStatus: "docs_pending",
      assignedTeammate: "Morgan Chen",
      createdAt: daysAgo(20),
      updatedAt: daysAgo(2),
      statusHistory: [
        { status: "submitted", at: daysAgo(20) },
        { status: "carrier_contacted_eld", at: daysAgo(18) },
        { status: "eld_responded", at: daysAgo(14), note: "No API — CSV only" },
        { status: "documents_received", at: daysAgo(5) },
        { status: "technical_review", at: daysAgo(2) },
      ],
    },
    {
      id: "eld-req-003",
      providerId: "orbcomm",
      providerName: "Orbcomm",
      carrierCompany: "Lone Star Alpha Carrier",
      mcNumber: "MC-927451",
      dotNumber: "USDOT-3482910",
      eldAccountNumber: "ORB-5520",
      contactName: "Alpha Owner",
      contactEmail: "owner@lonestar-alpha.com",
      contactPhone: "(210) 555-0100",
      truckCount: 12,
      featuresNeeded: ["live_gps", "trailer_information", "fuel_data"],
      apiDocuments: [],
      eldRepresentative: {},
      notes: "Trailer tracking priority.",
      status: "submitted",
      negotiationStatus: "not_started",
      createdAt: daysAgo(4),
      updatedAt: daysAgo(4),
      statusHistory: [{ status: "submitted", at: daysAgo(4) }],
    },
  ];
}

function defaultState(): EldStoreState {
  return {
    connections: seedConnections(),
    requests: seedRequests(),
    callNotes: [],
    fallbackImports: [],
    updatedAt: new Date().toISOString(),
  };
}

let memoryState: EldStoreState | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function mergeState(stored: EldStoreState): EldStoreState {
  const defaults = seedConnections();
  const connections = { ...defaults };
  for (const provider of ELD_CATALOG) {
    const existing = stored.connections?.[provider.id];
    if (existing) {
      connections[provider.id] = existing;
    }
  }
  return {
    connections: syncWithIntegrations(connections),
    requests: stored.requests?.length ? stored.requests : seedRequests(),
    callNotes: stored.callNotes ?? [],
    fallbackImports: stored.fallbackImports ?? [],
    updatedAt: stored.updatedAt ?? new Date().toISOString(),
  };
}

function readState(): EldStoreState {
  if (memoryState) {
    memoryState = {
      ...memoryState,
      connections: syncWithIntegrations(memoryState.connections),
    };
    return memoryState;
  }
  if (!canUseStorage()) {
    memoryState = defaultState();
    return memoryState;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      memoryState = defaultState();
      return memoryState;
    }
    memoryState = mergeState(JSON.parse(raw) as EldStoreState);
    return memoryState;
  } catch {
    memoryState = defaultState();
    return memoryState;
  }
}

function writeState(next: EldStoreState) {
  memoryState = next;
  if (canUseStorage()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  notify();
}

function pushEldNotification(input: {
  title: string;
  body: string;
  requestId?: string;
  priority?: "high" | "medium" | "low";
}) {
  const id = newId("notif-eld");
  prependNotification({
    id,
    tenantId: DEMO_TENANT_ID,
    category: "system",
    type: "eld_request_update",
    title: input.title,
    body: input.body,
    priority: input.priority ?? "medium",
    alphTier: "should_review_today",
    createdAt: new Date().toISOString(),
    entityRefs: [],
    actions: [
      {
        id: `${id}-open`,
        label: "View ELD requests",
        kind: "navigate",
        href: input.requestId
          ? `/integrations/eld/requests?id=${input.requestId}`
          : "/integrations/eld/requests",
        primary: true,
      },
    ],
    channels: ["in_app"],
  });
}

export function getEldStore(): EldStoreState {
  return readState();
}

export function subscribeEldStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetEldStore(): void {
  writeState(defaultState());
}

export function getEldConnectionStatus(
  providerId: EldProviderId,
): EldConnectionStatus {
  const state = readState();
  return (
    state.connections[providerId]?.status ??
    ELD_CATALOG.find((p) => p.id === providerId)?.status ??
    "not_yet_supported"
  );
}

export function setEldConnectionStatus(
  providerId: EldProviderId,
  status: EldConnectionStatus,
): void {
  const state = readState();
  const current = state.connections[providerId] ?? {
    providerId,
    status,
  };
  writeState({
    ...state,
    connections: {
      ...state.connections,
      [providerId]: {
        ...current,
        status,
        connectedAt:
          status === "connected"
            ? current.connectedAt ?? new Date().toISOString()
            : undefined,
        lastSyncAt:
          status === "connected" ? new Date().toISOString() : current.lastSyncAt,
      },
    },
    updatedAt: new Date().toISOString(),
  });
}

export type SubmitEldRequestInput = {
  providerId: EldProviderId;
  providerName: string;
  carrierCompany: string;
  mcNumber: string;
  dotNumber: string;
  eldAccountNumber: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  truckCount: number;
  featuresNeeded: EldIntegrationRequest["featuresNeeded"];
  eldRepresentative?: EldIntegrationRequest["eldRepresentative"];
  notes: string;
  apiDocuments?: EldUploadedDoc[];
};

export function submitEldRequest(
  input: SubmitEldRequestInput,
): EldIntegrationRequest {
  const state = readState();
  const now = new Date().toISOString();
  const request: EldIntegrationRequest = {
    id: newId("eld-req"),
    providerId: input.providerId,
    providerName: input.providerName,
    carrierCompany: input.carrierCompany,
    mcNumber: input.mcNumber,
    dotNumber: input.dotNumber,
    eldAccountNumber: input.eldAccountNumber,
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    truckCount: input.truckCount,
    featuresNeeded: input.featuresNeeded,
    apiDocuments: input.apiDocuments ?? [],
    eldRepresentative: input.eldRepresentative ?? {},
    notes: input.notes,
    status: "submitted",
    negotiationStatus: "not_started",
    createdAt: now,
    updatedAt: now,
    statusHistory: [{ status: "submitted", at: now }],
  };

  // Mark catalog provider under review when carriers request unsupported ELDs
  const connection = state.connections[input.providerId];
  let connections = state.connections;
  if (
    connection &&
    (connection.status === "not_yet_supported" ||
      connection.status === "no_public_api")
  ) {
    connections = {
      ...connections,
      [input.providerId]: {
        ...connection,
        status:
          connection.status === "no_public_api"
            ? "no_public_api"
            : "under_review",
      },
    };
  }

  writeState({
    ...state,
    connections,
    requests: [request, ...state.requests],
    updatedAt: now,
  });

  pushEldNotification({
    title: `ELD request submitted — ${input.providerName}`,
    body: `Your connection request for ${input.providerName} is now Submitted.`,
    requestId: request.id,
    priority: "high",
  });

  return request;
}

export function updateEldRequestStatus(
  requestId: string,
  status: EldRequestStatus,
  options?: {
    note?: string;
    rejectionReason?: EldRejectionReason;
    rejectionDetail?: string;
    negotiationStatus?: EldNegotiationStatus;
    assignedTeammate?: string;
    silent?: boolean;
  },
): EldIntegrationRequest | null {
  const state = readState();
  const idx = state.requests.findIndex((r) => r.id === requestId);
  if (idx < 0) return null;

  const current = state.requests[idx];
  const now = new Date().toISOString();
  const updated: EldIntegrationRequest = {
    ...current,
    status,
    updatedAt: now,
    rejectionReason: options?.rejectionReason ?? current.rejectionReason,
    rejectionDetail: options?.rejectionDetail ?? current.rejectionDetail,
    negotiationStatus:
      options?.negotiationStatus ?? current.negotiationStatus,
    assignedTeammate: options?.assignedTeammate ?? current.assignedTeammate,
    statusHistory: [
      ...current.statusHistory,
      { status, at: now, note: options?.note },
    ],
  };

  const requests = [...state.requests];
  requests[idx] = updated;

  let connections = state.connections;
  if (status === "connected") {
    connections = {
      ...connections,
      [updated.providerId]: {
        providerId: updated.providerId,
        status: "connected",
        connectedAt: now,
        lastSyncAt: now,
      },
    };
  }

  writeState({
    ...state,
    connections,
    requests,
    updatedAt: now,
  });

  if (!options?.silent) {
    const label = ELD_REQUEST_STATUS_LABELS[status];
    pushEldNotification({
      title: `${updated.providerName} request → ${label}`,
      body:
        status === "rejected"
          ? `Request rejected${
              updated.rejectionReason
                ? `: ${updated.rejectionReason.replace(/_/g, " ")}`
                : "."
            }`
          : `Status updated to ${label}.`,
      requestId: updated.id,
      priority: status === "rejected" || status === "connected" ? "high" : "medium",
    });
  }

  return updated;
}

export function addEldRequestDocument(
  requestId: string,
  fileName: string,
  note?: string,
): EldUploadedDoc | null {
  const state = readState();
  const idx = state.requests.findIndex((r) => r.id === requestId);
  if (idx < 0) return null;

  const doc: EldUploadedDoc = {
    id: newId("eld-doc"),
    fileName,
    uploadedAt: new Date().toISOString(),
    note,
  };

  const current = state.requests[idx];
  const requests = [...state.requests];
  requests[idx] = {
    ...current,
    apiDocuments: [...current.apiDocuments, doc],
    updatedAt: new Date().toISOString(),
  };

  writeState({
    ...state,
    requests,
    updatedAt: new Date().toISOString(),
  });

  return doc;
}

export function addEldCallNote(input: {
  providerId: EldProviderId;
  requestId?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes: string;
  contactedAt?: string;
}): EldCallNote {
  const state = readState();
  const note: EldCallNote = {
    id: newId("eld-call"),
    providerId: input.providerId,
    requestId: input.requestId,
    contactedAt: input.contactedAt ?? new Date().toISOString(),
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    notes: input.notes,
    createdAt: new Date().toISOString(),
  };

  writeState({
    ...state,
    callNotes: [note, ...state.callNotes],
    updatedAt: new Date().toISOString(),
  });

  return note;
}

export function updateEldRepresentative(
  requestId: string,
  contact: EldIntegrationRequest["eldRepresentative"],
): void {
  const state = readState();
  const idx = state.requests.findIndex((r) => r.id === requestId);
  if (idx < 0) return;
  const requests = [...state.requests];
  requests[idx] = {
    ...requests[idx],
    eldRepresentative: { ...requests[idx].eldRepresentative, ...contact },
    updatedAt: new Date().toISOString(),
  };
  writeState({
    ...state,
    requests,
    updatedAt: new Date().toISOString(),
  });
}

export function recordEldFallbackImport(input: {
  kind: EldFallbackImportKind;
  fileName: string;
  providerId?: EldProviderId;
  note?: string;
  linkedToIfta?: boolean;
}): EldFallbackImport {
  const state = readState();
  const record: EldFallbackImport = {
    id: newId("eld-import"),
    kind: input.kind,
    fileName: input.fileName,
    providerId: input.providerId,
    note: input.note,
    linkedToIfta: Boolean(input.linkedToIfta),
    importedAt: new Date().toISOString(),
  };

  writeState({
    ...state,
    fallbackImports: [record, ...state.fallbackImports].slice(0, 50),
    updatedAt: new Date().toISOString(),
  });

  pushEldNotification({
    title: "ELD fallback import recorded",
    body: `${input.fileName} saved${
      input.linkedToIfta ? " and flagged for IFTA" : ""
    }.`,
    priority: "low",
  });

  return record;
}

export function listEldRequests(providerId?: EldProviderId): EldIntegrationRequest[] {
  const state = readState();
  if (!providerId) return state.requests;
  return state.requests.filter((r) => r.providerId === providerId);
}

export function getEldRequest(id: string): EldIntegrationRequest | undefined {
  return readState().requests.find((r) => r.id === id);
}
