/**
 * Compliance integration stubs for FMCSA, Clearinghouse, ELD, and insurance.
 * Providers are not connected yet — interfaces are ready for future wiring.
 */

export type ComplianceProviderId =
  | "fmcsa"
  | "clearinghouse"
  | "eld"
  | "insurance";

export type ComplianceConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export type ComplianceProviderMeta = {
  id: ComplianceProviderId;
  name: string;
  description: string;
  capabilities: string[];
};

export type ComplianceConnection = {
  providerId: ComplianceProviderId;
  status: ComplianceConnectionStatus;
  connectedAt?: string;
  lastSyncAt?: string;
  externalAccountName?: string;
  errorMessage?: string;
};

export type ComplianceSyncResult = {
  ok: boolean;
  syncedAt: string;
  recordsPulled: number;
  message: string;
};

export type ComplianceProvider = {
  id: ComplianceProviderId;
  connect: (tenantId: string) => Promise<ComplianceConnection>;
  disconnect: (tenantId: string) => Promise<void>;
  getStatus: (tenantId: string) => Promise<ComplianceConnection>;
  sync: (tenantId: string) => Promise<ComplianceSyncResult>;
};

export const COMPLIANCE_PROVIDERS: ComplianceProviderMeta[] = [
  {
    id: "fmcsa",
    name: "FMCSA",
    description: "Pull carrier snapshot, inspections, and crash history.",
    capabilities: ["carrier_snapshot", "inspections", "crashes", "sms"],
  },
  {
    id: "clearinghouse",
    name: "CDL Clearinghouse",
    description: "Query drug & alcohol violation status for drivers.",
    capabilities: ["full_query", "limited_query", "consent"],
  },
  {
    id: "eld",
    name: "ELD / Telematics",
    description: "Sync HOS, inspection reports, and safety events.",
    capabilities: ["hos", "dvir", "safety_events", "location"],
  },
  {
    id: "insurance",
    name: "Insurance",
    description: "Certificate tracking, claims intake, and COI renewals.",
    capabilities: ["certificates", "claims", "renewals"],
  },
];

const connectionState = new Map<string, ComplianceConnection>();

function key(tenantId: string, providerId: ComplianceProviderId): string {
  return `${tenantId}:${providerId}`;
}

function stubProvider(id: ComplianceProviderId): ComplianceProvider {
  return {
    id,
    async connect(tenantId) {
      const connection: ComplianceConnection = {
        providerId: id,
        status: "disconnected",
        errorMessage:
          "Integration not configured. Connect credentials in a future release.",
      };
      connectionState.set(key(tenantId, id), connection);
      return connection;
    },
    async disconnect(tenantId) {
      connectionState.set(key(tenantId, id), {
        providerId: id,
        status: "disconnected",
      });
    },
    async getStatus(tenantId) {
      return (
        connectionState.get(key(tenantId, id)) ?? {
          providerId: id,
          status: "disconnected",
        }
      );
    },
    async sync(tenantId) {
      void tenantId;
      return {
        ok: false,
        syncedAt: new Date().toISOString(),
        recordsPulled: 0,
        message: `${id} sync is not enabled yet.`,
      };
    },
  };
}

export const fmcsaProvider = stubProvider("fmcsa");
export const clearinghouseProvider = stubProvider("clearinghouse");
export const eldProvider = stubProvider("eld");
export const insuranceProvider = stubProvider("insurance");

export function getComplianceProvider(
  id: ComplianceProviderId,
): ComplianceProvider {
  switch (id) {
    case "fmcsa":
      return fmcsaProvider;
    case "clearinghouse":
      return clearinghouseProvider;
    case "eld":
      return eldProvider;
    case "insurance":
      return insuranceProvider;
  }
}

export function listComplianceConnections(
  tenantId: string,
): ComplianceConnection[] {
  return COMPLIANCE_PROVIDERS.map((meta) => {
    const stored = connectionState.get(key(tenantId, meta.id));
    return (
      stored ?? {
        providerId: meta.id,
        status: "disconnected" as const,
      }
    );
  });
}
