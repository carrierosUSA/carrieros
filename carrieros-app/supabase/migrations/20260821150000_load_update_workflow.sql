-- Human-controlled, append-audited load operational updates.
-- Review before applying. This file does not run against an environment by itself.
begin;

create or replace function public.record_verified_load_update(
  p_load_id uuid,
  p_expected_status text,
  p_next_status text,
  p_location text,
  p_eta timestamptz,
  p_exception_summary text,
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
  v_current_status text;
  v_event_type text;
  v_source text;
begin
  if v_company is null or v_user is null
    or v_role not in ('super_admin','owner','dispatcher','driver') then
    raise exception 'Not authorized to update load operations';
  end if;
  if p_request_id is null or char_length(p_request_id) not between 8 and 200 then
    raise exception 'Invalid request identifier';
  end if;
  if p_location is not null and char_length(trim(p_location)) not between 1 and 300 then
    raise exception 'Invalid verified location';
  end if;
  if p_exception_summary is not null and char_length(trim(p_exception_summary)) not between 1 and 1000 then
    raise exception 'Invalid exception summary';
  end if;
  if p_note is not null and char_length(trim(p_note)) not between 1 and 4000 then
    raise exception 'Invalid factual note';
  end if;
  if p_next_status is null and p_location is null and p_eta is null
    and p_exception_summary is null and p_note is null then
    raise exception 'At least one verified fact is required';
  end if;

  select status into v_current_status
  from public.loads
  where id = p_load_id and company_id = v_company and public.can_read_load(id)
  for update;
  if v_current_status is null then
    raise exception 'Load not found or not authorized';
  end if;
  if v_role = 'driver' and not exists (
    select 1 from public.load_assignments a
    where a.company_id = v_company and a.load_id = p_load_id
      and a.driver_user_id = v_user and a.ended_at is null
  ) then
    raise exception 'Driver is not actively assigned to this load';
  end if;

  if exists (
    select 1 from public.load_events e
    where e.company_id = v_company and e.load_id = p_load_id
      and e.request_id = p_request_id
  ) then
    return p_load_id;
  end if;
  if v_current_status in ('closed','cancelled') then
    raise exception 'Closed or cancelled loads are immutable';
  end if;
  if p_expected_status is distinct from v_current_status then
    raise exception 'Load status changed; reload before saving';
  end if;

  if p_next_status is not null then
    if p_next_status not in (
      'pending','dispatched','en_route_to_pickup','arrived_pickup','picked_up',
      'in_transit','arrived_delivery','delivered','closed','cancelled'
    ) or p_next_status = v_current_status then
      raise exception 'Invalid load status transition';
    end if;
    if p_next_status = 'closed' then
      raise exception 'Closure requires verified POD, invoice, and resolved exceptions';
    end if;
    if p_next_status = 'cancelled' and v_role = 'driver' then
      raise exception 'Driver cannot cancel a load';
    end if;
    if p_next_status = 'cancelled' and p_note is null and p_exception_summary is null then
      raise exception 'Cancellation requires a factual reason';
    end if;

    if p_next_status = 'cancelled' then
      if v_role not in ('super_admin','owner','dispatcher')
        or v_current_status in ('delivered','closed','cancelled') then
        raise exception 'Invalid load status transition';
      end if;
    elsif not (
      (v_current_status = 'pending' and p_next_status = 'dispatched' and v_role in ('super_admin','owner','dispatcher'))
      or (v_current_status = 'dispatched' and p_next_status = 'en_route_to_pickup')
      or (v_current_status = 'en_route_to_pickup' and p_next_status = 'arrived_pickup')
      or (v_current_status = 'arrived_pickup' and p_next_status = 'picked_up')
      or (v_current_status = 'picked_up' and p_next_status = 'in_transit')
      or (v_current_status = 'in_transit' and p_next_status = 'arrived_delivery')
      or (v_current_status = 'arrived_delivery' and p_next_status = 'delivered')
    ) then
      raise exception 'Invalid load status transition';
    end if;
  end if;

  update public.loads
  set status = coalesce(p_next_status, status),
      current_location = coalesce(nullif(trim(p_location), ''), current_location),
      eta = coalesce(p_eta, eta),
      exception_summary = coalesce(nullif(trim(p_exception_summary), ''), exception_summary),
      priority = case when p_exception_summary is not null then 'red' else priority end,
      updated_at = now()
  where id = p_load_id and company_id = v_company;

  if p_note is not null then
    insert into public.load_notes(
      company_id, load_id, note_type, body, actor_user_id
    ) values (
      v_company, p_load_id,
      case when p_exception_summary is not null then 'exception' else 'general' end,
      trim(p_note), v_user
    );
  end if;

  v_event_type := case
    when p_next_status is not null then 'status_changed'
    when p_exception_summary is not null then 'exception_reported'
    when p_location is not null then 'location_reported'
    when p_eta is not null then 'eta_reported'
    else 'approval_recorded'
  end;
  v_source := case when v_role = 'driver' then 'driver'
    when v_role = 'dispatcher' then 'dispatcher' else 'owner' end;

  insert into public.load_events(
    company_id, load_id, event_type, status, location, eta,
    factual_note, source, actor_user_id, request_id
  ) values (
    v_company, p_load_id, v_event_type,
    coalesce(p_next_status, v_current_status), nullif(trim(p_location), ''), p_eta,
    coalesce(nullif(trim(p_note), ''), nullif(trim(p_exception_summary), '')),
    v_source, v_user, p_request_id
  );

  return p_load_id;
end
$$;

revoke all on function public.record_verified_load_update(
  uuid,text,text,text,timestamptz,text,text,text
) from public, anon;
grant execute on function public.record_verified_load_update(
  uuid,text,text,text,timestamptz,text,text,text
) to authenticated;

commit;
