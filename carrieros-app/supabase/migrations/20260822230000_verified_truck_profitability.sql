-- Read-only truck profitability derived from verified revenue and expense records.
-- Review before applying. This file does not run against an environment by itself.
begin;

create or replace function public.list_verified_truck_profitability(p_start date, p_end date)
returns table(
  asset_id uuid,
  unit_number text,
  load_count bigint,
  revenue_cents bigint,
  expense_cents bigint,
  net_cents bigint,
  missing_rate_load_count bigint,
  company_wide_expense_cents bigint,
  unmapped_load_count bigint
)
language plpgsql stable security definer set search_path=public as $$
declare
  v_company uuid := public.document_intake_company_id();
  v_role text := public.current_business_role();
begin
  if v_company is null or auth.uid() is null or v_role not in ('super_admin','owner','accounting') then
    raise exception 'Not authorized to view truck profitability';
  end if;
  if p_start is null or p_end is null or p_end < p_start or p_end > current_date + 1 or p_end - p_start > 366 then
    raise exception 'Invalid profitability period';
  end if;

  return query
  with earned_loads as (
    select l.id, a.truck_unit, f.rate_cents
    from public.loads l
    join lateral (
      select x.truck_unit from public.load_assignments x
      where x.company_id=l.company_id and x.load_id=l.id
      order by x.approved_at desc limit 1
    ) a on true
    join lateral (
      select e.event_at from public.load_events e
      where e.company_id=l.company_id and e.load_id=l.id
        and e.event_type='status_changed' and e.status in ('delivered','closed')
      order by e.event_at desc limit 1
    ) earned on earned.event_at::date between p_start and p_end
    left join public.load_financials f on f.company_id=l.company_id and f.load_id=l.id
    where l.company_id=v_company and l.status in ('delivered','closed')
  ), revenue as (
    select a.id asset_id, count(e.id)::bigint load_count,
      coalesce(sum(e.rate_cents) filter(where e.rate_cents is not null),0)::bigint revenue_cents,
      count(e.id) filter(where e.rate_cents is null)::bigint missing_rate_count
    from public.fleet_assets a left join earned_loads e on e.truck_unit=a.unit_number
    where a.company_id=v_company and a.asset_type='truck'
    group by a.id
  ), expense as (
    select e.asset_id, sum(e.amount_cents)::bigint expense_cents
    from public.operating_expenses e
    where e.company_id=v_company and e.status='active' and e.incurred_on between p_start and p_end and e.asset_id is not null
    group by e.asset_id
  ), company_expense as (
    select coalesce(sum(e.amount_cents),0)::bigint total
    from public.operating_expenses e
    where e.company_id=v_company and e.status='active' and e.incurred_on between p_start and p_end and e.asset_id is null
  ), unmapped as (
    select count(*)::bigint total from earned_loads e
    where not exists(select 1 from public.fleet_assets a where a.company_id=v_company and a.asset_type='truck' and a.unit_number=e.truck_unit)
  )
  select a.id,a.unit_number,r.load_count,r.revenue_cents,coalesce(x.expense_cents,0)::bigint,
    (r.revenue_cents-coalesce(x.expense_cents,0))::bigint,r.missing_rate_count,c.total,u.total
  from public.fleet_assets a
  join revenue r on r.asset_id=a.id
  left join expense x on x.asset_id=a.id
  cross join company_expense c cross join unmapped u
  where a.company_id=v_company and a.asset_type='truck'
  order by a.unit_number;
end
$$;

revoke all on function public.list_verified_truck_profitability(date,date) from public,anon;
grant execute on function public.list_verified_truck_profitability(date,date) to authenticated;
commit;
