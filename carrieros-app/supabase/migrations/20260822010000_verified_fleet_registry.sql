-- Human-verified fleet registry and assignment equipment gate.
-- Review before applying. This file does not run against an environment by itself.
begin;

create table public.fleet_assets (
  id uuid primary key default gen_random_uuid(), company_id uuid not null,
  asset_type text not null check (asset_type in ('truck','trailer')),
  unit_number text not null check (char_length(unit_number) between 1 and 80),
  vin text not null check (char_length(vin) = 17),
  year integer check (year between 1900 and 2200), make text, model text,
  status text not null default 'active' check (status in ('active','maintenance','out_of_service','retired')),
  annual_inspection_expires_on date not null,
  registration_expires_on date not null,
  is_reefer boolean not null default false,
  created_by uuid not null, verified_by uuid not null, verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (company_id, id), unique (company_id, asset_type, unit_number), unique (company_id, vin)
);

create table public.fleet_asset_events (
  id uuid primary key default gen_random_uuid(), company_id uuid not null,
  asset_id uuid not null, event_type text not null check (event_type in ('created','updated','status_changed')),
  before_state jsonb, after_state jsonb not null, factual_note text,
  actor_user_id uuid not null, request_id text not null, created_at timestamptz not null default now(),
  unique (company_id, id), unique (company_id, request_id),
  constraint fleet_asset_events_asset_company_fk foreign key (company_id, asset_id)
    references public.fleet_assets(company_id, id)
);

create index fleet_assets_company_status_idx on public.fleet_assets(company_id, asset_type, status);
create index fleet_asset_events_company_asset_idx on public.fleet_asset_events(company_id, asset_id, created_at desc);
alter table public.fleet_assets enable row level security;
alter table public.fleet_asset_events enable row level security;
create policy fleet_assets_authorized_select on public.fleet_assets for select using (
  company_id = public.document_intake_company_id()
  and public.current_business_role() in ('super_admin','owner','dispatcher','maintenance','safety')
);
create policy fleet_asset_events_authorized_select on public.fleet_asset_events for select using (
  company_id = public.document_intake_company_id()
  and public.current_business_role() in ('super_admin','owner','maintenance','safety')
);
revoke all privileges on table public.fleet_assets, public.fleet_asset_events from public, anon, authenticated, service_role;
grant select on table public.fleet_assets to authenticated, service_role;
grant select on table public.fleet_asset_events to authenticated, service_role;
grant insert, update on table public.fleet_assets to service_role;
grant insert on table public.fleet_asset_events to service_role;

create or replace function public.list_verified_fleet_assets()
returns setof public.fleet_assets
language sql stable security definer set search_path = public as $$
  select * from public.fleet_assets
  where company_id = public.document_intake_company_id()
    and public.current_business_role() in ('super_admin','owner','dispatcher','maintenance','safety')
  order by asset_type, unit_number
$$;

