-- Fail-closed role reads and atomic human review confirmation.
begin;

create or replace function public.current_business_role()
returns text language sql stable as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'business_role', '')
$$;
revoke all on function public.current_business_role() from public, anon;
grant execute on function public.current_business_role() to authenticated, service_role;

create or replace function public.document_intake_company_id()
returns uuid language plpgsql stable as $$
declare value text;
begin
  value := auth.jwt() -> 'app_metadata' ->> 'company_id';
  if value is null or value = '' then return null; end if;
  return value::uuid;
exception when invalid_text_representation then return null;
end $$;
revoke all on function public.document_intake_company_id() from public, anon;
grant execute on function public.document_intake_company_id() to authenticated, service_role;

create or replace function public.can_read_document(p_document_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.documents d
    where d.id = p_document_id and d.company_id = public.document_intake_company_id()
      and (
        public.current_business_role() in ('super_admin','owner')
        or (public.current_business_role() = 'dispatcher' and d.document_type in ('rate_confirmation','bol','pod','unknown'))
        or (public.current_business_role() = 'accounting' and d.document_type in ('rate_confirmation','pod','lumper_receipt','fuel_receipt','invoice','unknown'))
        or (public.current_business_role() = 'safety' and d.document_type in ('bol','pod','unknown'))
        or (public.current_business_role() in ('driver','maintenance','shipper') and d.created_by = auth.uid())
      )
  )
$$;
revoke all on function public.can_read_document(uuid) from public, anon;
grant execute on function public.can_read_document(uuid) to authenticated, service_role;

do $$ declare t text; begin
  foreach t in array array['documents','document_versions','document_ocr_results','document_ocr_fields','document_proposed_actions','document_approvals','document_audit_history'] loop
    execute format('drop policy if exists %I on public.%I', t || '_company_select', t);
  end loop;
end $$;

create policy documents_role_select on public.documents for select using (public.can_read_document(id));
create policy document_versions_role_select on public.document_versions for select using (public.can_read_document(document_id));
create policy document_ocr_results_role_select on public.document_ocr_results for select using (public.can_read_document(document_id));
create policy document_ocr_fields_role_select on public.document_ocr_fields for select using (
  exists (select 1 from public.document_ocr_results r where r.id = ocr_result_id and r.company_id = company_id and public.can_read_document(r.document_id))
);
create policy document_proposed_actions_role_select on public.document_proposed_actions for select using (public.can_read_document(document_id));
create policy document_approvals_role_select on public.document_approvals for select using (
  exists (select 1 from public.document_proposed_actions a where a.id = proposed_action_id and a.company_id = company_id and public.can_read_document(a.document_id))
);
create policy document_audit_history_role_select on public.document_audit_history for select using (document_id is not null and public.can_read_document(document_id));

create unique index if not exists document_audit_request_uidx
  on public.document_audit_history(company_id, request_id) where request_id is not null;

create or replace function public.confirm_document_review(
  p_document_id uuid, p_ocr_result_id uuid, p_proposed_action_id uuid, p_corrections jsonb
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_company uuid := public.document_intake_company_id();
  v_user uuid := auth.uid();
  v_approval uuid;
begin
  if v_company is null or v_user is null or public.current_business_role() not in ('super_admin','owner','accounting') then
    raise exception 'Not authorized to confirm document review';
  end if;
  if jsonb_typeof(p_corrections) <> 'array' or jsonb_array_length(p_corrections) > 50 then
    raise exception 'Invalid correction payload';
  end if;
  if not exists (
    select 1 from public.documents d
    join public.document_ocr_results r on r.id = p_ocr_result_id and r.company_id = d.company_id and r.document_id = d.id
    join public.document_proposed_actions a on a.id = p_proposed_action_id and a.company_id = d.company_id and a.document_id = d.id and a.ocr_result_id = r.id
    where d.id = p_document_id and d.company_id = v_company and d.current_version_id = r.document_version_id
      and a.requires_approval = true and a.status = 'pending'
  ) then raise exception 'Review proposal mismatch'; end if;
  if exists (
    select 1 from jsonb_array_elements(p_corrections) c
    where not exists (select 1 from public.document_ocr_fields f where f.company_id = v_company and f.ocr_result_id = p_ocr_result_id and f.field_key = c->>'fieldKey')
  ) then raise exception 'Unknown reviewed field'; end if;

  update public.document_ocr_fields f set
    value_text = coalesce((select c->>'value' from jsonb_array_elements(p_corrections) c where c->>'fieldKey' = f.field_key limit 1), f.value_text),
    is_verified = true, verified_by = v_user, verified_at = now()
  where f.company_id = v_company and f.ocr_result_id = p_ocr_result_id;

  insert into public.document_approvals(company_id, proposed_action_id, decision, decided_by)
  values (v_company, p_proposed_action_id, 'approved', v_user)
  on conflict (proposed_action_id) do update set decision = excluded.decision
  where document_approvals.decision = 'approved' and document_approvals.decided_by = v_user
  returning id into v_approval;
  if v_approval is null then raise exception 'Conflicting approval exists'; end if;

  update public.document_ocr_results set status = 'completed' where company_id = v_company and id = p_ocr_result_id;
  update public.document_proposed_actions set status = 'approved', updated_at = now(),
    payload = payload || jsonb_build_object('reviewed_fields', p_corrections, 'confirmation_state', 'confirmed')
    where company_id = v_company and id = p_proposed_action_id;
  update public.documents set status = 'ready', updated_at = now() where company_id = v_company and id = p_document_id;
  insert into public.document_audit_history(company_id, document_id, proposed_action_id, actor_user_id, event_type, detail, request_id)
  values (v_company, p_document_id, p_proposed_action_id, v_user, 'document_review_confirmed', 'Authenticated human approved the document-only proposal. No operational or financial record was changed.', 'document-confirmation:' || p_proposed_action_id)
  on conflict (company_id, request_id) where request_id is not null do nothing;
  return v_approval;
end $$;
revoke all on function public.confirm_document_review(uuid,uuid,uuid,jsonb) from public, anon;
grant execute on function public.confirm_document_review(uuid,uuid,uuid,jsonb) to authenticated;

drop policy if exists company_documents_update on storage.objects;
create policy company_documents_update on storage.objects for update using (
  bucket_id = 'company-documents' and (storage.foldername(name))[1] = public.document_intake_company_id()::text and owner_id = auth.uid()::text
) with check (
  bucket_id = 'company-documents' and (storage.foldername(name))[1] = public.document_intake_company_id()::text and owner_id = auth.uid()::text
);

commit;
