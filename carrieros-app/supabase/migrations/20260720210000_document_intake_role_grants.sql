-- Restrict document-intake privileges to the minimum operations required.
-- Existing RLS policies and company-aware constraints remain unchanged.

begin;

revoke all privileges on table
  public.documents,
  public.document_versions,
  public.document_ocr_results,
  public.document_ocr_fields,
  public.document_proposed_actions,
  public.document_approvals,
  public.document_audit_history
from anon, authenticated, service_role;

-- Unauthenticated users intentionally receive no document-table privileges.

-- Authenticated users may read only rows allowed by company-scoped RLS.
grant select on table
  public.documents,
  public.document_versions,
  public.document_ocr_results,
  public.document_ocr_fields,
  public.document_proposed_actions,
  public.document_approvals,
  public.document_audit_history
to authenticated;

-- Explicit human approval remains governed by the existing approval RLS policy.
grant insert on table public.document_approvals to authenticated;

-- Server-only document intake may read foundation records.
grant select on table
  public.documents,
  public.document_versions,
  public.document_ocr_results,
  public.document_ocr_fields,
  public.document_proposed_actions,
  public.document_approvals,
  public.document_audit_history
to service_role;

-- Mutable server-managed records.
grant insert, update on table
  public.documents,
  public.document_ocr_results,
  public.document_ocr_fields,
  public.document_proposed_actions
to service_role;

-- Append-only server-managed records.
grant insert on table
  public.document_versions,
  public.document_audit_history
to service_role;

-- No sequence grants are required.
-- Existing function EXECUTE privileges remain unchanged.

commit;
