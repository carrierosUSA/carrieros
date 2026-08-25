-- Atomic, human-approved rate-confirmation to draft-load workflow.
-- Review before applying. This migration does not execute against any environment by itself.
begin;

create unique index if not exists loads_one_source_document_uidx
  on public.loads(company_id, source_document_id)
  where source_document_id is not null;

create or replace function public.create_load_from_confirmed_rate_confirmation(
  p_document_id uuid
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company uuid := public.document_intake_company_id();
  v_user uuid := auth.uid();
  v_role text := public.current_business_role();
  v_ocr_result_id uuid;
  v_action_id uuid;
  v_load_id uuid;
  v_load_number text;
  v_broker text;
  v_pickup_number text;
  v_delivery_number text;
  v_pickup_facility text;
  v_pickup_address text;
  v_pickup_city_state text;
  v_pickup_city text;
  v_pickup_state text;
  v_delivery_facility text;
  v_delivery_address text;
  v_delivery_city_state text;
  v_delivery_city text;
  v_delivery_state text;
  v_commodity text;
  v_weight_text text;
  v_weight_lbs integer;
  v_miles_text text;
  v_miles integer;
  v_equipment text;
  v_temperature text;
  v_instructions text;
  v_rate_text text;
  v_rate_cents bigint;
begin
  if v_company is null or v_user is null or v_role not in ('super_admin','owner','dispatcher') then
    raise exception 'Not authorized to create a load';
  end if;

  select a.ocr_result_id into v_ocr_result_id
  from public.documents d
  join public.document_proposed_actions a
    on a.company_id = d.company_id and a.document_id = d.id
  join public.document_approvals approval
    on approval.company_id = a.company_id and approval.proposed_action_id = a.id
  join public.document_ocr_results r
    on r.company_id = a.company_id and r.id = a.ocr_result_id
      and r.document_id = d.id and r.document_version_id = d.current_version_id
  where d.company_id = v_company and d.id = p_document_id
    and d.document_type = 'rate_confirmation' and d.status = 'ready'
    and a.action_kind = 'confirm_document_review' and a.status = 'approved'
    and approval.decision = 'approved' and r.status = 'completed'
  order by a.updated_at desc
  limit 1;

  if v_ocr_result_id is null then
    raise exception 'A confirmed rate confirmation is required';
  end if;
  if exists (
    select 1 from public.document_ocr_fields f
    where f.company_id = v_company and f.ocr_result_id = v_ocr_result_id
      and f.is_verified is not true
  ) then
    raise exception 'Every extracted field must be human verified';
  end if;

  select id into v_load_id from public.loads
  where company_id = v_company and source_document_id = p_document_id;
  if v_load_id is not null then
    return v_load_id;
  end if;

  select
    nullif(trim(max(value_text) filter (where field_key = 'loadNumber')), ''),
    nullif(trim(max(value_text) filter (where field_key = 'broker')), ''),
    nullif(trim(max(value_text) filter (where field_key = 'pickupNumber')), ''),
    nullif(trim(max(value_text) filter (where field_key = 'deliveryNumber')), ''),
    nullif(trim(max(value_text) filter (where field_key = 'pickup')), ''),
    nullif(trim(max(value_text) filter (where field_key = 'pickupAddress')), ''),
    nullif(trim(max(value_text) filter (where field_key = 'pickupCityState')), ''),
    nullif(trim(max(value_text) filter (where field_key = 'delivery')), ''),
    nullif(trim(max(value_text) filter (where field_key = 'deliveryAddress')), ''),
    nullif(trim(max(value_text) filter (where field_key = 'deliveryCityState')), ''),
    nullif(trim(max(value_text) filter (where field_key = 'commodity')), ''),
    nullif(trim(max(value_text) filter (where field_key = 'weight')), ''),
    nullif(trim(max(value_text) filter (where field_key = 'miles')), ''),
    nullif(trim(max(value_text) filter (where field_key = 'equipmentType')), ''),
    nullif(trim(max(value_text) filter (where field_key = 'temperature')), ''),
    nullif(trim(max(value_text) filter (where field_key = 'instructions')), ''),
    nullif(trim(max(value_text) filter (where field_key = 'rate')), '')
  into
    v_load_number, v_broker, v_pickup_number, v_delivery_number,
    v_pickup_facility, v_pickup_address, v_pickup_city_state,
    v_delivery_facility, v_delivery_address, v_delivery_city_state,
    v_commodity, v_weight_text, v_miles_text, v_equipment,
    v_temperature, v_instructions, v_rate_text
  from public.document_ocr_fields
  where company_id = v_company and ocr_result_id = v_ocr_result_id;

  if v_load_number is null or v_pickup_address is null or v_pickup_city_state is null
    or v_delivery_address is null or v_delivery_city_state is null then
    raise exception 'Load number and complete pickup and delivery locations are required';
  end if;

  v_pickup_state := upper(substring(v_pickup_city_state from ',[[:space:]]*([A-Za-z]{2})(?:[[:space:]]+[0-9]{5}(?:-[0-9]{4})?)?[[:space:]]*$'));
  v_delivery_state := upper(substring(v_delivery_city_state from ',[[:space:]]*([A-Za-z]{2})(?:[[:space:]]+[0-9]{5}(?:-[0-9]{4})?)?[[:space:]]*$'));
  v_pickup_city := nullif(trim(regexp_replace(v_pickup_city_state, ',[[:space:]]*[A-Za-z]{2}(?:[[:space:]]+[0-9]{5}(?:-[0-9]{4})?)?[[:space:]]*$', '')), '');
  v_delivery_city := nullif(trim(regexp_replace(v_delivery_city_state, ',[[:space:]]*[A-Za-z]{2}(?:[[:space:]]+[0-9]{5}(?:-[0-9]{4})?)?[[:space:]]*$', '')), '');
  if v_pickup_city is null or v_pickup_state is null or v_delivery_city is null or v_delivery_state is null then
    raise exception 'Pickup and delivery city/state must use City, ST format';
  end if;

  if v_weight_text is not null then
    v_weight_text := regexp_replace(v_weight_text, '[^0-9]', '', 'g');
    if v_weight_text ~ '^[0-9]+$' and v_weight_text::numeric between 1 and 2147483647 then
      v_weight_lbs := v_weight_text::integer;
    end if;
  end if;
  if v_miles_text is not null then
    v_miles_text := regexp_replace(v_miles_text, '[^0-9]', '', 'g');
    if v_miles_text ~ '^[0-9]+$' and v_miles_text::numeric between 0 and 2147483647 then
      v_miles := v_miles_text::integer;
    end if;
  end if;
  if v_rate_text is not null then
    v_rate_text := regexp_replace(v_rate_text, '[^0-9.]', '', 'g');
    if v_rate_text ~ '^[0-9]+(?:\.[0-9]{1,2})?$' then
      v_rate_cents := round(v_rate_text::numeric * 100)::bigint;
    end if;
  end if;

  insert into public.document_proposed_actions(
    company_id, document_id, ocr_result_id, action_kind, summary, payload,
    confidence, status, requires_approval, created_by
  ) values (
    v_company, p_document_id, v_ocr_result_id,
    'create_load_from_rate_confirmation', 'Create a pending load from the confirmed rate confirmation',
    jsonb_build_object('load_number', v_load_number, 'source_document_id', p_document_id),
    1, 'approved', true, v_user
  ) returning id into v_action_id;

  insert into public.document_approvals(company_id, proposed_action_id, decision, decided_by, decision_note)
  values (v_company, v_action_id, 'approved', v_user, 'Authenticated human approved draft load creation.');

  insert into public.loads(
    company_id, load_number, broker_name, status, pickup_number, delivery_number,
    commodity, weight_lbs, miles, equipment_type, temperature_requirement,
    special_instructions, source_document_id, created_by, confirmed_by, confirmed_at
  ) values (
    v_company, v_load_number, v_broker, 'pending', v_pickup_number, v_delivery_number,
    v_commodity, v_weight_lbs, v_miles, v_equipment, v_temperature,
    v_instructions, p_document_id, v_user, v_user, now()
  ) returning id into v_load_id;

  insert into public.load_stops(
    company_id, load_id, stop_sequence, stop_type, facility_name, address, city, state
  ) values
    (v_company, v_load_id, 1, 'pickup', v_pickup_facility, v_pickup_address, v_pickup_city, v_pickup_state),
    (v_company, v_load_id, 2, 'delivery', v_delivery_facility, v_delivery_address, v_delivery_city, v_delivery_state);

  if v_rate_cents is not null then
    insert into public.load_financials(company_id, load_id, rate_cents, currency, created_by)
    values (v_company, v_load_id, v_rate_cents, 'USD', v_user);
  end if;

  insert into public.load_events(
    company_id, load_id, event_type, status, factual_note, source, actor_user_id, request_id
  ) values (
    v_company, v_load_id, 'approval_recorded', 'pending',
    'Authenticated human created a pending load from a confirmed rate confirmation.',
    case when v_role = 'dispatcher' then 'dispatcher' else 'owner' end,
    v_user, 'load-created-from-document:' || p_document_id
  );

  update public.document_proposed_actions
  set status = 'executed', updated_at = now(),
    payload = payload || jsonb_build_object('load_id', v_load_id, 'execution_state', 'executed')
  where company_id = v_company and id = v_action_id;

  insert into public.document_audit_history(
    company_id, document_id, proposed_action_id, actor_user_id,
    event_type, detail, after_state, request_id
  ) values (
    v_company, p_document_id, v_action_id, v_user,
    'load_created_from_rate_confirmation',
    'Authenticated human approved creation of a pending load. No driver was assigned and no movement was authorized.',
    jsonb_build_object('load_id', v_load_id, 'status', 'pending'),
    'load-created-from-document:' || p_document_id
  );

  return v_load_id;
exception
  when unique_violation then
    select id into v_load_id from public.loads
    where company_id = v_company and source_document_id = p_document_id;
    if v_load_id is not null then return v_load_id; end if;
    raise;
end
$$;

revoke all on function public.create_load_from_confirmed_rate_confirmation(uuid) from public, anon;
grant execute on function public.create_load_from_confirmed_rate_confirmation(uuid) to authenticated;

commit;
