-- Human-verified maintenance work orders and critical-defect assignment gate.
-- Review before applying. This file does not run against an environment by itself.
begin;

create table public.maintenance_work_orders (
  id uuid primary key default gen_random_uuid(), company_id uuid not null, asset_id uuid not null,
  category text not null check (category in ('preventive','repair','inspection','defect')),
  severity text not null check (severity in ('routine','urgent','critical')),
  status text not null default 'open' check (status in ('open','in_progress','completed','cancelled')),
  title text not null check (char_length(title) between 1 and 200),
  description text not null check (char_length(description) between 1 and 4000),
  reported_odometer integer check (reported_odometer is null or reported_odometer >= 0),
  opened_at timestamptz not null, due_on date, completed_at timestamptz,
  completion_note text check (completion_note is null or char_length(completion_note) between 1 and 4000),
  service_provider text, next_service_due_on date,
  next_service_due_odometer integer check (next_service_due_odometer is null or next_service_due_odometer >= 0),
  created_by uuid not null, updated_by uuid not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (company_id, id),
  constraint maintenance_asset_company_fk foreign key (company_id, asset_id)
    references public.fleet_assets(company_id, id)
);
create table public.maintenance_work_order_events (
  id uuid primary key default gen_random_uuid(), company_id uuid not null, work_order_id uuid not null,
  event_type text not null check (event_type in ('created','updated','status_changed','completed')),
  before_state jsonb, after_state jsonb not null, factual_note text,
  actor_user_id uuid not null, request_id text not null, created_at timestamptz not null default now(),
  unique (company_id, id), unique (company_id, request_id),
  constraint maintenance_events_order_company_fk foreign key (company_id, work_order_id)
    references public.maintenance_work_orders(company_id, id)
);
create index maintenance_company_status_idx on public.maintenance_work_orders(company_id, status, severity, due_on);
alter table public.maintenance_work_orders enable row level security;
alter table public.maintenance_work_order_events enable row level security;
create policy maintenance_orders_authorized_select on public.maintenance_work_orders for select using (
  company_id = public.document_intake_company_id()
  and public.current_business_role() in ('super_admin','owner','dispatcher','maintenance','safety')
);
create policy maintenance_events_authorized_select on public.maintenance_work_order_events for select using (
  company_id = public.document_intake_company_id()
  and public.current_business_role() in ('super_admin','owner','maintenance','safety')
);
revoke all privileges on table public.maintenance_work_orders, public.maintenance_work_order_events from public, anon, authenticated, service_role;
grant select on table public.maintenance_work_orders, public.maintenance_work_order_events to authenticated, service_role;
grant insert, update on table public.maintenance_work_orders to service_role;
grant insert on table public.maintenance_work_order_events to service_role;

create or replace function public.list_verified_maintenance_orders()
returns table(order_id uuid, asset_id uuid, asset_type text, unit_number text, category text, severity text,
  status text, title text, description text, reported_odometer integer, opened_at timestamptz, due_on date,
  completed_at timestamptz, completion_note text, service_provider text, next_service_due_on date,
  next_service_due_odometer integer, updated_at timestamptz)
language sql stable security definer set search_path = public as $$
  select w.id, w.asset_id, a.asset_type, a.unit_number, w.category, w.severity, w.status,
    w.title, w.description, w.reported_odometer, w.opened_at, w.due_on, w.completed_at,
    w.completion_note, w.service_provider, w.next_service_due_on, w.next_service_due_odometer, w.updated_at
  from public.maintenance_work_orders w join public.fleet_assets a on a.company_id=w.company_id and a.id=w.asset_id
  where w.company_id=public.document_intake_company_id()
    and public.current_business_role() in ('super_admin','owner','dispatcher','maintenance','safety')
  order by case when w.status in ('open','in_progress') then 0 else 1 end,
    case w.severity when 'critical' then 0 when 'urgent' then 1 else 2 end, w.due_on nulls last, w.updated_at desc
$$;

create or replace function public.save_verified_maintenance_order(
  p_order_id uuid, p_asset_id uuid, p_category text, p_severity text, p_status text,
  p_title text, p_description text, p_reported_odometer integer, p_opened_at timestamptz,
  p_due_on date, p_completion_note text, p_service_provider text,
  p_next_service_due_on date, p_next_service_due_odometer integer, p_request_id text
) returns uuid
language plpgsql security definer set search_path=public as $$
declare
  v_company uuid:=public.document_intake_company_id();v_user uuid:=auth.uid();v_role text:=public.current_business_role();
  v_order uuid;v_before jsonb;v_after jsonb;v_old_status text;v_completed_at timestamptz;
