-- Secure, human-controlled Load Operations foundation. Review before applying.
begin;

create table public.loads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  load_number text not null,
  broker_name text,
  broker_contact text,
  status text not null default 'pending' check (status in (
    'pending','dispatched','en_route_to_pickup','arrived_pickup','picked_up',
    'in_transit','arrived_delivery','delivered','closed','cancelled'
  )),
  pickup_number text,
  delivery_number text,
  commodity text,
  weight_lbs integer check (weight_lbs is null or weight_lbs > 0),
  miles integer check (miles is null or miles >= 0),
  equipment_type text,
  temperature_requirement text,
  seal_number text,
  special_instructions text,
  emergency_requirements text,
  current_location text,
  eta timestamptz,
  next_check_at timestamptz,
  priority text not null default 'green' check (priority in ('green','amber','red')),
  exception_summary text,
  source_document_id uuid,
  created_by uuid not null,
  confirmed_by uuid,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, load_number), unique (company_id, id),
  constraint loads_source_document_company_fk foreign key (company_id, source_document_id)
    references public.documents(company_id, id)
);

create table public.load_stops (
  id uuid primary key default gen_random_uuid(), company_id uuid not null,
  load_id uuid not null, stop_sequence integer not null check (stop_sequence > 0),
  stop_type text not null check (stop_type in ('pickup','delivery','stop')),
  facility_name text, address text not null, city text not null, state text not null,
  postal_code text, appointment_at timestamptz, appointment_timezone text,
  reference_number text, contact_name text, contact_phone text,
  arrived_at timestamptz, checked_in_at timestamptz, departed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (load_id, stop_sequence), unique (company_id, id, load_id),
  constraint load_stops_load_company_fk foreign key (company_id, load_id)
    references public.loads(company_id, id) on delete cascade
);

create table public.load_assignments (
  id uuid primary key default gen_random_uuid(), company_id uuid not null, load_id uuid not null,
  driver_user_id uuid not null, truck_unit text not null, trailer_unit text,
  equipment_fit_verified boolean not null default false,
  hos_verified boolean not null default false, safety_verified boolean not null default false,
  approved_by uuid not null, approved_at timestamptz not null default now(),
  ended_at timestamptz, created_at timestamptz not null default now(),
  unique (company_id, id),
  constraint load_assignments_load_company_fk foreign key (company_id, load_id)
    references public.loads(company_id, id) on delete cascade
);
create unique index load_assignments_one_active_uidx on public.load_assignments(load_id) where ended_at is null;

create table public.load_events (
  id uuid primary key default gen_random_uuid(), company_id uuid not null, load_id uuid not null,
  event_type text not null check (event_type in ('status_changed','location_reported','eta_reported','check_in','check_out','exception_reported','instruction_sent','document_received','approval_recorded')),
  status text, location text, eta timestamptz, factual_note text,
  source text not null check (source in ('owner','dispatcher','driver','system','integration')),
  actor_user_id uuid not null, request_id text, event_at timestamptz not null default now(),
  created_at timestamptz not null default now(), unique (company_id, id),
  constraint load_events_load_company_fk foreign key (company_id, load_id)
    references public.loads(company_id, id) on delete cascade
);
create unique index load_events_request_idempotency_uidx on public.load_events(company_id, load_id, request_id) where request_id is not null;

create table public.load_notes (
  id uuid primary key default gen_random_uuid(), company_id uuid not null, load_id uuid not null,
  note_type text not null check (note_type in ('general','instruction','exception','safety','billing')),
  body text not null check (char_length(body) between 1 and 4000), actor_user_id uuid not null,
  created_at timestamptz not null default now(), unique (company_id, id),
  constraint load_notes_load_company_fk foreign key (company_id, load_id)
    references public.loads(company_id, id) on delete cascade
);

create table public.load_financials (
  id uuid primary key default gen_random_uuid(), company_id uuid not null, load_id uuid not null,
  rate_cents bigint check (rate_cents is null or rate_cents >= 0),
  currency text not null default 'USD' check (char_length(currency) = 3),
  payment_terms_days integer check (payment_terms_days is null or payment_terms_days >= 0),
  expected_payment_at timestamptz, created_by uuid not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (company_id, id), unique (load_id),
  constraint load_financials_load_company_fk foreign key (company_id, load_id)
    references public.loads(company_id, id) on delete cascade
);

create table public.load_detention_evidence (
  id uuid primary key default gen_random_uuid(), company_id uuid not null,
  load_id uuid not null, stop_id uuid not null, appointment_at timestamptz,
  arrival_at timestamptz, checked_in_at timestamptz, departure_at timestamptz,
  written_notice_document_id uuid, written_approval_document_id uuid,
  factual_note text, created_by uuid not null, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), unique (company_id, id),
  constraint detention_load_company_fk foreign key (company_id, load_id)
    references public.loads(company_id, id) on delete cascade,
  constraint detention_stop_company_fk foreign key (company_id, stop_id, load_id)
    references public.load_stops(company_id, id, load_id) on delete cascade,
  constraint detention_notice_document_company_fk foreign key (company_id, written_notice_document_id)
    references public.documents(company_id, id),
  constraint detention_approval_document_company_fk foreign key (company_id, written_approval_document_id)
    references public.documents(company_id, id)
);

