-- Read-only broker history derived from company-recorded loads and receivables. No credit score or recommendation is inferred.
begin;
create or replace function public.list_verified_broker_performance(p_start date,p_end date)
returns table(broker_id uuid,legal_name text,mc_number text,relationship_status text,payment_terms_days integer,completed_load_count bigint,rated_load_count bigint,missing_rate_load_count bigint,recorded_rate_cents bigint,invoiced_load_count bigint,invoiced_cents bigint,paid_cents bigint,outstanding_cents bigint,fully_paid_invoice_count bigint,average_days_to_full_payment integer,open_overdue_invoice_count bigint,last_completed_at timestamptz)
language plpgsql stable security definer set search_path=public as $$
declare c uuid:=public.document_intake_company_id();r text:=public.current_business_role();
begin
 if c is null or auth.uid()is null or r not in('super_admin','owner','accounting')then raise exception'Not authorized';end if;
 if p_start is null or p_end is null or p_end<p_start or p_end>current_date+1 or p_end-p_start>366 then raise exception'Invalid broker reporting period';end if;
 return query with completed as(
  select l.id,l.broker_profile_id,e.event_at
  from public.loads l join lateral(
   select x.event_at from public.load_events x where x.company_id=l.company_id and x.load_id=l.id and x.event_type='status_changed'and x.status in('delivered','closed')order by x.event_at desc limit 1
  )e on e.event_at::date between p_start and p_end
  where l.company_id=c and l.status in('delivered','closed')and l.broker_profile_id is not null
 )
 select b.id,b.legal_name,b.mc_number,b.relationship_status,b.payment_terms_days,
  count(*)::bigint,count(*)filter(where f.rate_cents is not null)::bigint,count(*)filter(where f.rate_cents is null)::bigint,
  coalesce(sum(f.rate_cents)filter(where f.rate_cents is not null),0)::bigint,
  count(*)filter(where f.invoice_number is not null)::bigint,
  coalesce(sum(f.rate_cents)filter(where f.invoice_number is not null),0)::bigint,
  coalesce(sum(f.paid_cents)filter(where f.invoice_number is not null),0)::bigint,
  coalesce(sum(greatest(f.rate_cents-f.paid_cents,0))filter(where f.invoice_number is not null),0)::bigint,
  count(*)filter(where f.payment_status='paid')::bigint,
  round(avg(extract(epoch from(f.paid_at-f.invoice_issued_at))/86400)filter(where f.payment_status='paid'and f.paid_at>=f.invoice_issued_at))::integer,
  count(*)filter(where f.invoice_number is not null and f.payment_status<>'paid'and f.expected_payment_at<now())::bigint,
  max(x.event_at)
 from completed x join public.broker_profiles b on b.company_id=c and b.id=x.broker_profile_id
 left join public.load_financials f on f.company_id=c and f.load_id=x.id
 group by b.id,b.legal_name,b.mc_number,b.relationship_status,b.payment_terms_days
 order by count(*)desc,max(x.event_at)desc;
end$$;
revoke all on function public.list_verified_broker_performance(date,date)from public,anon;
grant execute on function public.list_verified_broker_performance(date,date)to authenticated;
commit;
