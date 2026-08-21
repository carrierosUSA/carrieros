-- Human-controlled invoice and accounts-receivable workflow.
-- Review before applying. This file does not run against an environment by itself.
begin;

alter table public.load_financials
  add column invoice_number text,
  add column invoice_issued_at timestamptz,
  add column payment_status text not null default 'unbilled'
    check (payment_status in ('unbilled','invoiced','partial','paid')),
  add column paid_cents bigint not null default 0 check (paid_cents >= 0),
  add column paid_at timestamptz,
  add column invoice_request_id text;
create unique index load_financials_invoice_number_uidx
  on public.load_financials(company_id, invoice_number) where invoice_number is not null;
create unique index load_financials_invoice_request_uidx
  on public.load_financials(company_id, invoice_request_id) where invoice_request_id is not null;

create table public.load_payments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  load_id uuid not null,
  amount_cents bigint not null check (amount_cents > 0),
  paid_at timestamptz not null,
  payment_reference text not null check (char_length(payment_reference) between 1 and 200),
  factual_note text check (factual_note is null or char_length(factual_note) between 1 and 2000),
  recorded_by uuid not null,
  request_id text not null,
  created_at timestamptz not null default now(),
  unique (company_id, id),
  unique (company_id, request_id),
  constraint load_payments_load_company_fk foreign key (company_id, load_id)
    references public.loads(company_id, id)
);
create index load_payments_company_load_idx on public.load_payments(company_id, load_id, paid_at desc);
alter table public.load_payments enable row level security;
create policy load_payments_finance_select on public.load_payments for select using (
  company_id = public.document_intake_company_id()
  and public.current_business_role() in ('super_admin','owner','accounting')
);
revoke all privileges on table public.load_payments from public, anon, authenticated, service_role;
grant select on table public.load_payments to authenticated, service_role;
grant insert on table public.load_payments to service_role;