create index loads_company_status_idx on public.loads(company_id, status, updated_at desc);
create index loads_company_priority_idx on public.loads(company_id, priority, next_check_at);
create index load_stops_company_load_idx on public.load_stops(company_id, load_id, stop_sequence);
create index load_events_company_load_idx on public.load_events(company_id, load_id, event_at desc);
create index load_notes_company_load_idx on public.load_notes(company_id, load_id, created_at desc);
create index load_financials_company_payment_idx on public.load_financials(company_id, expected_payment_at);

alter table public.loads enable row level security;
alter table public.load_stops enable row level security;
alter table public.load_assignments enable row level security;
alter table public.load_events enable row level security;
alter table public.load_notes enable row level security;
alter table public.load_financials enable row level security;
alter table public.load_detention_evidence enable row level security;

create or replace function public.can_read_load(p_load_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.loads l
    where l.id = p_load_id and l.company_id = public.document_intake_company_id()
    and (
      public.current_business_role() in ('super_admin','owner','dispatcher','accounting','safety')
      or (public.current_business_role() = 'driver' and exists (
        select 1 from public.load_assignments a
        where a.load_id = l.id and a.company_id = l.company_id
          and a.driver_user_id = auth.uid() and a.ended_at is null
      ))
    )
  )
$$;
revoke all on function public.can_read_load(uuid) from public, anon;
grant execute on function public.can_read_load(uuid) to authenticated, service_role;

create policy loads_authorized_select on public.loads for select using (public.can_read_load(id));
create policy load_stops_authorized_select on public.load_stops for select using (public.can_read_load(load_id));
create policy load_assignments_authorized_select on public.load_assignments for select using (public.can_read_load(load_id));
create policy load_events_authorized_select on public.load_events for select using (public.can_read_load(load_id));
create policy load_notes_authorized_select on public.load_notes for select using (public.can_read_load(load_id));
create policy load_financials_authorized_select on public.load_financials for select using (
  company_id = public.document_intake_company_id()
  and public.current_business_role() in ('super_admin','owner','dispatcher','accounting')
);
create policy load_detention_authorized_select on public.load_detention_evidence for select using (public.can_read_load(load_id));

create policy loads_dispatch_insert on public.loads for insert with check (
  company_id = public.document_intake_company_id() and created_by = auth.uid()
  and public.current_business_role() in ('super_admin','owner','dispatcher')
);
create policy loads_dispatch_update on public.loads for update using (
  company_id = public.document_intake_company_id() and public.current_business_role() in ('super_admin','owner','dispatcher')
) with check (
  company_id = public.document_intake_company_id() and public.current_business_role() in ('super_admin','owner','dispatcher')
);

do $$ declare t text; begin
  foreach t in array array['load_stops','load_assignments','load_detention_evidence'] loop
    execute format('create policy %I on public.%I for all using (company_id = public.document_intake_company_id() and public.current_business_role() in (''super_admin'',''owner'',''dispatcher'')) with check (company_id = public.document_intake_company_id() and public.current_business_role() in (''super_admin'',''owner'',''dispatcher'') and public.can_read_load(load_id))', t || '_dispatch_write', t);
  end loop;
end $$;

create policy load_financials_authorized_write on public.load_financials for all using (
  company_id = public.document_intake_company_id() and public.current_business_role() in ('super_admin','owner','accounting')
) with check (
  company_id = public.document_intake_company_id() and public.current_business_role() in ('super_admin','owner','accounting')
  and public.can_read_load(load_id)
);
create policy load_events_human_insert on public.load_events for insert with check (
  company_id = public.document_intake_company_id() and actor_user_id = auth.uid() and public.can_read_load(load_id)
  and ((source = 'driver' and public.current_business_role() = 'driver') or (source in ('owner','dispatcher') and public.current_business_role() in ('super_admin','owner','dispatcher')))
);
create policy load_notes_human_insert on public.load_notes for insert with check (
  company_id = public.document_intake_company_id() and actor_user_id = auth.uid() and public.can_read_load(load_id)
  and public.current_business_role() in ('super_admin','owner','dispatcher','driver','safety')
);

revoke all privileges on table public.loads, public.load_stops, public.load_assignments,
  public.load_events, public.load_notes, public.load_financials, public.load_detention_evidence
from anon, authenticated, service_role;
grant select, insert, update on public.loads, public.load_stops, public.load_assignments,
  public.load_financials, public.load_detention_evidence to authenticated;
grant select, insert on public.load_events, public.load_notes to authenticated;
grant select, insert, update on public.loads, public.load_stops, public.load_assignments,
  public.load_financials, public.load_detention_evidence to service_role;
grant select, insert on public.load_events, public.load_notes to service_role;

commit;
