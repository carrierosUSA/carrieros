-- MANUAL ROLLBACK ONLY. Never place this file in supabase/migrations.
-- Refuses to remove the foundation while document records or stored objects exist.

do $$
begin
  if to_regclass('public.documents') is not null
     and exists (select 1 from public.documents limit 1) then
    raise exception 'Rollback refused: public.documents contains records.';
  end if;

  if exists (
    select 1 from storage.objects
    where bucket_id = 'company-documents'
    limit 1
  ) then
    raise exception 'Rollback refused: company-documents contains stored files.';
  end if;
end
$$;

drop policy if exists company_documents_delete on storage.objects;
drop policy if exists company_documents_update on storage.objects;
drop policy if exists company_documents_insert on storage.objects;
drop policy if exists company_documents_read on storage.objects;

drop table if exists public.document_audit_history;
drop table if exists public.document_approvals;
drop table if exists public.document_proposed_actions;
drop table if exists public.document_ocr_fields;
drop table if exists public.document_ocr_results;
alter table if exists public.documents drop constraint if exists documents_current_version_fk;
drop table if exists public.document_versions;
drop table if exists public.documents;

delete from storage.buckets where id = 'company-documents';
drop function if exists public.current_company_id();