create or replace function public.save_verified_fleet_asset(
  p_asset_id uuid, p_asset_type text, p_unit_number text, p_vin text,
  p_year integer, p_make text, p_model text, p_status text,
  p_annual_inspection_expires_on date, p_registration_expires_on date,
  p_is_reefer boolean, p_note text, p_request_id text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_company uuid := public.document_intake_company_id(); v_user uuid := auth.uid();
  v_role text := public.current_business_role(); v_asset uuid; v_before jsonb; v_after jsonb; v_old_status text;
begin
  if v_company is null or v_user is null or v_role not in ('super_admin','owner','maintenance','safety') then raise exception 'Not authorized to manage fleet'; end if;
  if p_request_id is null or char_length(p_request_id) not between 8 and 200 then raise exception 'Invalid request identifier'; end if;
  select asset_id into v_asset from public.fleet_asset_events where company_id = v_company and request_id = p_request_id;
  if v_asset is not null then return v_asset; end if;
  if p_asset_type not in ('truck','trailer') or p_status not in ('active','maintenance','out_of_service','retired') then raise exception 'Invalid fleet classification'; end if;
  if p_unit_number is null or char_length(trim(p_unit_number)) not between 1 and 80 then raise exception 'Invalid unit number'; end if;
  if p_vin is null or char_length(upper(trim(p_vin))) <> 17 or upper(trim(p_vin)) !~ '^[A-HJ-NPR-Z0-9]{17}$' then raise exception 'Invalid VIN'; end if;
  if p_year is not null and p_year not between 1900 and extract(year from current_date)::integer + 2 then raise exception 'Invalid model year'; end if;
  if p_annual_inspection_expires_on is null or p_registration_expires_on is null then raise exception 'Verified expiry dates are required'; end if;
  if p_note is not null and char_length(trim(p_note)) not between 1 and 2000 then raise exception 'Invalid factual note'; end if;

  if p_asset_id is null then
    insert into public.fleet_assets(company_id, asset_type, unit_number, vin, year, make, model, status,
      annual_inspection_expires_on, registration_expires_on, is_reefer, created_by, verified_by)
    values (v_company, p_asset_type, trim(p_unit_number), upper(trim(p_vin)), p_year, nullif(trim(p_make), ''),
      nullif(trim(p_model), ''), p_status, p_annual_inspection_expires_on, p_registration_expires_on,
      case when p_asset_type = 'trailer' then coalesce(p_is_reefer, false) else false end, v_user, v_user)
    returning id into v_asset;
    select to_jsonb(a) into v_after from public.fleet_assets a where a.id = v_asset;
    insert into public.fleet_asset_events(company_id, asset_id, event_type, after_state, factual_note, actor_user_id, request_id)
    values (v_company, v_asset, 'created', v_after, nullif(trim(p_note), ''), v_user, p_request_id);
  else
    select to_jsonb(a), a.status into v_before, v_old_status from public.fleet_assets a
    where a.id = p_asset_id and a.company_id = v_company for update;
    if v_before is null then raise exception 'Fleet asset not found or not authorized'; end if;
    update public.fleet_assets set asset_type = p_asset_type, unit_number = trim(p_unit_number), vin = upper(trim(p_vin)),
      year = p_year, make = nullif(trim(p_make), ''), model = nullif(trim(p_model), ''), status = p_status,
      annual_inspection_expires_on = p_annual_inspection_expires_on, registration_expires_on = p_registration_expires_on,
      is_reefer = case when p_asset_type = 'trailer' then coalesce(p_is_reefer, false) else false end,
      verified_by = v_user, verified_at = now(), updated_at = now()
    where id = p_asset_id and company_id = v_company returning id into v_asset;
    select to_jsonb(a) into v_after from public.fleet_assets a where a.id = v_asset;
    insert into public.fleet_asset_events(company_id, asset_id, event_type, before_state, after_state, factual_note, actor_user_id, request_id)
    values (v_company, v_asset, case when v_old_status is distinct from p_status then 'status_changed' else 'updated' end,
      v_before, v_after, nullif(trim(p_note), ''), v_user, p_request_id);
  end if;
  return v_asset;
end
$$;

create or replace function public.enforce_verified_assignment_equipment()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from public.fleet_assets a where a.company_id = new.company_id and a.asset_type = 'truck'
      and a.unit_number = new.truck_unit and a.status = 'active'
      and a.annual_inspection_expires_on >= current_date and a.registration_expires_on >= current_date
  ) then raise exception 'Assignment requires an active verified truck with current inspection and registration'; end if;
  if new.trailer_unit is not null and not exists (
    select 1 from public.fleet_assets a where a.company_id = new.company_id and a.asset_type = 'trailer'
      and a.unit_number = new.trailer_unit and a.status = 'active'
      and a.annual_inspection_expires_on >= current_date and a.registration_expires_on >= current_date
  ) then raise exception 'Assignment requires an active verified trailer with current inspection and registration'; end if;
  return new;
end
$$;
drop trigger if exists load_assignments_verified_equipment on public.load_assignments;
create trigger load_assignments_verified_equipment before insert or update of truck_unit, trailer_unit on public.load_assignments
for each row execute function public.enforce_verified_assignment_equipment();

revoke all on function public.list_verified_fleet_assets() from public, anon;
revoke all on function public.save_verified_fleet_asset(uuid,text,text,text,integer,text,text,text,date,date,boolean,text,text) from public, anon;
revoke all on function public.enforce_verified_assignment_equipment() from public, anon, authenticated;
grant execute on function public.list_verified_fleet_assets() to authenticated;
grant execute on function public.save_verified_fleet_asset(uuid,text,text,text,integer,text,text,text,date,date,boolean,text,text) to authenticated;
commit;
