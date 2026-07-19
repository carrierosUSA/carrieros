import type { AlphBuiltContext } from "@/lib/alph/context/types";
import type { AlphMode } from "@/lib/alph/modes";
import type { PermissionId } from "@/lib/permissions/types";

export type AlphToolId =
  | "search_loads"
  | "read_load"
  | "search_drivers"
  | "read_driver"
  | "search_trucks"
  | "read_truck"
  | "search_trailers"
  | "read_trailer"
  | "search_customers"
  | "search_documents"
  | "read_document_metadata"
  | "search_invoices"
  | "search_expenses"
  | "search_maintenance"
  | "search_fuel"
  | "generate_report_draft"
  | "generate_message_draft"
  | "generate_invoice_draft"
  | "generate_payroll_draft"
  | "create_approval_request";

export type AlphToolRisk = "read" | "draft" | "approval";

export type AlphToolResult<T = unknown> = {
  ok: true;
  data: T;
  /** Records cited for transparency. */
  citations: Array<{ type: string; id: string; label?: string }>;
  truncated?: boolean;
};

export type AlphToolError = {
  ok: false;
  code:
    | "permission_denied"
    | "validation_error"
    | "not_found"
    | "tenant_mismatch"
    | "rate_limited"
    | "forbidden_write"
    | "internal_error";
  message: string;
};

export type AlphToolExecutionResult<T = unknown> =
  | AlphToolResult<T>
  | AlphToolError;

export type AlphToolContext = {
  context: AlphBuiltContext;
  mode: AlphMode;
  requestId: string;
};

export type AlphToolDefinition = {
  id: AlphToolId;
  name: string;
  description: string;
  risk: AlphToolRisk;
  /** Permission required — checked server-side before execute. */
  permission: PermissionId;
  /** Max results for list tools. */
  defaultLimit?: number;
  validate: (input: unknown) => unknown;
  execute: (
    // Validated by `validate` before execute; tools cast as needed.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input: any,
    ctx: AlphToolContext,
  ) => Promise<AlphToolExecutionResult>;
};

export type AlphListQuery = {
  query?: string;
  limit?: number;
  offset?: number;
};
