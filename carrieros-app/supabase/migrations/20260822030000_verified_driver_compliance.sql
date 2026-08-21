-- Human-verified driver compliance profiles and assignment gate.
-- Review before applying. This file does not run against an environment by itself.
begin;

create table public.driver_profiles (
  id uuid primary key default gen_random_uuid(), company_id uuid not null,
  driver_user_id uuid not null, cdl_state text not null check (char_length(cdl_state) = 2),
  cdl_last_four text not null check (cdl_last_four ~ '^[0-9A-Z]{4}$'),
  cdl_expires_on date not null, medical_card_expires_on date not null,
  hired_on date, status text not null default 'active'
    check (status in ('active','leave','suspended','terminated')),
  created_by uuid not null, verified_by uuid not null, verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (company_id, id), unique (company_id, driver_user_id)
);

create table public.driver_profile_events (
  id uuid primary key default gen_random_uuid(), company_id uuid not null,
  driver_profile_id uuid not null,
  event_type text not null check (event_type in ('created','updated','status_changed')),
  before_state jsonb, after_state jsonb not null, factual_note text,
  actor_user_id uuid not null, request_id text not null, created_at timestamptz not null default now(),
  unique (company_id, id), unique (company_id, request_id),
  constraint driver_profile_events_profile_company_fk foreign key (company_id, driver_profile_id)
    references public.driver_profiles(company_id, id)
);

create index driver_profiles_company_status_idx on public.driver_profiles(company_id, status, cdl_expires_on, medical_card_expires_on);
alter table public.driver_profiles enable row level security;
alter table public.driver_profile_events enable row level security;
create policy driver_profiles_authorized_select on public.driver_profiles for select using (
  company_id = public.document_intake_company_id()
  and (public.current_business_role() in ('super_admin','owner','dispatcher','safety') or driver_user_id = auth.uid())
);
create policy driver_profile_events_authorized_select on public.driver_profile_events for select using (
  company_id = public.document_intake_company_id()
  and public.current_business_role() in ('super_admin','owner','safety')
);
revoke all privileges on table public.driver_profiles, public.driver_profile_events from public, anon, authenticated, service_role;
grant select on table public.driver_profiles, public.driver_profile_events to authenticated, service_role;
grant insert, update on table public.driver_profiles to service_role;
grant insert on table public.driver_profile_events to service_role;

create or replace function public.list_verified_driver_profiles()
returns table(
  profile_id uuid, driver_user_id uuid, display_name text, cdl_state text, cdl_last_four text,
  cdl_expires_on date, medical_card_expires_on date, hired_on date, status text, verified_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select p.id, p.driver_user_id,
    coalesce(nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(concat_ws(' ', u.raw_user_meta_data ->> 'first_name', u.raw_user_meta_data ->> 'last_name')), ''), 'Verified driver'),
    p.cdl_state, p.cdl_last_four, p.cdl_expires_on, p.medical_card_expires_on,
    p.hired_on, p.status, p.verified_at
  from public.driver_profiles p join auth.users u on u.id = p.driver_user_id
  where p.company_id = public.document_intake_company_id()
    and public.current_business_role() in ('super_admin','owner','dispatcher','safety')
    and u.raw_app_meta_data ->> 'company_id' = p.company_id::text
    and u.raw_app_meta_data ->> 'business_role' = 'driver'
  order by display_name, p.driver_user_id
$$;

