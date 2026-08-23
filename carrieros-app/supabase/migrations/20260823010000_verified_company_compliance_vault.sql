-- Human-verified company compliance register. No filing, renewal, or legal conclusion is automated.
-- Review before applying. This file does not run against an environment by itself.
begin;

create table public.company_compliance_records(
  id uuid primary key default gen_random_uuid(), company_id uuid not null, document_id uuid,
  category text not null check(category in('insurance','w9','operating_authority','ucr','ifta_license','permit','annual_inspection','other')),
  title text not null check(char_length(title) between 2 and 200), reference_number text,
  effective_on date, expires_on date, status text not null default 'active' check(status in('active','voided')),
  factual_note text not null check(char_length(factual_note) between 3 and 2000), verified_by uuid not null,
  request_id text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(company_id,id), unique(company_id,request_id),
  constraint compliance_document_company_fk foreign key(company_id,document_id) references public.documents(company_id,id)
);
create table public.company_compliance_events(
  id uuid primary key default gen_random_uuid(), company_id uuid not null, record_id uuid not null,
  event_type text not null check(event_type in('created','updated','voided')), before_state jsonb, after_state jsonb,
  factual_note text not null, actor_user_id uuid not null, request_id text not null, created_at timestamptz not null default now(),
  unique(company_id,request_id), constraint compliance_event_company_fk foreign key(company_id,record_id) references public.company_compliance_records(company_id,id)
);
create index compliance_company_expiry_idx on public.company_compliance_records(company_id,expires_on) where status='active';
alter table public.company_compliance_records enable row level security; alter table public.company_compliance_events enable row level security;
create policy compliance_authorized_select on public.company_compliance_records for select using(company_id=public.document_intake_company_id() and public.current_business_role() in('super_admin','owner','safety','accounting'));
create policy compliance_events_authorized_select on public.company_compliance_events for select using(company_id=public.document_intake_company_id() and public.current_business_role() in('super_admin','owner','safety','accounting'));
revoke all privileges on table public.company_compliance_records,public.company_compliance_events from public,anon,authenticated,service_role;
grant select on table public.company_compliance_records,public.company_compliance_events to authenticated,service_role;
grant insert,update on table public.company_compliance_records to service_role; grant insert on table public.company_compliance_events to service_role;

create or replace function public.list_approved_compliance_documents()
returns table(document_id uuid,title text) language sql stable security definer set search_path=public as $$
  select distinct d.id,d.title from public.documents d
  join public.document_ocr_results r on r.company_id=d.company_id and r.document_id=d.id and r.document_version_id=d.current_version_id and r.status='completed'
  join public.document_proposed_actions a on a.company_id=d.company_id and a.document_id=d.id and a.ocr_result_id=r.id and a.status='approved'
  join public.document_approvals approval on approval.company_id=d.company_id and approval.proposed_action_id=a.id and approval.decision='approved'
  where d.company_id=public.document_intake_company_id() and d.status='ready' and public.current_business_role() in('super_admin','owner','safety') order by d.title
$$;

create or replace function public.list_verified_company_compliance()
returns table(id uuid,document_id uuid,document_title text,category text,title text,reference_number text,effective_on date,expires_on date,status text,factual_note text,updated_at timestamptz)
language sql stable security definer set search_path=public as $$
  select r.id,r.document_id,d.title,r.category,r.title,r.reference_number,r.effective_on,r.expires_on,r.status,r.factual_note,r.updated_at
  from public.company_compliance_records r left join public.documents d on d.company_id=r.company_id and d.id=r.document_id
  where r.company_id=public.document_intake_company_id() and public.current_business_role() in('super_admin','owner','safety','accounting')
  order by case when r.status='active' then 0 else 1 end,r.expires_on nulls last,r.title
$$;

