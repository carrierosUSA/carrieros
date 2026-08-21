-- Human-approved driver rates, load-backed settlements, and confirmed payment history.
-- Review before applying. This file does not run against an environment by itself.
begin;

create table public.driver_pay_rates (
  id uuid primary key default gen_random_uuid(), company_id uuid not null, driver_user_id uuid not null,
  cents_per_mile integer not null check (cents_per_mile between 1 and 1000),
  effective_on date not null, ended_on date check (ended_on is null or ended_on >= effective_on),
  verified_by uuid not null, verified_at timestamptz not null default now(), factual_note text,
  request_id text not null, created_at timestamptz not null default now(),
  unique (company_id, id), unique (company_id, request_id), unique (company_id, driver_user_id, effective_on),
  constraint driver_pay_rates_profile_company_fk foreign key (company_id, driver_user_id)
    references public.driver_profiles(company_id, driver_user_id)
);

create table public.driver_settlements (
  id uuid primary key default gen_random_uuid(), company_id uuid not null, driver_user_id uuid not null,
  period_start date not null, period_end date not null check (period_end >= period_start),
  total_miles integer not null check (total_miles >= 0), mileage_pay_cents bigint not null check (mileage_pay_cents >= 0),
  extras_cents bigint not null default 0 check (extras_cents >= 0), deductions_cents bigint not null default 0 check (deductions_cents >= 0),
  net_pay_cents bigint not null check (net_pay_cents >= 0), status text not null default 'approved' check (status in ('approved','paid')),
  adjustment_note text, approved_by uuid not null, approved_at timestamptz not null default now(),
  paid_by uuid, paid_at timestamptz, payment_reference text,
  approval_request_id text not null, payment_request_id text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (company_id, id), unique (company_id, approval_request_id), unique (company_id, payment_request_id),
  constraint driver_settlements_profile_company_fk foreign key (company_id, driver_user_id)
    references public.driver_profiles(company_id, driver_user_id)
);

create table public.driver_settlement_loads (
  id uuid primary key default gen_random_uuid(), company_id uuid not null, settlement_id uuid not null,
  load_id uuid not null, verified_miles integer not null check (verified_miles > 0),
  cents_per_mile integer not null check (cents_per_mile between 1 and 1000), mileage_pay_cents bigint not null check (mileage_pay_cents > 0),
  created_at timestamptz not null default now(), unique (company_id, id), unique (company_id, load_id),
  constraint settlement_load_settlement_company_fk foreign key (company_id, settlement_id) references public.driver_settlements(company_id, id),
  constraint settlement_load_load_company_fk foreign key (company_id, load_id) references public.loads(company_id, id)
);

create table public.driver_settlement_events (
  id uuid primary key default gen_random_uuid(), company_id uuid not null, settlement_id uuid not null,
  event_type text not null check (event_type in ('approved','paid')), factual_note text,
  actor_user_id uuid not null, request_id text not null, created_at timestamptz not null default now(),
  unique (company_id, id), unique (company_id, request_id),
  constraint settlement_events_settlement_company_fk foreign key (company_id, settlement_id) references public.driver_settlements(company_id, id)
);

create index driver_pay_rates_company_driver_idx on public.driver_pay_rates(company_id, driver_user_id, effective_on desc);
create index driver_settlements_company_period_idx on public.driver_settlements(company_id, period_end desc, driver_user_id);
alter table public.driver_pay_rates enable row level security;
alter table public.driver_settlements enable row level security;
alter table public.driver_settlement_loads enable row level security;
alter table public.driver_settlement_events enable row level security;

create policy driver_pay_rates_finance_select on public.driver_pay_rates for select using (
  company_id = public.document_intake_company_id() and public.current_business_role() in ('super_admin','owner','accounting')
);
create policy driver_settlements_authorized_select on public.driver_settlements for select using (
  company_id = public.document_intake_company_id() and
  (public.current_business_role() in ('super_admin','owner','accounting') or (public.current_business_role()='driver' and driver_user_id=auth.uid()))
);
create policy driver_settlement_loads_authorized_select on public.driver_settlement_loads for select using (
  exists(select 1 from public.driver_settlements s where s.company_id=driver_settlement_loads.company_id and s.id=driver_settlement_loads.settlement_id
    and (public.current_business_role() in ('super_admin','owner','accounting') or (public.current_business_role()='driver' and s.driver_user_id=auth.uid())))
);
create policy driver_settlement_events_authorized_select on public.driver_settlement_events for select using (
  exists(select 1 from public.driver_settlements s where s.company_id=driver_settlement_events.company_id and s.id=driver_settlement_events.settlement_id
    and (public.current_business_role() in ('super_admin','owner','accounting') or (public.current_business_role()='driver' and s.driver_user_id=auth.uid())))
);
revoke all privileges on table public.driver_pay_rates, public.driver_settlements, public.driver_settlement_loads, public.driver_settlement_events from public, anon, authenticated, service_role;
grant select on table public.driver_pay_rates, public.driver_settlements, public.driver_settlement_loads, public.driver_settlement_events to authenticated, service_role;
grant insert on table public.driver_pay_rates, public.driver_settlements, public.driver_settlement_loads, public.driver_settlement_events to service_role;
grant update on table public.driver_settlements to service_role;

