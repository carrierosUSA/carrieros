-- Human-controlled POD/invoice linking and final load closure.
-- Review before applying. This file does not run against an environment by itself.
begin;

create table public.load_document_links (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  load_id uuid not null,
  document_id uuid not null,
  document_type text not null check (document_type in ('pod','invoice')),
  linked_by uuid not null,
  linked_at timestamptz not null default now(),
  unique (company_id, id),
  unique (load_id, document_id, document_type),
  constraint load_document_links_load_company_fk foreign key (company_id, load_id)
    references public.loads(company_id, id) on delete cascade,
  constraint load_document_links_document_company_fk foreign key (company_id, document_id)
    references public.documents(company_id, id)
);

create index load_document_links_company_load_idx
  on public.load_document_links(company_id, load_id, document_type);
alter table public.load_document_links enable row level security;
create policy load_document_links_authorized_select on public.load_document_links
for select using (public.can_read_load(load_id) and public.can_read_document(document_id));

revoke all privileges on table public.load_document_links from public, anon, authenticated, service_role;
grant select on table public.load_document_links to authenticated, service_role;
grant insert on table public.load_document_links to service_role;

create or replace function public.is_current_approved_document(p_document_id uuid, p_type text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.documents d
    join public.document_ocr_results r
      on r.company_id = d.company_id and r.document_id = d.id
      and r.document_version_id = d.current_version_id and r.status = 'completed'
    join public.document_proposed_actions a
      on a.company_id = d.company_id and a.document_id = d.id
      and a.ocr_result_id = r.id and a.status = 'approved'
    join public.document_approvals approval
      on approval.company_id = d.company_id and approval.proposed_action_id = a.id
      and approval.decision = 'approved'
    where d.id = p_document_id
      and d.company_id = public.document_intake_company_id()
      and d.document_type = p_type
      and d.status = 'ready'
  )
$$;

create or replace function public.list_verified_closure_documents(p_load_id uuid)
returns table(document_id uuid, title text, document_type text)
language sql
stable
security definer
set search_path = public
as $$
  select d.id, d.title, d.document_type
  from public.documents d
  where public.current_business_role() in ('super_admin','owner','dispatcher')
    and public.can_read_load(p_load_id)
    and d.company_id = public.document_intake_company_id()
    and d.document_type in ('pod','invoice')
    and public.is_current_approved_document(d.id, d.document_type)
  order by d.created_at desc
$$;

create or replace function public.get_load_closure_readiness(p_load_id uuid)
returns table(has_verified_pod boolean, has_verified_invoice boolean, ready_to_close boolean)
language sql
stable
security definer
set search_path = public
as $$
  with verified as (
    select l.document_type
    from public.load_document_links l
    where l.company_id = public.document_intake_company_id()
      and l.load_id = p_load_id
      and public.can_read_load(p_load_id)
      and public.current_business_role() in ('super_admin','owner','dispatcher')
      and public.is_current_approved_document(l.document_id, l.document_type)
  ), flags as (
    select
      exists(select 1 from verified where document_type = 'pod') as pod,
      exists(select 1 from verified where document_type = 'invoice') as invoice
  )
  select pod, invoice, pod and invoice from flags
$$;