create or replace function public.save_verified_company_compliance(
  p_record_id uuid,p_document_id uuid,p_category text,p_title text,p_reference_number text,p_effective_on date,p_expires_on date,p_note text,p_request_id text
) returns uuid language plpgsql security definer set search_path=public as $$
declare c uuid:=public.document_intake_company_id();u uuid:=auth.uid();r text:=public.current_business_role();x uuid;b jsonb;a jsonb;event text;
begin
  if c is null or u is null or r not in('super_admin','owner','safety') then raise exception 'Not authorized to manage compliance records';end if;
  if p_request_id is null or char_length(p_request_id) not between 8 and 200 or p_category not in('insurance','w9','operating_authority','ucr','ifta_license','permit','annual_inspection','other') or char_length(trim(p_title)) not between 2 and 200 or char_length(trim(p_note)) not between 3 and 2000 or (p_effective_on is not null and p_expires_on is not null and p_expires_on<p_effective_on) then raise exception 'Invalid verified compliance facts';end if;
  select record_id into x from public.company_compliance_events where company_id=c and request_id=p_request_id;if x is not null then return x;end if;
  if p_document_id is not null and not exists(select 1 from public.documents d where d.company_id=c and d.id=p_document_id and d.status='ready' and exists(select 1 from public.document_ocr_results o join public.document_proposed_actions pa on pa.company_id=o.company_id and pa.document_id=o.document_id and pa.ocr_result_id=o.id and pa.status='approved' join public.document_approvals ap on ap.company_id=pa.company_id and ap.proposed_action_id=pa.id and ap.decision='approved' where o.company_id=d.company_id and o.document_id=d.id and o.document_version_id=d.current_version_id and o.status='completed')) then raise exception 'Current approved document required';end if;
  if p_record_id is null then
    insert into public.company_compliance_records(company_id,document_id,category,title,reference_number,effective_on,expires_on,factual_note,verified_by,request_id) values(c,p_document_id,p_category,trim(p_title),nullif(trim(p_reference_number),''),p_effective_on,p_expires_on,trim(p_note),u,p_request_id) returning id into x;event:='created';
  else
    select to_jsonb(v) into b from public.company_compliance_records v where v.company_id=c and v.id=p_record_id and v.status='active' for update;if b is null then raise exception 'Active compliance record not found';end if;
    update public.company_compliance_records set document_id=p_document_id,category=p_category,title=trim(p_title),reference_number=nullif(trim(p_reference_number),''),effective_on=p_effective_on,expires_on=p_expires_on,factual_note=trim(p_note),verified_by=u,request_id=p_request_id,updated_at=now() where company_id=c and id=p_record_id returning id into x;event:='updated';
  end if;
  select to_jsonb(v) into a from public.company_compliance_records v where v.company_id=c and v.id=x;
  insert into public.company_compliance_events(company_id,record_id,event_type,before_state,after_state,factual_note,actor_user_id,request_id) values(c,x,event,b,a,trim(p_note),u,p_request_id);return x;
end$$;

create or replace function public.void_verified_company_compliance(p_record_id uuid,p_reason text,p_request_id text)
returns uuid language plpgsql security definer set search_path=public as $$
declare c uuid:=public.document_intake_company_id();u uuid:=auth.uid();r text:=public.current_business_role();x uuid;b jsonb;a jsonb;
begin if c is null or u is null or r not in('super_admin','owner','safety') then raise exception 'Not authorized';end if;if char_length(trim(p_reason)) not between 3 and 2000 or p_request_id is null or char_length(p_request_id) not between 8 and 200 then raise exception 'Reason required';end if;select record_id into x from public.company_compliance_events where company_id=c and request_id=p_request_id;if x is not null then return x;end if;select to_jsonb(v) into b from public.company_compliance_records v where v.company_id=c and v.id=p_record_id and v.status='active' for update;if b is null then raise exception 'Active record not found';end if;update public.company_compliance_records set status='voided',updated_at=now() where company_id=c and id=p_record_id returning id into x;select to_jsonb(v) into a from public.company_compliance_records v where v.company_id=c and v.id=x;insert into public.company_compliance_events(company_id,record_id,event_type,before_state,after_state,factual_note,actor_user_id,request_id)values(c,x,'voided',b,a,trim(p_reason),u,p_request_id);return x;end$$;

revoke all on function public.list_approved_compliance_documents(),public.list_verified_company_compliance(),public.save_verified_company_compliance(uuid,uuid,text,text,text,date,date,text,text),public.void_verified_company_compliance(uuid,text,text) from public,anon;
grant execute on function public.list_approved_compliance_documents(),public.list_verified_company_compliance(),public.save_verified_company_compliance(uuid,uuid,text,text,text,date,date,text,text),public.void_verified_company_compliance(uuid,text,text) to authenticated;
commit;