create or replace function public.list_finance_receivables()
returns table(
  load_id uuid, load_number text, broker_name text, load_status text,
  rate_cents bigint, currency text, invoice_number text, invoice_issued_at timestamptz,
  expected_payment_at timestamptz, payment_status text, paid_cents bigint, paid_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select l.id, l.load_number, l.broker_name, l.status,
    f.rate_cents, f.currency, f.invoice_number, f.invoice_issued_at,
    f.expected_payment_at, f.payment_status, f.paid_cents, f.paid_at
  from public.loads l
  join public.load_financials f on f.company_id = l.company_id and f.load_id = l.id
  where l.company_id = public.document_intake_company_id()
    and public.current_business_role() in ('super_admin','owner','accounting')
  order by coalesce(f.expected_payment_at, l.updated_at) desc
$$;

create or replace function public.record_verified_invoice(
  p_load_id uuid, p_invoice_number text, p_issued_at timestamptz,
  p_payment_terms_days integer, p_request_id text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_company uuid := public.document_intake_company_id();
  v_user uuid := auth.uid();
  v_role text := public.current_business_role();
  v_status text;
  v_financial uuid;
begin
  if v_company is null or v_user is null or v_role not in ('super_admin','owner','accounting') then
    raise exception 'Not authorized to record invoices';
  end if;
  if p_invoice_number is null or char_length(trim(p_invoice_number)) not between 1 and 100 then raise exception 'Invalid invoice number'; end if;
  if p_issued_at is null or p_issued_at > now() + interval '1 day' then raise exception 'Invalid invoice date'; end if;
  if p_payment_terms_days is null or p_payment_terms_days not between 0 and 180 then raise exception 'Invalid payment terms'; end if;
  if p_request_id is null or char_length(p_request_id) not between 8 and 200 then raise exception 'Invalid request identifier'; end if;

  select status into v_status from public.loads where id = p_load_id and company_id = v_company for update;
  if v_status not in ('delivered','closed') then raise exception 'Only delivered or closed loads may be invoiced'; end if;
  if not exists (
    select 1 from public.load_document_links l
    where l.company_id = v_company and l.load_id = p_load_id and l.document_type = 'invoice'
      and public.is_current_approved_document(l.document_id, 'invoice')
  ) then raise exception 'A linked current approved invoice is required'; end if;

  select id into v_financial from public.load_financials
  where company_id = v_company and load_id = p_load_id for update;
  if v_financial is null then raise exception 'Verified load rate is not available'; end if;
  if exists (select 1 from public.load_financials where company_id = v_company and invoice_request_id = p_request_id) then return v_financial; end if;
  if exists (select 1 from public.load_financials where company_id = v_company and load_id = p_load_id and invoice_number is not null) then
    raise exception 'Invoice is already recorded';
  end if;

  update public.load_financials set
    invoice_number = trim(p_invoice_number), invoice_issued_at = p_issued_at,
    payment_terms_days = p_payment_terms_days,
    expected_payment_at = p_issued_at + make_interval(days => p_payment_terms_days),
    payment_status = 'invoiced', invoice_request_id = p_request_id, updated_at = now()
  where id = v_financial and company_id = v_company;
  return v_financial;
end
$$;

create or replace function public.record_verified_payment(
  p_load_id uuid, p_amount_cents bigint, p_paid_at timestamptz,
  p_payment_reference text, p_note text, p_request_id text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_company uuid := public.document_intake_company_id();
  v_user uuid := auth.uid();
  v_role text := public.current_business_role();
  v_rate bigint;
  v_paid bigint;
  v_payment uuid;
begin
  if v_company is null or v_user is null or v_role not in ('super_admin','owner','accounting') then raise exception 'Not authorized to record payments'; end if;
  if p_amount_cents is null or p_amount_cents <= 0 then raise exception 'Invalid payment amount'; end if;
  if p_paid_at is null or p_paid_at > now() + interval '1 day' then raise exception 'Invalid payment date'; end if;
  if p_payment_reference is null or char_length(trim(p_payment_reference)) not between 1 and 200 then raise exception 'Payment reference is required'; end if;
  if p_note is not null and char_length(trim(p_note)) not between 1 and 2000 then raise exception 'Invalid payment note'; end if;
  if p_request_id is null or char_length(p_request_id) not between 8 and 200 then raise exception 'Invalid request identifier'; end if;
  select id into v_payment from public.load_payments where company_id = v_company and request_id = p_request_id;
  if v_payment is not null then return v_payment; end if;

  select rate_cents, paid_cents into v_rate, v_paid from public.load_financials
  where company_id = v_company and load_id = p_load_id and invoice_number is not null for update;
  if v_rate is null then raise exception 'A verified issued invoice and rate are required'; end if;
  if v_paid + p_amount_cents > v_rate then raise exception 'Payment exceeds verified outstanding balance'; end if;

  insert into public.load_payments(company_id, load_id, amount_cents, paid_at, payment_reference, factual_note, recorded_by, request_id)
  values (v_company, p_load_id, p_amount_cents, p_paid_at, trim(p_payment_reference), nullif(trim(p_note), ''), v_user, p_request_id)
  returning id into v_payment;
  update public.load_financials set
    paid_cents = v_paid + p_amount_cents,
    paid_at = case when v_paid + p_amount_cents = v_rate then p_paid_at else null end,
    payment_status = case when v_paid + p_amount_cents = v_rate then 'paid' else 'partial' end,
    updated_at = now()
  where company_id = v_company and load_id = p_load_id;
  return v_payment;
end
$$;

revoke all on function public.list_finance_receivables() from public, anon;
revoke all on function public.record_verified_invoice(uuid,text,timestamptz,integer,text) from public, anon;
revoke all on function public.record_verified_payment(uuid,bigint,timestamptz,text,text,text) from public, anon;
grant execute on function public.list_finance_receivables() to authenticated;
grant execute on function public.record_verified_invoice(uuid,text,timestamptz,integer,text) to authenticated;
grant execute on function public.record_verified_payment(uuid,bigint,timestamptz,text,text,text) to authenticated;
commit;
