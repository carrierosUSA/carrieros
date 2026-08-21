-- Human-approved, company-isolated driver and equipment assignment workflow.
-- Review before applying. This file does not run against an environment by itself.
begin;

create or replace function public.list_assignable_company_drivers()
returns table(user_id uuid, display_name text)
language sql
stable
security definer
set search_path = public
as $$
  select
    u.id as user_id,
    coalesce(
      nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(concat_ws(' ', u.raw_user_meta_data ->> 'first_name', u.raw_user_meta_data ->> 'last_name')), ''),
      'Verified driver'
    ) as display_name
  from auth.users u
  where public.document_intake_company_id() is not null
    and public.current_business_role() in ('super_admin','owner','dispatcher')
    and u.raw_app_meta_data ->> 'company_id' = public.document_intake_company_id()::text
    and u.raw_app_meta_data ->> 'business_role' = 'driver'
  order by display_name, u.id
$$;

revoke all on function public.list_assignable_company_drivers() from public, anon;
grant execute on function public.list_assignable_company_drivers() to authenticated;

create or replace function public.assign_verified_load(
  p_load_id uuid,
  p_driver_user_id uuid,
  p_truck_unit text,
  p_trailer_unit text,
  p_equipment_fit_verified boolean,
  p_hos_verified boolean,
  p_safety_verified boolean,
  p_note text,
  p_request_id text
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
  v_assignment_id uuid;
  v_source text;
begin
  if v_company is null or v_user is null
    or v_role not in ('super_admin','owner','dispatcher') then
    raise exception 'Not authorized to assign loads';
  end if;
  if p_request_id is null or char_length(p_request_id) not between 8 and 200 then
    raise exception 'Invalid request identifier';
  end if;
  if p_truck_unit is null or char_length(trim(p_truck_unit)) not between 1 and 80
    or (p_trailer_unit is not null and char_length(trim(p_trailer_unit)) not between 1 and 80) then
    raise exception 'Invalid verified equipment unit';
  end if;
  if p_note is not null and char_length(trim(p_note)) not between 1 and 2000 then
    raise exception 'Invalid factual assignment note';
  end if;
  if p_equipment_fit_verified is not true or p_hos_verified is not true
    or p_safety_verified is not true then
    raise exception 'All three safety confirmations are required';
  end if;

  select status into v_status
  from public.loads
  where id = p_load_id and company_id = v_company and public.can_read_load(id)
  for update;
  if v_status is null then raise exception 'Load not found or not authorized'; end if;

  if exists (
    select 1 from public.load_events e
    where e.company_id = v_company and e.load_id = p_load_id
      and e.request_id = p_request_id
  ) then
    select a.id into v_assignment_id from public.load_assignments a
    where a.company_id = v_company and a.load_id = p_load_id and a.ended_at is null;
    if v_assignment_id is not null then return v_assignment_id; end if;
    raise exception 'Assignment retry has no active assignment';
  end if;
  if v_status <> 'pending' then
    raise exception 'Only pending loads may receive an initial assignment';
  end if;
  if exists (
    select 1 from public.load_assignments a
    where a.company_id = v_company and a.load_id = p_load_id and a.ended_at is null
  ) then
    raise exception 'Load already has an active assignment';
  end if;
  if not exists (
    select 1 from auth.users u
    where u.id = p_driver_user_id
      and u.raw_app_meta_data ->> 'company_id' = v_company::text
      and u.raw_app_meta_data ->> 'business_role' = 'driver'
  ) then
    raise exception 'Verified same-company driver is required';
  end if;

  insert into public.load_assignments(
    company_id, load_id, driver_user_id, truck_unit, trailer_unit,
    equipment_fit_verified, hos_verified, safety_verified, approved_by
  ) values (
    v_company, p_load_id, p_driver_user_id, trim(p_truck_unit),
    nullif(trim(p_trailer_unit), ''), true, true, true, v_user
  ) returning id into v_assignment_id;

  v_source := case when v_role = 'dispatcher' then 'dispatcher' else 'owner' end;
  insert into public.load_events(
    company_id, load_id, event_type, status, factual_note,
    source, actor_user_id, request_id
  ) values (
    v_company, p_load_id, 'approval_recorded', 'pending',
    'Human-approved assignment recorded; equipment fit, available HOS, and safety review confirmed. Assignment does not dispatch or authorize movement.'
      || case when p_note is null then '' else ' Note: ' || trim(p_note) end,
    v_source, v_user, p_request_id
  );

  return v_assignment_id;
end
$$;

revoke all on function public.assign_verified_load(
  uuid,uuid,text,text,boolean,boolean,boolean,text,text
) from public, anon;
grant execute on function public.assign_verified_load(
  uuid,uuid,text,text,boolean,boolean,boolean,text,text
) to authenticated;

commit;