begin
  if v_company is null or v_user is null or v_role not in ('super_admin','owner','maintenance','safety') then raise exception 'Not authorized to manage maintenance';end if;
  if p_request_id is null or char_length(p_request_id) not between 8 and 200 then raise exception 'Invalid request identifier';end if;
  select work_order_id into v_order from public.maintenance_work_order_events where company_id=v_company and request_id=p_request_id;
  if v_order is not null then return v_order;end if;
  if not exists(select 1 from public.fleet_assets where company_id=v_company and id=p_asset_id) then raise exception 'Verified fleet asset is required';end if;
  if p_category not in ('preventive','repair','inspection','defect') or p_severity not in ('routine','urgent','critical') or p_status not in ('open','in_progress','completed','cancelled') then raise exception 'Invalid maintenance classification';end if;
  if p_title is null or char_length(trim(p_title)) not between 1 and 200 or p_description is null or char_length(trim(p_description)) not between 1 and 4000 then raise exception 'Factual maintenance details are required';end if;
  if p_opened_at is null or p_opened_at>now()+interval '1 day' then raise exception 'Invalid opened date';end if;
  if p_reported_odometer is not null and p_reported_odometer<0 then raise exception 'Invalid odometer';end if;
  if p_status='completed' and (p_completion_note is null or char_length(trim(p_completion_note)) not between 1 and 4000) then raise exception 'Factual completion note is required';end if;
  if p_status<>'completed' and p_completion_note is not null then raise exception 'Completion note requires completed status';end if;
  v_completed_at:=case when p_status='completed' then now() else null end;
  if p_order_id is null then
    insert into public.maintenance_work_orders(company_id,asset_id,category,severity,status,title,description,reported_odometer,opened_at,due_on,completed_at,completion_note,service_provider,next_service_due_on,next_service_due_odometer,created_by,updated_by)
    values(v_company,p_asset_id,p_category,p_severity,p_status,trim(p_title),trim(p_description),p_reported_odometer,p_opened_at,p_due_on,v_completed_at,nullif(trim(p_completion_note),''),nullif(trim(p_service_provider),''),p_next_service_due_on,p_next_service_due_odometer,v_user,v_user)returning id into v_order;
    select to_jsonb(w) into v_after from public.maintenance_work_orders w where w.id=v_order;
    insert into public.maintenance_work_order_events(company_id,work_order_id,event_type,after_state,factual_note,actor_user_id,request_id)
    values(v_company,v_order,case when p_status='completed' then 'completed' else 'created' end,v_after,nullif(trim(p_completion_note),''),v_user,p_request_id);
  else
    select to_jsonb(w),w.status into v_before,v_old_status from public.maintenance_work_orders w where w.id=p_order_id and w.company_id=v_company for update;
    if v_before is null then raise exception 'Work order not found or not authorized';end if;
    if v_old_status in ('completed','cancelled') then raise exception 'Completed or cancelled work orders are immutable';end if;
    update public.maintenance_work_orders set asset_id=p_asset_id,category=p_category,severity=p_severity,status=p_status,title=trim(p_title),description=trim(p_description),reported_odometer=p_reported_odometer,opened_at=p_opened_at,due_on=p_due_on,completed_at=v_completed_at,completion_note=nullif(trim(p_completion_note),''),service_provider=nullif(trim(p_service_provider),''),next_service_due_on=p_next_service_due_on,next_service_due_odometer=p_next_service_due_odometer,updated_by=v_user,updated_at=now() where id=p_order_id and company_id=v_company returning id into v_order;
    select to_jsonb(w) into v_after from public.maintenance_work_orders w where w.id=v_order;
    insert into public.maintenance_work_order_events(company_id,work_order_id,event_type,before_state,after_state,factual_note,actor_user_id,request_id)
    values(v_company,v_order,case when p_status='completed' then 'completed' when v_old_status is distinct from p_status then 'status_changed' else 'updated' end,v_before,v_after,nullif(trim(p_completion_note),''),v_user,p_request_id);
  end if;
  return v_order;
end
$$;

create or replace function public.enforce_no_open_critical_maintenance()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_truck uuid;v_trailer uuid;
begin
  select id into v_truck from public.fleet_assets where company_id=new.company_id and asset_type='truck' and unit_number=new.truck_unit;
  select id into v_trailer from public.fleet_assets where company_id=new.company_id and asset_type='trailer' and unit_number=new.trailer_unit;
  if exists(select 1 from public.maintenance_work_orders w where w.company_id=new.company_id and w.asset_id in (v_truck,v_trailer) and w.severity='critical' and w.status in ('open','in_progress')) then raise exception 'Assignment blocked by open critical maintenance work order';end if;
  return new;
end
$$;
drop trigger if exists load_assignments_no_critical_maintenance on public.load_assignments;
create trigger load_assignments_no_critical_maintenance before insert or update of truck_unit,trailer_unit on public.load_assignments for each row execute function public.enforce_no_open_critical_maintenance();

revoke all on function public.list_verified_maintenance_orders() from public,anon;
revoke all on function public.save_verified_maintenance_order(uuid,uuid,text,text,text,text,text,integer,timestamptz,date,text,text,date,integer,text) from public,anon;
revoke all on function public.enforce_no_open_critical_maintenance() from public,anon,authenticated;
grant execute on function public.list_verified_maintenance_orders() to authenticated;
grant execute on function public.save_verified_maintenance_order(uuid,uuid,text,text,text,text,text,integer,timestamptz,date,text,text,date,integer,text) to authenticated;
commit;
