-- Owner-controlled team access request queue. No email is sent and no auth role is changed.
-- Review before applying. This file does not run against an environment by itself.
begin;
create table public.team_access_requests(
  id uuid primary key default gen_random_uuid(),company_id uuid not null,
  request_type text not null check(request_type in('invitation','role_change')),
  target_email text not null check(char_length(target_email) between 3 and 254),target_user_id uuid,
  requested_role text not null check(requested_role in('dispatcher','accounting','safety','maintenance','driver','read_only')),
  status text not null default 'pending_confirmation' check(status in('pending_confirmation','completed','revoked','expired')),
  expires_at timestamptz not null,requested_by uuid not null,request_id text not null,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  unique(company_id,id),unique(company_id,request_id),
  check((request_type='invitation' and target_user_id is null)or(request_type='role_change' and target_user_id is not null))
);
create unique index one_open_team_access_request on public.team_access_requests(company_id,request_type,target_email)where status='pending_confirmation';
create table public.team_access_request_events(
  id uuid primary key default gen_random_uuid(),company_id uuid not null,team_access_request_id uuid not null,
  event_type text not null check(event_type in('prepared','revoked')),factual_note text not null,
  actor_user_id uuid not null,request_id text not null,created_at timestamptz not null default now(),
  unique(company_id,request_id),constraint team_access_event_request_fk foreign key(company_id,team_access_request_id)references public.team_access_requests(company_id,id)
);
alter table public.team_access_requests enable row level security;alter table public.team_access_request_events enable row level security;
create policy team_access_owner_select on public.team_access_requests for select using(company_id=public.document_intake_company_id()and public.current_business_role()in('super_admin','owner'));
create policy team_access_events_owner_select on public.team_access_request_events for select using(company_id=public.document_intake_company_id()and public.current_business_role()in('super_admin','owner'));
revoke all privileges on table public.team_access_requests,public.team_access_request_events from public,anon,authenticated,service_role;
grant select on table public.team_access_requests,public.team_access_request_events to authenticated,service_role;
grant insert,update on table public.team_access_requests to service_role;grant insert on table public.team_access_request_events to service_role;

create or replace function public.list_verified_team_access_requests()
returns table(id uuid,request_type text,target_email text,target_user_id uuid,requested_role text,status text,expires_at timestamptz,created_at timestamptz)
language sql stable security definer set search_path=public as $$
 select r.id,r.request_type,r.target_email,r.target_user_id,r.requested_role,case when r.status='pending_confirmation'and r.expires_at<=now()then'expired'else r.status end,r.expires_at,r.created_at
 from public.team_access_requests r where r.company_id=public.document_intake_company_id()and public.current_business_role()in('super_admin','owner')order by r.created_at desc,r.id
$$;

create or replace function public.prepare_verified_team_access_request(p_request_type text,p_target_email text,p_target_user_id uuid,p_requested_role text,p_expires_at timestamptz,p_note text,p_request_id text)returns uuid
language plpgsql security definer set search_path=public as $$
declare v_company uuid:=public.document_intake_company_id();v_user uuid:=auth.uid();v_role text:=public.current_business_role();v_id uuid;v_email text:=lower(trim(p_target_email));v_target_company text;v_target_role text;
begin
 if v_company is null or v_user is null or v_role not in('super_admin','owner')then raise exception 'Not authorized to manage team access';end if;
 if p_request_id is null or char_length(p_request_id)not between 8 and 200 then raise exception 'Invalid request identifier';end if;
 select r.id into v_id from public.team_access_requests r where r.company_id=v_company and r.request_id=p_request_id;if v_id is not null then return v_id;end if;
 if p_request_type not in('invitation','role_change')or p_requested_role not in('dispatcher','accounting','safety','maintenance','driver','read_only')then raise exception 'Invalid access request';end if;
 if char_length(v_email)not between 3 and 254 or v_email!~*'^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'then raise exception 'Invalid target email';end if;
 if p_expires_at is null or p_expires_at<=now()+interval '1 hour'or p_expires_at>now()+interval '30 days'then raise exception 'Invalid expiration';end if;
 if p_note is null or char_length(trim(p_note))not between 3 and 2000 then raise exception 'Factual note required';end if;
 if p_request_type='invitation'then
  if p_target_user_id is not null then raise exception 'Invitation cannot target an existing user id';end if;
  if exists(select 1 from auth.users u where lower(u.email)=v_email and u.raw_app_meta_data->>'company_id'=v_company::text)then raise exception 'User already belongs to this company';end if;
 else
  if p_target_user_id is null or p_target_user_id=v_user then raise exception 'A different existing user is required';end if;
  select u.raw_app_meta_data->>'company_id',u.raw_app_meta_data->>'business_role'into v_target_company,v_target_role from auth.users u where u.id=p_target_user_id and lower(u.email)=v_email;
  if v_target_company is distinct from v_company::text then raise exception 'Target is not a verified same-company user';end if;
  if v_target_role=p_requested_role then raise exception 'Target already has this role';end if;
 end if;
 insert into public.team_access_requests(company_id,request_type,target_email,target_user_id,requested_role,expires_at,requested_by,request_id)
 values(v_company,p_request_type,v_email,p_target_user_id,p_requested_role,p_expires_at,v_user,p_request_id)returning id into v_id;
 insert into public.team_access_request_events(company_id,team_access_request_id,event_type,factual_note,actor_user_id,request_id)
 values(v_company,v_id,'prepared',trim(p_note)||' No email sent and no access changed.',v_user,p_request_id||':prepared');return v_id;
end$$;

create or replace function public.revoke_verified_team_access_request(p_team_access_request_id uuid,p_reason text,p_request_id text)returns uuid
language plpgsql security definer set search_path=public as $$
declare v_company uuid:=public.document_intake_company_id();v_user uuid:=auth.uid();v_role text:=public.current_business_role();v_id uuid;
begin
 if v_company is null or v_user is null or v_role not in('super_admin','owner')then raise exception 'Not authorized to manage team access';end if;
 if p_request_id is null or char_length(p_request_id)not between 8 and 200 or p_reason is null or char_length(trim(p_reason))not between 3 and 2000 then raise exception 'Valid reason and request identifier required';end if;
 select e.team_access_request_id into v_id from public.team_access_request_events e where e.company_id=v_company and e.request_id=p_request_id;if v_id is not null then return v_id;end if;
 update public.team_access_requests set status='revoked',updated_at=now()where id=p_team_access_request_id and company_id=v_company and status='pending_confirmation'returning id into v_id;
 if v_id is null then raise exception 'Open team access request not found';end if;
 insert into public.team_access_request_events(company_id,team_access_request_id,event_type,factual_note,actor_user_id,request_id)values(v_company,v_id,'revoked',trim(p_reason)||' No email was sent and no access was changed.',v_user,p_request_id);return v_id;
end$$;
revoke all on function public.list_verified_team_access_requests()from public,anon;
revoke all on function public.prepare_verified_team_access_request(text,text,uuid,text,timestamptz,text,text),public.revoke_verified_team_access_request(uuid,text,text)from public,anon;
grant execute on function public.list_verified_team_access_requests(),public.prepare_verified_team_access_request(text,text,uuid,text,timestamptz,text,text),public.revoke_verified_team_access_request(uuid,text,text)to authenticated;
commit;
