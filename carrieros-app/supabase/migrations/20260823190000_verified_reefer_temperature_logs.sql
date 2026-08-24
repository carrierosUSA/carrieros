-- Immutable human-recorded reefer readings. These facts do not certify cargo condition or determine claim liability.
begin;
create table public.reefer_temperature_logs(
 id uuid primary key default gen_random_uuid(),company_id uuid not null,load_id uuid not null,asset_id uuid not null,
 recorded_at timestamptz not null,setpoint_f numeric(6,2)not null check(setpoint_f between -100 and 150),
 supply_air_f numeric(6,2)check(supply_air_f between -100 and 150),return_air_f numeric(6,2)check(return_air_f between -100 and 150),
 source text not null check(source in('manual_display','telematics_export','driver_report','service_report')),
 factual_note text not null check(char_length(factual_note)between 3 and 2000),recorded_by uuid not null,request_id text not null,created_at timestamptz not null default now(),
 unique(company_id,id),unique(company_id,request_id),check(supply_air_f is not null or return_air_f is not null),
 constraint reefer_log_load_fk foreign key(company_id,load_id)references public.loads(company_id,id),
 constraint reefer_log_asset_fk foreign key(company_id,asset_id)references public.fleet_assets(company_id,id)
);
create index reefer_logs_company_load_time_idx on public.reefer_temperature_logs(company_id,load_id,recorded_at desc);
alter table public.reefer_temperature_logs enable row level security;
create policy reefer_logs_authorized_select on public.reefer_temperature_logs for select using(
 company_id=public.document_intake_company_id()and(
  public.current_business_role()in('super_admin','owner','dispatcher','safety','read_only')or
  (public.current_business_role()='driver'and exists(select 1 from public.load_assignments a where a.company_id=reefer_temperature_logs.company_id and a.load_id=reefer_temperature_logs.load_id and a.driver_user_id=auth.uid()and a.ended_at is null))
 ));
revoke all privileges on table public.reefer_temperature_logs from public,anon,authenticated,service_role;
grant select on table public.reefer_temperature_logs to authenticated,service_role;grant insert on table public.reefer_temperature_logs to service_role;

create or replace function public.list_verified_reefer_assignments()
returns table(load_id uuid,load_number text,load_status text,asset_id uuid,trailer_unit text,driver_user_id uuid)
language sql stable security definer set search_path=public as $$
 select l.id,l.load_number,l.status,f.id,a.trailer_unit,a.driver_user_id
 from public.loads l join public.load_assignments a on a.company_id=l.company_id and a.load_id=l.id and a.ended_at is null
 join public.fleet_assets f on f.company_id=l.company_id and f.asset_type='trailer'and f.is_reefer is true and f.status='active'and f.unit_number=a.trailer_unit
 where l.company_id=public.document_intake_company_id()and l.status not in('closed','cancelled')and(
  public.current_business_role()in('super_admin','owner','dispatcher','safety','read_only')or(public.current_business_role()='driver'and a.driver_user_id=auth.uid()))
 order by l.updated_at desc,l.id
$$;
create or replace function public.list_verified_reefer_temperature_logs()
returns table(log_id uuid,load_id uuid,load_number text,asset_id uuid,trailer_unit text,recorded_at timestamptz,setpoint_f numeric,supply_air_f numeric,return_air_f numeric,source text,factual_note text,recorded_by uuid,created_at timestamptz)
language sql stable security definer set search_path=public as $$
 select t.id,t.load_id,l.load_number,t.asset_id,f.unit_number,t.recorded_at,t.setpoint_f,t.supply_air_f,t.return_air_f,t.source,t.factual_note,t.recorded_by,t.created_at
 from public.reefer_temperature_logs t join public.loads l on l.company_id=t.company_id and l.id=t.load_id join public.fleet_assets f on f.company_id=t.company_id and f.id=t.asset_id
 where t.company_id=public.document_intake_company_id()and(
  public.current_business_role()in('super_admin','owner','dispatcher','safety','read_only')or(public.current_business_role()='driver'and exists(select 1 from public.load_assignments a where a.company_id=t.company_id and a.load_id=t.load_id and a.driver_user_id=auth.uid())))
 order by t.recorded_at desc,t.id desc limit 1000
$$;
create or replace function public.record_verified_reefer_temperature(p_load_id uuid,p_asset_id uuid,p_recorded_at timestamptz,p_setpoint_f numeric,p_supply_air_f numeric,p_return_air_f numeric,p_source text,p_note text,p_request_id text)returns uuid
language plpgsql security definer set search_path=public as $$
declare c uuid:=public.document_intake_company_id();u uuid:=auth.uid();r text:=public.current_business_role();v uuid;
begin
 if c is null or u is null or r not in('super_admin','owner','dispatcher','safety','driver')then raise exception'Not authorized';end if;
 if p_request_id is null or char_length(p_request_id)not between 8 and 200 then raise exception'Invalid request identifier';end if;
 select id into v from public.reefer_temperature_logs where company_id=c and request_id=p_request_id;if v is not null then return v;end if;
 if p_recorded_at is null or p_recorded_at>now()+interval'5 minutes'or p_recorded_at<now()-interval'366 days'then raise exception'Invalid recorded time';end if;
 if p_setpoint_f is null or p_setpoint_f not between -100 and 150 or(p_supply_air_f is null and p_return_air_f is null)or(p_supply_air_f is not null and p_supply_air_f not between -100 and 150)or(p_return_air_f is not null and p_return_air_f not between -100 and 150)then raise exception'Invalid recorded temperature';end if;
 if p_source not in('manual_display','telematics_export','driver_report','service_report')or(r='driver'and p_source not in('manual_display','driver_report'))then raise exception'Invalid evidence source';end if;
 if p_note is null or char_length(trim(p_note))not between 3 and 2000 then raise exception'Factual source note required';end if;
 if not exists(select 1 from public.loads l join public.load_assignments a on a.company_id=l.company_id and a.load_id=l.id and a.ended_at is null join public.fleet_assets f on f.company_id=l.company_id and f.id=p_asset_id and f.asset_type='trailer'and f.is_reefer is true and f.status='active'and f.unit_number=a.trailer_unit where l.company_id=c and l.id=p_load_id and l.status not in('closed','cancelled')and(r<>'driver'or a.driver_user_id=u))then raise exception'Active assigned reefer load not found';end if;
 insert into public.reefer_temperature_logs(company_id,load_id,asset_id,recorded_at,setpoint_f,supply_air_f,return_air_f,source,factual_note,recorded_by,request_id)values(c,p_load_id,p_asset_id,p_recorded_at,p_setpoint_f,p_supply_air_f,p_return_air_f,p_source,trim(p_note),u,p_request_id)returning id into v;return v;
end$$;
revoke all on function public.list_verified_reefer_assignments(),public.list_verified_reefer_temperature_logs(),public.record_verified_reefer_temperature(uuid,uuid,timestamptz,numeric,numeric,numeric,text,text,text)from public,anon;
grant execute on function public.list_verified_reefer_assignments(),public.list_verified_reefer_temperature_logs(),public.record_verified_reefer_temperature(uuid,uuid,timestamptz,numeric,numeric,numeric,text,text,text)to authenticated;
commit;
