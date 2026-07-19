import type { AlphWorkspaceFocus } from "@/lib/alph/identity";
import type { PermissionId } from "@/lib/permissions/types";

export type AlphRecordRef = {
  type:
    | "load"
    | "driver"
    | "truck"
    | "trailer"
    | "customer"
    | "broker"
    | "document"
    | "invoice"
    | "expense"
    | "maintenance"
    | "fuel"
    | "other";
  id: string;
  label?: string;
};

export type AlphContextChip = {
  id: string;
  kind:
    | "workspace"
    | "load"
    | "driver"
    | "truck"
    | "trailer"
    | "date_range"
    | "company"
    | "page"
    | "custom";
  label: string;
  value: string;
  removable?: boolean;
};

export type AlphWorkspaceKnowledge = {
  focus: AlphWorkspaceFocus;
  /** Domains Alph should bias retrieval toward in this workspace. */
  domains: string[];
  /** Example questions for this workspace. */
  hints: string[];
};

export type AlphBuiltContext = {
  requestId: string;
  builtAt: string;
  tenantId: string;
  companyId: string;
  companyName: string;
  userId: string;
  userName: string;
  role: string;
  /** Permissions the user currently holds (never elevated). */
  permissions: PermissionId[];
  workspace: AlphWorkspaceFocus;
  workspaceKnowledge: AlphWorkspaceKnowledge;
  pathname?: string;
  pageLabel?: string;
  recordRefs: AlphRecordRef[];
  chips: AlphContextChip[];
  /** Recent activity snippets (already permission-filtered). */
  recentActivity: Array<{ id: string; text: string; at?: string }>;
  /** User intent hint from UI (optional). */
  intentHint?: string;
  /** Date range chip values if present. */
  dateRange?: { from?: string; to?: string };
};

export type AlphContextInput = {
  pathname?: string;
  workspaceId?: string;
  loadId?: string;
  driverId?: string;
  truckId?: string;
  trailerId?: string;
  documentId?: string;
  invoiceId?: string;
  dateFrom?: string;
  dateTo?: string;
  intentHint?: string;
  /** Chips the user removed before send. */
  removedChipIds?: string[];
  recentActivity?: Array<{ id: string; text: string; at?: string }>;
};
