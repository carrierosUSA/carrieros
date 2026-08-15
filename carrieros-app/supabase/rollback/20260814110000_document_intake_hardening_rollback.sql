-- Guarded rollback for review before manual use.
begin;
do $$ begin
  if exists (select 1 from public.document_audit_history where request_id like 'document-confirmation:%' limit 1) then
    raise exception 'Rollback refused: atomic confirmation records exist.';
  end if;
end $$;
drop function if exists public.confirm_document_review(uuid,uuid,uuid,jsonb);
drop policy if exists document_audit_history_role_select on public.document_audit_history;
drop policy if exists document_approvals_role_select on public.document_approvals;
drop policy if exists document_proposed_actions_role_select on public.document_proposed_actions;
drop policy if exists document_ocr_fields_role_select on public.document_ocr_fields;
drop policy if exists document_ocr_results_role_select on public.document_ocr_results;
drop policy if exists document_versions_role_select on public.document_versions;
drop policy if exists documents_role_select on public.documents;
drop function if exists public.can_read_document(uuid);
drop function if exists public.current_business_role();
drop function if exists public.document_intake_company_id();
commit;
