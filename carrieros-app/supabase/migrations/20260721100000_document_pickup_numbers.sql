-- Ordered, repeatable pickup identifiers for authenticated document review.
-- GENERATED ONLY: do not apply without explicit development approval.

begin;

-- Supports a company- and document-aware child key so an OCR result from a
-- different document can never be attached to a pickup-number row.
alter table public.document_ocr_results
  add constraint document_ocr_results_company_document_id_unique
  unique (company_id, document_id, id);

create table public.document_pickup_numbers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  document_id uuid not null,
  ocr_result_id uuid not null,
  value_text text not null,
  label text,
  pickup_stop_id text,
  pickup_stop_reference text,
  display_order integer not null check (display_order >= 0),
  confidence numeric(5,4) not null default 0 check (confidence between 0 and 1),
  stop_association_confidence numeric(5,4) not null default 0
    check (stop_association_confidence between 0 and 1),
  requires_human_verification boolean not null default true,
  requires_stop_review boolean not null default true,
  source text not null check (source in ('ocr', 'manual')),
  is_removed boolean not null default false,
  is_verified boolean not null default false,
  verified_by uuid,
  verified_at timestamptz,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, id),
  constraint document_pickup_numbers_value_nonempty
    check (
      char_length(value_text) between 1 and 500
      and char_length(btrim(value_text)) > 0
    ),
  constraint document_pickup_numbers_label_length
    check (label is null or char_length(label) <= 120),
  constraint document_pickup_numbers_stop_id_length
    check (pickup_stop_id is null or char_length(pickup_stop_id) <= 200),
  constraint document_pickup_numbers_stop_reference_length
    check (
      pickup_stop_reference is null
      or char_length(pickup_stop_reference) <= 500
    ),
  constraint document_pickup_numbers_verification_consistent
    check (
      (
        is_verified = false
        and verified_by is null
        and verified_at is null
      )
      or (
        is_verified = true
        and verified_by is not null
        and verified_at is not null
      )
    ),
  constraint document_pickup_numbers_document_company_fk
    foreign key (company_id, document_id)
      references public.documents(company_id, id) on delete cascade,
  constraint document_pickup_numbers_ocr_document_company_fk
    foreign key (company_id, document_id, ocr_result_id)
      references public.document_ocr_results(company_id, document_id, id)
      on delete cascade
);

create unique index document_pickup_numbers_active_order_idx
  on public.document_pickup_numbers(ocr_result_id, display_order)
  where is_removed = false;

-- Prevent only exact normalized repeats. The same visible value remains valid
-- when its label or explicit pickup-stop association is different.
create unique index document_pickup_numbers_exact_active_dedupe_idx
  on public.document_pickup_numbers (
    ocr_result_id,
    lower(regexp_replace(btrim(value_text), '[[:space:]]+', ' ', 'g')),
    lower(regexp_replace(btrim(coalesce(label, '')), '[[:space:]]+', ' ', 'g')),
    lower(regexp_replace(btrim(coalesce(pickup_stop_id, '')), '[[:space:]]+', ' ', 'g')),
    lower(regexp_replace(btrim(coalesce(pickup_stop_reference, '')), '[[:space:]]+', ' ', 'g'))
  )
  where is_removed = false;

create index document_pickup_numbers_company_document_idx
  on public.document_pickup_numbers(company_id, document_id, display_order)
  where is_removed = false;

alter table public.document_pickup_numbers enable row level security;

create policy document_pickup_numbers_company_select
  on public.document_pickup_numbers
  for select
  to authenticated
  using (company_id = public.current_company_id());

-- OCR and review mutations remain server-only. Authenticated users can read
-- only their verified app_metadata company through RLS. No browser write
-- policy is created, and no DELETE privilege is granted; removals are retained
-- as audited soft removals.
revoke all privileges on table public.document_pickup_numbers
  from anon, authenticated, service_role;
grant select on table public.document_pickup_numbers to authenticated;
grant select, insert, update on table public.document_pickup_numbers
  to service_role;

comment on column public.document_pickup_numbers.pickup_stop_id is
  'Optional application stop identifier set only by human-reviewed linking; OCR never invents it.';
comment on column public.document_pickup_numbers.pickup_stop_reference is
  'Document-visible stop description. It is not a foreign key because operational load stops are not yet persisted in Supabase.';

commit;