create or replace function public.link_verified_closure_document(
  p_load_id uuid, p_document_id uuid, p_request_id text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company uuid := public.document_intake_company_id();
  v_user uuid := auth.uid();
  v_role text := public.current_business_role();
  v_status text;
  v_type text;
  v_link uuid;
begin
  if v_company is null or v_user is null or v_role not in ('super_admin','owner','dispatcher') then
    raise exception 'Not authorized to link closure documents';
  end if;
  if p_request_id is null or char_length(p_request_id) not between 8 and 200 then
    raise exception 'Invalid request identifier';
  end if;
  select status into v_status from public.loads
  where id = p_load_id and company_id = v_company and public.can_read_load(id) for update;
  if v_status is null then raise exception 'Load not found or not authorized'; end if;
  if v_status not in ('arrived_delivery','delivered') then
    raise exception 'Closure documents may be linked only at delivery';
  end if;

  select document_type into v_type from public.documents
  where id = p_document_id and company_id = v_company;
  if v_type not in ('pod','invoice') or not public.is_current_approved_document(p_document_id, v_type) then
    raise exception 'Current human-approved POD or invoice is required';
  end if;

  if exists (select 1 from public.load_events e where e.company_id = v_company and e.load_id = p_load_id and e.request_id = p_request_id) then
    select id into v_link from public.load_document_links
    where company_id = v_company and load_id = p_load_id and document_id = p_document_id and document_type = v_type;
    if v_link is not null then return v_link; end if;
  end if;

  insert into public.load_document_links(company_id, load_id, document_id, document_type, linked_by)
  values (v_company, p_load_id, p_document_id, v_type, v_user)
  on conflict (load_id, document_id, document_type) do update set linked_at = load_document_links.linked_at
  returning id into v_link;

  insert into public.load_events(company_id, load_id, event_type, status, factual_note, source, actor_user_id, request_id)
  values (v_company, p_load_id, 'document_received', v_status,
    'Authenticated human linked a current approved ' || upper(v_type) || ' for closure review. Load was not closed.',
    case when v_role = 'dispatcher' then 'dispatcher' else 'owner' end, v_user, p_request_id);
  return v_link;
end
$$;

create or replace function public.close_verified_load(
  p_load_id uuid, p_expected_status text, p_exceptions_resolved boolean,
  p_note text, p_request_id text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company uuid := public.document_intake_company_id();
  v_user uuid := auth.uid();
  v_role text := public.current_business_role();
  v_status text;
  v_exception text;
begin
  if v_company is null or v_user is null or v_role not in ('super_admin','owner','dispatcher') then
    raise exception 'Not authorized to close loads';
  end if;
  if p_request_id is null or char_length(p_request_id) not between 8 and 200 then raise exception 'Invalid request identifier'; end if;
  if p_note is not null and char_length(trim(p_note)) not between 1 and 2000 then raise exception 'Invalid closure note'; end if;
  if p_exceptions_resolved is not true then raise exception 'Human exception resolution confirmation is required'; end if;

  select status, exception_summary into v_status, v_exception from public.loads
  where id = p_load_id and company_id = v_company and public.can_read_load(id) for update;
  if v_status is null then raise exception 'Load not found or not authorized'; end if;
  if exists (select 1 from public.load_events e where e.company_id = v_company and e.load_id = p_load_id and e.request_id = p_request_id) then return p_load_id; end if;
  if p_expected_status is distinct from v_status then raise exception 'Load status changed; reload before closing'; end if;
  if v_status <> 'delivered' then raise exception 'Only delivered loads may be closed'; end if;
  if v_exception is not null and p_note is null then raise exception 'A factual exception resolution note is required'; end if;
  if not exists (
    select 1 from public.load_document_links l where l.company_id = v_company and l.load_id = p_load_id
      and l.document_type = 'pod' and public.is_current_approved_document(l.document_id, 'pod')
  ) or not exists (
    select 1 from public.load_document_links l where l.company_id = v_company and l.load_id = p_load_id
      and l.document_type = 'invoice' and public.is_current_approved_document(l.document_id, 'invoice')
  ) then raise exception 'Verified POD and invoice are required'; end if;

  update public.loads set status = 'closed', exception_summary = null, updated_at = now()
  where id = p_load_id and company_id = v_company;
  insert into public.load_events(company_id, load_id, event_type, status, factual_note, source, actor_user_id, request_id)
  values (v_company, p_load_id, 'status_changed', 'closed',
    coalesce('Human-approved closure: verified POD and invoice; exceptions confirmed resolved. ' || nullif(trim(p_note), ''),
      'Human-approved closure: verified POD and invoice; exceptions confirmed resolved.'),
    case when v_role = 'dispatcher' then 'dispatcher' else 'owner' end, v_user, p_request_id);
  return p_load_id;
end
$$;

revoke all on function public.is_current_approved_document(uuid,text) from public, anon;
revoke all on function public.list_verified_closure_documents(uuid) from public, anon;
revoke all on function public.get_load_closure_readiness(uuid) from public, anon;
revoke all on function public.link_verified_closure_document(uuid,uuid,text) from public, anon;
revoke all on function public.close_verified_load(uuid,text,boolean,text,text) from public, anon;
grant execute on function public.list_verified_closure_documents(uuid) to authenticated;
grant execute on function public.get_load_closure_readiness(uuid) to authenticated;
grant execute on function public.link_verified_closure_document(uuid,uuid,text) to authenticated;
grant execute on function public.close_verified_load(uuid,text,boolean,text,text) to authenticated;

commit;
