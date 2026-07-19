/**
 * Accounting integration stubs for QuickBooks, Xero, Stripe, and Plaid.
 * These providers are not connected yet — interfaces are ready for future wiring.
 */

export type AccountingProviderId =
  | "quickbooks"
  | "xero"
  | "stripe"
  | "plaid";

export type AccountingConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export type AccountingProviderMeta = {
  id: AccountingProviderId;
  name: string;
  description: string;
  capabilities: string[];
};

export type AccountingConnection = {
  providerId: AccountingProviderId;
  status: AccountingConnectionStatus;
  connectedAt?: string;
  lastSyncAt?: string;
  externalCompanyName?: string;
  errorMessage?: string;
};

export type SyncResult = {
  ok: boolean;
  syncedAt: string;
  recordsPushed: number;
  recordsPulled: number;
  message: string;
};

export type AccountingProvider = {
  id: AccountingProviderId;
  connect: (tenantId: string) => Promise<AccountingConnection>;
  disconnect: (tenantId: string) => Promise<void>;
  getStatus: (tenantId: string) => Promise<AccountingConnection>;
  syncInvoices: (tenantId: string) => Promise<SyncResult>;
  syncExpenses: (tenantId: string) => Promise<SyncResult>;
  syncPayments: (tenantId: string) => Promise<SyncResult>;
};

export const ACCOUNTING_PROVIDERS: AccountingProviderMeta[] = [
  {
    id: "quickbooks",
    name: "QuickBooks Online",
    description: "Sync invoices, expenses, and payments with QuickBooks.",
    capabilities: ["invoices", "expenses", "payments", "chart_of_accounts"],
  },
  {
    id: "xero",
    name: "Xero",
    description: "Two-way sync for AR, bills, and bank reconciliation.",
    capabilities: ["invoices", "bills", "bank_reconciliation"],
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Collect carrier and broker payments online.",
    capabilities: ["payment_links", "payouts", "webhooks"],
  },
  {
    id: "plaid",
    name: "Plaid",
    description: "Connect bank accounts for cash flow and reconciliation.",
    capabilities: ["bank_balances", "transactions", "identity"],
  },
];

const connectionState = new Map<string, AccountingConnection>();

function key(tenantId: string, providerId: AccountingProviderId): string {
  return `${tenantId}:${providerId}`;
}

function stubProvider(id: AccountingProviderId): AccountingProvider {
  return {
    id,
    async connect(tenantId) {
      const connection: AccountingConnection = {
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
    async syncInvoices(tenantId) {
      void tenantId;
      return {
        ok: false,
        syncedAt: new Date().toISOString(),
        recordsPushed: 0,
        recordsPulled: 0,
        message: `${id} invoice sync is not enabled yet.`,
      };
    },
    async syncExpenses(tenantId) {
      void tenantId;
      return {
        ok: false,
        syncedAt: new Date().toISOString(),
        recordsPushed: 0,
        recordsPulled: 0,
        message: `${id} expense sync is not enabled yet.`,
      };
    },
    async syncPayments(tenantId) {
      void tenantId;
      return {
        ok: false,
        syncedAt: new Date().toISOString(),
        recordsPushed: 0,
        recordsPulled: 0,
        message: `${id} payment sync is not enabled yet.`,
      };
    },
  };
}

export const quickbooksProvider = stubProvider("quickbooks");
export const xeroProvider = stubProvider("xero");
export const stripeProvider = stubProvider("stripe");
export const plaidProvider = stubProvider("plaid");

export function getAccountingProvider(
  id: AccountingProviderId,
): AccountingProvider {
  switch (id) {
    case "quickbooks":
      return quickbooksProvider;
    case "xero":
      return xeroProvider;
    case "stripe":
      return stripeProvider;
    case "plaid":
      return plaidProvider;
  }
}

export function listAccountingConnections(
  tenantId: string,
): AccountingConnection[] {
  return ACCOUNTING_PROVIDERS.map((meta) => {
    const stored = connectionState.get(key(tenantId, meta.id));
    return (
      stored ?? {
        providerId: meta.id,
        status: "disconnected" as const,
      }
    );
  });
}
