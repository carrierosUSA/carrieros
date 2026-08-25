-- Read-only dispatch schedule from recorded stops and active assignments. It performs no outreach, dispatch, or movement authorization.
begin;
create or replace function public.list_verified_dispatch_schedule(p_start date,p_end date)
returns table(stop_id uuid,load_id uuid,load_number text,load_status text,priority text,stop_sequence integer,stop_type text,facility_name text,address text,city text,state text,postal_code text,appointment_at timestamptz,appointment_timezone text,arrived_at timestamptz,departed_at timestamptz,driver_name text,truck_unit text,trailer_unit text,exception_summary text,missing_appointment_count bigint)
language plpgsql stable security definer set search_path=public as $$
declare c uuid:=public.document_intake_company_id();r text:=public.current_business_role();
begin
 if c is null or auth.uid()is null or r not in('super_admin','owner','dispatcher','safety','read_only')then raise exception'Not authorized';end if;
 if p_start is null or p_end is null or p_end<p_start or p_start<current_date-31 or p_end>current_date+90 or p_end-p_start>31 then raise exception'Invalid schedule period';end if;
 return query with missing as(
  select count(*)::bigint total from public.load_stops s join public.loads l on l.company_id=s.company_id and l.id=s.load_id
  where s.company_id=c and l.status not in('closed','cancelled')and s.departed_at is null and s.appointment_at is null
 )
 select s.id,l.id,l.load_number,l.status,l.priority,s.stop_sequence,s.stop_type,s.facility_name,s.address,s.city,s.state,s.postal_code,s.appointment_at,s.appointment_timezone,s.arrived_at,s.departed_at,
  coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'),''),nullif(trim(concat_ws(' ',u.raw_user_meta_data->>'first_name',u.raw_user_meta_data->>'last_name')),''),'Verified driver'),
  a.truck_unit,a.trailer_unit,l.exception_summary,m.total
 from public.load_stops s join public.loads l on l.company_id=s.company_id and l.id=s.load_id
 left join public.load_assignments a on a.company_id=l.company_id and a.load_id=l.id and a.ended_at is null
 left join auth.users u on u.id=a.driver_user_id and u.raw_app_meta_data->>'company_id'=c::text and u.raw_app_meta_data->>'business_role'='driver'
 cross join missing m
 where s.company_id=c and l.status not in('closed','cancelled')and s.appointment_at::date between p_start and p_end
 order by s.appointment_at,l.load_number,s.stop_sequence;
end$$;
revoke all on function public.list_verified_dispatch_schedule(date,date)from public,anon;
grant execute on function public.list_verified_dispatch_schedule(date,date)to authenticated;
commit;