create or replace function public.save_verified_driver_profile(
  p_profile_id uuid, p_driver_user_id uuid, p_cdl_state text, p_cdl_last_four text,
  p_cdl_expires_on date, p_medical_card_expires_on date, p_hired_on date,
  p_status text, p_note text, p_request_id text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_company uuid := public.document_intake_company_id(); v_user uuid := auth.uid();
  v_role text := public.current_business_role(); v_profile uuid; v_before jsonb; v_after jsonb; v_old_status text;
begin
  if v_company is null or v_user is null or v_role not in ('super_admin','owner','safety') then raise exception 'Not authorized to manage driver compliance'; end if;
  if p_request_id is null or char_length(p_request_id) not between 8 and 200 then raise exception 'Invalid request identifier'; end if;
  select driver_profile_id into v_profile from public.driver_profile_events where company_id = v_company and request_id = p_request_id;
  if v_profile is not null then return v_profile; end if;
  if not exists (select 1 from auth.users u where u.id = p_driver_user_id and u.raw_app_meta_data ->> 'company_id' = v_company::text and u.raw_app_meta_data ->> 'business_role' = 'driver') then raise exception 'Verified same-company driver account is required'; end if;
  if p_cdl_state is null or upper(trim(p_cdl_state)) !~ '^[A-Z]{2}$' then raise exception 'Invalid CDL state'; end if;
  if p_cdl_last_four is null or upper(trim(p_cdl_last_four)) !~ '^[0-9A-Z]{4}$' then raise exception 'Invalid CDL last four'; end if;
  if p_cdl_expires_on is null or p_medical_card_expires_on is null then raise exception 'Verified compliance dates are required'; end if;
  if p_status not in ('active','leave','suspended','terminated') then raise exception 'Invalid driver status'; end if;
  if p_note is not null and char_length(trim(p_note)) not between 1 and 2000 then raise exception 'Invalid factual note'; end if;

  if p_profile_id is null then
    insert into public.driver_profiles(company_id, driver_user_id, cdl_state, cdl_last_four, cdl_expires_on,
      medical_card_expires_on, hired_on, status, created_by, verified_by)
    values (v_company, p_driver_user_id, upper(trim(p_cdl_state)), upper(trim(p_cdl_last_four)), p_cdl_expires_on,
      p_medical_card_expires_on, p_hired_on, p_status, v_user, v_user) returning id into v_profile;
    select to_jsonb(p) into v_after from public.driver_profiles p where p.id = v_profile;
    insert into public.driver_profile_events(company_id, driver_profile_id, event_type, after_state, factual_note, actor_user_id, request_id)
    values (v_company, v_profile, 'created', v_after, nullif(trim(p_note), ''), v_user, p_request_id);
  else
    select to_jsonb(p), p.status into v_before, v_old_status from public.driver_profiles p
    where p.id = p_profile_id and p.company_id = v_company for update;
    if v_before is null then raise exception 'Driver profile not found or not authorized'; end if;
    update public.driver_profiles set driver_user_id = p_driver_user_id, cdl_state = upper(trim(p_cdl_state)),
      cdl_last_four = upper(trim(p_cdl_last_four)), cdl_expires_on = p_cdl_expires_on,
      medical_card_expires_on = p_medical_card_expires_on, hired_on = p_hired_on, status = p_status,
      verified_by = v_user, verified_at = now(), updated_at = now()
    where id = p_profile_id and company_id = v_company returning id into v_profile;
    select to_jsonb(p) into v_after from public.driver_profiles p where p.id = v_profile;
    insert into public.driver_profile_events(company_id, driver_profile_id, event_type, before_state, after_state, factual_note, actor_user_id, request_id)
    values (v_company, v_profile, case when v_old_status is distinct from p_status then 'status_changed' else 'updated' end,
      v_before, v_after, nullif(trim(p_note), ''), v_user, p_request_id);
  end if;
  return v_profile;
end
$$;

create or replace function public.list_unprofiled_company_drivers()
returns table(user_id uuid, display_name text)
language sql stable security definer set search_path = public as $$
  select u.id, coalesce(nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(concat_ws(' ', u.raw_user_meta_data ->> 'first_name', u.raw_user_meta_data ->> 'last_name')), ''), 'Verified driver')
  from auth.users u
  where public.current_business_role() in ('super_admin','owner','safety')
    and u.raw_app_meta_data ->> 'company_id' = public.document_intake_company_id()::text
    and u.raw_app_meta_data ->> 'business_role' = 'driver'
    and not exists (select 1 from public.driver_profiles p where p.company_id = public.document_intake_company_id() and p.driver_user_id = u.id)
  order by 2, 1
$$;

create or replace function public.list_assignable_company_drivers()
returns table(user_id uuid, display_name text)
language sql stable security definer set search_path = public as $$
  select u.id, coalesce(nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(concat_ws(' ', u.raw_user_meta_data ->> 'first_name', u.raw_user_meta_data ->> 'last_name')), ''), 'Verified driver')
  from auth.users u join public.driver_profiles p on p.driver_user_id = u.id
  where public.current_business_role() in ('super_admin','owner','dispatcher')
    and p.company_id = public.document_intake_company_id()
    and u.raw_app_meta_data ->> 'company_id' = p.company_id::text
    and u.raw_app_meta_data ->> 'business_role' = 'driver'
    and p.status = 'active' and p.cdl_expires_on >= current_date and p.medical_card_expires_on >= current_date
  order by 2, 1
$$;

create or replace function public.enforce_verified_assignment_driver()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from public.driver_profiles p join auth.users u on u.id = p.driver_user_id
    where p.company_id = new.company_id and p.driver_user_id = new.driver_user_id
      and p.status = 'active' and p.cdl_expires_on >= current_date and p.medical_card_expires_on >= current_date
      and u.raw_app_meta_data ->> 'company_id' = new.company_id::text
      and u.raw_app_meta_data ->> 'business_role' = 'driver'
  ) then raise exception 'Assignment requires an active verified same-company driver with current CDL and medical card'; end if;
  return new;
end
$$;
drop trigger if exists load_assignments_verified_driver on public.load_assignments;
create trigger load_assignments_verified_driver before insert or update of driver_user_id on public.load_assignments
for each row execute function public.enforce_verified_assignment_driver();

revoke all on function public.list_verified_driver_profiles() from public, anon;
revoke all on function public.list_unprofiled_company_drivers() from public, anon;
revoke all on function public.save_verified_driver_profile(uuid,uuid,text,text,date,date,date,text,text,text) from public, anon;
revoke all on function public.enforce_verified_assignment_driver() from public, anon, authenticated;
grant execute on function public.list_verified_driver_profiles() to authenticated;
grant execute on function public.list_unprofiled_company_drivers() to authenticated;
grant execute on function public.save_verified_driver_profile(uuid,uuid,text,text,date,date,date,text,text,text) to authenticated;
commit;