create or replace function public.list_verified_driver_pay_rates()
returns table(rate_id uuid, driver_user_id uuid, display_name text, cents_per_mile integer, effective_on date, ended_on date, verified_at timestamptz)
language sql stable security definer set search_path=public as $$
  select r.id,r.driver_user_id,coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'),''),'Verified driver'),r.cents_per_mile,r.effective_on,r.ended_on,r.verified_at
  from public.driver_pay_rates r join auth.users u on u.id=r.driver_user_id
  where r.company_id=public.document_intake_company_id() and public.current_business_role() in ('super_admin','owner','accounting')
  order by 3,r.effective_on desc
$$;

create or replace function public.list_unsettled_payroll_loads()
returns table(load_id uuid, load_number text, driver_user_id uuid, display_name text, verified_miles integer, cents_per_mile integer, mileage_pay_cents bigint, closed_at timestamptz)
language sql stable security definer set search_path=public as $$
  select l.id,l.load_number,a.driver_user_id,coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'),''),'Verified driver'),l.miles,r.cents_per_mile,(l.miles::bigint*r.cents_per_mile),l.updated_at
  from public.loads l
  join lateral (select x.driver_user_id from public.load_assignments x where x.company_id=l.company_id and x.load_id=l.id order by x.approved_at desc limit 1) a on true
  join auth.users u on u.id=a.driver_user_id
  join lateral (select x.cents_per_mile from public.driver_pay_rates x where x.company_id=l.company_id and x.driver_user_id=a.driver_user_id
    and x.effective_on<=l.updated_at::date and (x.ended_on is null or x.ended_on>=l.updated_at::date) order by x.effective_on desc limit 1) r on true
  where l.company_id=public.document_intake_company_id() and public.current_business_role() in ('super_admin','owner','accounting')
    and l.status='closed' and l.miles>0 and not exists(select 1 from public.driver_settlement_loads sl where sl.company_id=l.company_id and sl.load_id=l.id)
  order by l.updated_at,l.load_number
$$;

create or replace function public.list_verified_driver_settlements()
returns table(settlement_id uuid, driver_user_id uuid, display_name text, period_start date, period_end date, total_miles integer, mileage_pay_cents bigint, extras_cents bigint, deductions_cents bigint, net_pay_cents bigint, status text, approved_at timestamptz, paid_at timestamptz, payment_reference text, load_count bigint)
language sql stable security definer set search_path=public as $$
  select s.id,s.driver_user_id,coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'),''),'Verified driver'),s.period_start,s.period_end,s.total_miles,s.mileage_pay_cents,s.extras_cents,s.deductions_cents,s.net_pay_cents,s.status,s.approved_at,s.paid_at,s.payment_reference,count(sl.id)
  from public.driver_settlements s join auth.users u on u.id=s.driver_user_id left join public.driver_settlement_loads sl on sl.company_id=s.company_id and sl.settlement_id=s.id
  where s.company_id=public.document_intake_company_id() and (public.current_business_role() in ('super_admin','owner','accounting') or (public.current_business_role()='driver' and s.driver_user_id=auth.uid()))
  group by s.id,u.id order by s.period_end desc,s.approved_at desc
$$;

