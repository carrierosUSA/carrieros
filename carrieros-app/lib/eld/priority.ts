import { getEldCatalogProvider } from "./catalog";
import type {
  EldCatalogProvider,
  EldIntegrationRequest,
  EldNegotiationStatus,
} from "./types";

export type EldAdminQueueRow = {
  providerId: string;
  providerName: string;
  requestCount: number;
  trucksAffected: number;
  openRequests: EldIntegrationRequest[];
  eldContacts: Array<{ name?: string; email?: string; phone?: string }>;
  negotiationStatus: EldNegotiationStatus;
  hasDocuments: boolean;
  assignedTeammate?: string;
  priorityScore: number;
  apiAvailabilityScore: number;
  apiDifficulty: number;
  businessValue: number;
  catalogStatus: EldCatalogProvider["status"];
};

function difficultyFactor(difficulty: number): number {
  // Lower difficulty → higher priority contribution
  return Math.max(0.2, (6 - difficulty) / 5);
}

/**
 * Priority = requests × trucks × API availability × difficulty factor × business value
 */
export function computeEldPriorityScore(input: {
  requestCount: number;
  trucksAffected: number;
  apiAvailabilityScore: number;
  apiDifficulty: number;
  businessValue: number;
}): number {
  const trucks = Math.max(1, input.trucksAffected);
  const requests = Math.max(1, input.requestCount);
  const raw =
    requests *
    trucks *
    Math.max(0.1, input.apiAvailabilityScore) *
    difficultyFactor(input.apiDifficulty) *
    Math.max(1, input.businessValue);

  return Math.round(raw * 10) / 10;
}

const OPEN_STATUSES = new Set([
  "submitted",
  "carrier_contacted_eld",
  "waiting_for_response",
  "eld_responded",
  "documents_received",
  "technical_review",
  "development_started",
  "testing",
]);

export function buildEldAdminQueue(
  requests: EldIntegrationRequest[],
): EldAdminQueueRow[] {
  const byProvider = new Map<string, EldIntegrationRequest[]>();

  for (const req of requests) {
    if (!OPEN_STATUSES.has(req.status) && req.status !== "rejected") {
      // Still show rejected in aggregate counts via all requests
    }
    const list = byProvider.get(req.providerId) ?? [];
    list.push(req);
    byProvider.set(req.providerId, list);
  }

  const rows: EldAdminQueueRow[] = [];

  for (const [providerId, all] of byProvider) {
    const catalog = getEldCatalogProvider(providerId);
    const open = all.filter((r) => OPEN_STATUSES.has(r.status));
    const source = open.length > 0 ? open : all;
    const trucksAffected = source.reduce((sum, r) => sum + (r.truckCount || 0), 0);
    const contacts = source
      .map((r) => r.eldRepresentative)
      .filter((c) => c.email || c.name || c.phone);
    const hasDocuments = source.some((r) => r.apiDocuments.length > 0);
    const assigned =
      source.find((r) => r.assignedTeammate)?.assignedTeammate ??
      all.find((r) => r.assignedTeammate)?.assignedTeammate;
    const negotiationStatus =
      source[0]?.negotiationStatus ??
      all[0]?.negotiationStatus ??
      "not_started";

    const apiAvailabilityScore = catalog?.apiAvailabilityScore ?? 0;
    const apiDifficulty = catalog?.apiDifficulty ?? 5;
    const businessValue = catalog?.businessValue ?? 1;

    rows.push({
      providerId,
      providerName: catalog?.name ?? all[0]?.providerName ?? providerId,
      requestCount: all.length,
      trucksAffected,
      openRequests: open,
      eldContacts: contacts,
      negotiationStatus,
      hasDocuments,
      assignedTeammate: assigned,
      priorityScore: computeEldPriorityScore({
        requestCount: all.length,
        trucksAffected,
        apiAvailabilityScore,
        apiDifficulty,
        businessValue,
      }),
      apiAvailabilityScore,
      apiDifficulty,
      businessValue,
      catalogStatus: catalog?.status ?? "not_yet_supported",
    });
  }

  return rows.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function mostRequestedElds(
  requests: EldIntegrationRequest[],
  limit = 5,
): EldAdminQueueRow[] {
  return buildEldAdminQueue(requests).slice(0, limit);
}