create or replace function public.save_verified_driver_pay_rate(p_driver_user_id uuid,p_cents_per_mile integer,p_effective_on date,p_note text,p_request_id text) returns uuid
language plpgsql security definer set search_path=public as $$
declare v_company uuid:=public.document_intake_company_id();v_user uuid:=auth.uid();v_role text:=public.current_business_role();v_id uuid;
begin
  if v_company is null or v_user is null or v_role not in ('super_admin','owner','accounting') then raise exception 'Not authorized to manage driver pay rates';end if;
  if p_cents_per_mile not between 1 and 1000 or p_effective_on is null then raise exception 'Invalid verified mileage rate';end if;
  if p_request_id is null or char_length(p_request_id) not between 8 and 200 then raise exception 'Invalid request identifier';end if;
  if p_note is not null and char_length(trim(p_note)) not between 1 and 2000 then raise exception 'Invalid factual note';end if;
  select id into v_id from public.driver_pay_rates where company_id=v_company and request_id=p_request_id;if v_id is not null then return v_id;end if;
  if not exists(select 1 from public.driver_profiles p where p.company_id=v_company and p.driver_user_id=p_driver_user_id) then raise exception 'Verified same-company driver profile required';end if;
  if exists(select 1 from public.driver_pay_rates r where r.company_id=v_company and r.driver_user_id=p_driver_user_id and r.effective_on=p_effective_on) then raise exception 'A rate already exists for this effective date';end if;
  update public.driver_pay_rates set ended_on=p_effective_on-1 where company_id=v_company and driver_user_id=p_driver_user_id and ended_on is null and effective_on<p_effective_on;
  insert into public.driver_pay_rates(company_id,driver_user_id,cents_per_mile,effective_on,verified_by,factual_note,request_id)
  values(v_company,p_driver_user_id,p_cents_per_mile,p_effective_on,v_user,nullif(trim(p_note),''),p_request_id) returning id into v_id;return v_id;
end $$;

create or replace function public.approve_verified_driver_settlement(p_driver_user_id uuid,p_period_start date,p_period_end date,p_load_ids uuid[],p_extras_cents bigint,p_deductions_cents bigint,p_adjustment_note text,p_request_id text) returns uuid
language plpgsql security definer set search_path=public as $$
declare v_company uuid:=public.document_intake_company_id();v_user uuid:=auth.uid();v_role text:=public.current_business_role();v_id uuid;v_requested integer;v_found integer;v_miles integer;v_pay bigint;
begin
  if v_company is null or v_user is null or v_role not in ('super_admin','owner','accounting') then raise exception 'Not authorized to approve payroll';end if;
  if p_period_start is null or p_period_end is null or p_period_end<p_period_start or p_period_end-p_period_start>62 then raise exception 'Invalid payroll period';end if;
  if p_load_ids is null or cardinality(p_load_ids)<1 or cardinality(p_load_ids)>100 then raise exception 'Select verified closed loads';end if;
  if (select count(distinct x) from unnest(p_load_ids)x)<>cardinality(p_load_ids) then raise exception 'Duplicate load selection';end if;
  if coalesce(p_extras_cents,0)<0 or coalesce(p_deductions_cents,0)<0 then raise exception 'Invalid payroll adjustment';end if;
  if (coalesce(p_extras_cents,0)>0 or coalesce(p_deductions_cents,0)>0) and (p_adjustment_note is null or char_length(trim(p_adjustment_note)) not between 1 and 2000) then raise exception 'Factual adjustment note required';end if;
  if p_request_id is null or char_length(p_request_id) not between 8 and 200 then raise exception 'Invalid request identifier';end if;
  select id into v_id from public.driver_settlements where company_id=v_company and approval_request_id=p_request_id;if v_id is not null then return v_id;end if;
  v_requested:=cardinality(p_load_ids);
  select count(*),sum(l.miles),sum(l.miles::bigint*r.cents_per_mile) into v_found,v_miles,v_pay
  from public.loads l join lateral(select a.driver_user_id from public.load_assignments a where a.company_id=l.company_id and a.load_id=l.id order by a.approved_at desc limit 1)a on true
  join lateral(select x.cents_per_mile from public.driver_pay_rates x where x.company_id=l.company_id and x.driver_user_id=a.driver_user_id and x.effective_on<=l.updated_at::date and (x.ended_on is null or x.ended_on>=l.updated_at::date) order by x.effective_on desc limit 1)r on true
  where l.company_id=v_company and l.id=any(p_load_ids) and l.status='closed' and l.miles>0 and a.driver_user_id=p_driver_user_id
    and l.updated_at::date between p_period_start and p_period_end and not exists(select 1 from public.driver_settlement_loads sl where sl.company_id=v_company and sl.load_id=l.id);
  if v_found<>v_requested then raise exception 'Every selected load must be closed, assigned to this driver, in period, rated, and unsettled';end if;
  if v_pay+coalesce(p_extras_cents,0)-coalesce(p_deductions_cents,0)<0 then raise exception 'Deductions exceed verified pay';end if;
  insert into public.driver_settlements(company_id,driver_user_id,period_start,period_end,total_miles,mileage_pay_cents,extras_cents,deductions_cents,net_pay_cents,adjustment_note,approved_by,approval_request_id)
  values(v_company,p_driver_user_id,p_period_start,p_period_end,v_miles,v_pay,coalesce(p_extras_cents,0),coalesce(p_deductions_cents,0),v_pay+coalesce(p_extras_cents,0)-coalesce(p_deductions_cents,0),nullif(trim(p_adjustment_note),''),v_user,p_request_id) returning id into v_id;
  insert into public.driver_settlement_loads(company_id,settlement_id,load_id,verified_miles,cents_per_mile,mileage_pay_cents)
  select v_company,v_id,l.id,l.miles,r.cents_per_mile,l.miles::bigint*r.cents_per_mile from public.loads l
  join lateral(select a.driver_user_id from public.load_assignments a where a.company_id=l.company_id and a.load_id=l.id order by a.approved_at desc limit 1)a on true
  join lateral(select x.cents_per_mile from public.driver_pay_rates x where x.company_id=l.company_id and x.driver_user_id=a.driver_user_id and x.effective_on<=l.updated_at::date and (x.ended_on is null or x.ended_on>=l.updated_at::date) order by x.effective_on desc limit 1)r on true where l.company_id=v_company and l.id=any(p_load_ids);
  insert into public.driver_settlement_events(company_id,settlement_id,event_type,factual_note,actor_user_id,request_id) values(v_company,v_id,'approved','Authenticated human approved load-backed driver settlement.',v_user,p_request_id);return v_id;
end $$;

create or replace function public.record_verified_driver_settlement_payment(p_settlement_id uuid,p_paid_at timestamptz,p_payment_reference text,p_request_id text) returns uuid
language plpgsql security definer set search_path=public as $$
declare v_company uuid:=public.document_intake_company_id();v_user uuid:=auth.uid();v_role text:=public.current_business_role();v_status text;v_existing uuid;
begin
  if v_company is null or v_user is null or v_role not in ('super_admin','owner','accounting') then raise exception 'Not authorized to record payroll payments';end if;
  if p_paid_at is null or p_paid_at>now()+interval '1 day' or p_payment_reference is null or char_length(trim(p_payment_reference)) not between 1 and 200 then raise exception 'Valid confirmed payment details required';end if;
  if p_request_id is null or char_length(p_request_id) not between 8 and 200 then raise exception 'Invalid request identifier';end if;
  select settlement_id into v_existing from public.driver_settlement_events where company_id=v_company and request_id=p_request_id;if v_existing is not null then return v_existing;end if;
  select status into v_status from public.driver_settlements where company_id=v_company and id=p_settlement_id for update;
  if v_status is null then raise exception 'Settlement not found';end if;if v_status<>'approved' then raise exception 'Settlement is already paid';end if;
  update public.driver_settlements set status='paid',paid_by=v_user,paid_at=p_paid_at,payment_reference=trim(p_payment_reference),payment_request_id=p_request_id,updated_at=now() where company_id=v_company and id=p_settlement_id;
  insert into public.driver_settlement_events(company_id,settlement_id,event_type,factual_note,actor_user_id,request_id) values(v_company,p_settlement_id,'paid','Authenticated human recorded confirmed payroll payment reference.',v_user,p_request_id);return p_settlement_id;
end $$;

revoke all on function public.list_verified_driver_pay_rates() from public,anon;
revoke all on function public.list_unsettled_payroll_loads() from public,anon;
revoke all on function public.list_verified_driver_settlements() from public,anon;
revoke all on function public.save_verified_driver_pay_rate(uuid,integer,date,text,text) from public,anon;
revoke all on function public.approve_verified_driver_settlement(uuid,date,date,uuid[],bigint,bigint,text,text) from public,anon;
revoke all on function public.record_verified_driver_settlement_payment(uuid,timestamptz,text,text) from public,anon;
grant execute on function public.list_verified_driver_pay_rates(),public.list_unsettled_payroll_loads(),public.list_verified_driver_settlements() to authenticated;
grant execute on function public.save_verified_driver_pay_rate(uuid,integer,date,text,text),public.approve_verified_driver_settlement(uuid,date,date,uuid[],bigint,bigint,text,text),public.record_verified_driver_settlement_payment(uuid,timestamptz,text,text) to authenticated;
commit;
