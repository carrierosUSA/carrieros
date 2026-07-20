-- Transpo.ai real AI document intake foundation.
-- GENERATED ONLY: do not apply without database/security review.

create extension if not exists pgcrypto;

create or replace function public.current_company_id()
returns uuid language sql stable as $$
  select nullif(auth.jwt() -> 'app_metadata' ->> 'company_id', '')::uuid
$$;

create table public.documents (
  id uuid primary key default gen_random_uuid(), company_id uuid not null,
  created_by uuid not null, title text not null, filename text not null,
  mime_type text not null check (mime_type in ('application/pdf','image/jpeg','image/png')),
  size_bytes bigint not null check (size_bytes > 0), checksum_sha256 text not null,
  document_type text not null default 'unknown' check (document_type in ('rate_confirmation','bol','pod','lumper_receipt','fuel_receipt','invoice','unknown')),
  status text not null default 'processing' check (status in ('processing','needs_review','ready','failed','duplicate','unsupported','archived')),
  current_version_id uuid, storage_provider text not null default 'supabase',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (company_id, checksum_sha256), unique (company_id, id)
);

create table public.document_versions (
  id uuid primary key default gen_random_uuid(), company_id uuid not null,
  document_id uuid not null,
  version_number integer not null check (version_number > 0), storage_bucket text not null,
  storage_path text not null, filename text not null, mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0), checksum_sha256 text not null,
  created_by uuid not null, created_at timestamptz not null default now(),
  unique (document_id, version_number), unique (storage_bucket, storage_path),
  unique (company_id, id),
  constraint document_versions_document_company_fk
    foreign key (company_id, document_id) references public.documents(company_id, id) on delete cascade
);
alter table public.documents add constraint documents_current_version_fk
  foreign key (company_id, current_version_id) references public.document_versions(company_id, id);

create table public.document_ocr_results (
  id uuid primary key default gen_random_uuid(), company_id uuid not null,
  document_id uuid not null, document_version_id uuid not null,
  provider text not null, model_id text not null, prompt_version text not null,
  status text not null check (status in ('processing','completed','needs_review','failed')),
  classified_type text not null default 'unknown', overall_confidence numeric(5,4) not null default 0 check (overall_confidence between 0 and 1),
  raw_text text not null default '', fields jsonb not null default '[]'::jsonb,
  error_code text, error_message text, created_at timestamptz not null default now(), completed_at timestamptz,
  unique (company_id, id),
  constraint document_ocr_document_company_fk
    foreign key (company_id, document_id) references public.documents(company_id, id) on delete cascade,
  constraint document_ocr_version_company_fk
    foreign key (company_id, document_version_id) references public.document_versions(company_id, id) on delete cascade
);

create table public.document_ocr_fields (
  id uuid primary key default gen_random_uuid(), company_id uuid not null,
  ocr_result_id uuid not null,
  field_key text not null, label text not null, value_text text not null default '',
  confidence numeric(5,4) not null check (confidence between 0 and 1),
  is_verified boolean not null default false, verified_by uuid, verified_at timestamptz,
  unique (ocr_result_id, field_key),
  constraint document_ocr_fields_result_company_fk
    foreign key (company_id, ocr_result_id) references public.document_ocr_results(company_id, id) on delete cascade
);

create table public.document_proposed_actions (
  id uuid primary key default gen_random_uuid(), company_id uuid not null,
  document_id uuid not null, ocr_result_id uuid, action_kind text not null,
  summary text not null, payload jsonb not null default '{}'::jsonb,
  confidence numeric(5,4) not null check (confidence between 0 and 1),
  status text not null default 'pending' check (status in ('pending','approved','rejected','executed','superseded')),
  requires_approval boolean not null default true, created_by uuid not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (company_id, id),
  constraint document_actions_document_company_fk
    foreign key (company_id, document_id) references public.documents(company_id, id) on delete cascade,
  constraint document_actions_ocr_company_fk
    foreign key (company_id, ocr_result_id) references public.document_ocr_results(company_id, id)
);

create table public.document_approvals (
  id uuid primary key default gen_random_uuid(), company_id uuid not null,
  proposed_action_id uuid not null,
  decision text not null check (decision in ('approved','rejected')),
  decided_by uuid not null, decision_note text, decided_at timestamptz not null default now(),
  unique (proposed_action_id),
  constraint document_approvals_action_company_fk
    foreign key (company_id, proposed_action_id) references public.document_proposed_actions(company_id, id)
);

create table public.document_audit_history (
  id uuid primary key default gen_random_uuid(), company_id uuid not null,
  document_id uuid, proposed_action_id uuid,
  actor_user_id uuid not null, event_type text not null, detail text not null,
  before_state jsonb, after_state jsonb, request_id text,
  created_at timestamptz not null default now(),
  constraint document_audit_document_company_fk
    foreign key (company_id, document_id) references public.documents(company_id, id) on delete set null (document_id),
  constraint document_audit_action_company_fk
    foreign key (company_id, proposed_action_id) references public.document_proposed_actions(company_id, id) on delete set null (proposed_action_id)
);

create index documents_company_status_idx on public.documents(company_id, status, created_at desc);
create index document_versions_company_document_idx on public.document_versions(company_id, document_id);
create index document_ocr_company_status_idx on public.document_ocr_results(company_id, status, created_at desc);
create index document_actions_company_status_idx on public.document_proposed_actions(company_id, status, created_at desc);
create index document_audit_company_document_idx on public.document_audit_history(company_id, document_id, created_at desc);

alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.document_ocr_results enable row level security;
alter table public.document_ocr_fields enable row level security;
alter table public.document_proposed_actions enable row level security;
alter table public.document_approvals enable row level security;
alter table public.document_audit_history enable row level security;

do $$ declare t text; begin
  foreach t in array array['documents','document_versions','document_ocr_results','document_ocr_fields','document_proposed_actions','document_approvals','document_audit_history'] loop
    execute format('create policy %I on public.%I for select using (company_id = public.current_company_id())', t || '_company_select', t);
  end loop;
end $$;

-- Metadata, extraction, proposed actions, and audit writes are server-only.
-- Only an authorized authenticated human may insert a decision; decisions and
-- audit rows have no UPDATE/DELETE policy and therefore remain append-only.
create policy document_approvals_authorized_insert on public.document_approvals
for insert with check (
  company_id = public.current_company_id()
  and auth.uid() = decided_by
  and coalesce(auth.jwt() -> 'app_metadata' ->> 'business_role', '') in ('owner','accounting','super_admin')
  and exists (
    select 1 from public.document_proposed_actions action
    where action.id = document_approvals.proposed_action_id
      and action.company_id = document_approvals.company_id
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('company-documents','company-documents',false,15728640,array['application/pdf','image/jpeg','image/png'])
on conflict (id) do update set public=false, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;

create policy company_documents_read on storage.objects for select using (
  bucket_id='company-documents' and (storage.foldername(name))[1] = public.current_company_id()::text
);
create policy company_documents_insert on storage.objects for insert with check (
  bucket_id='company-documents' and auth.uid() is not null
  and (storage.foldername(name))[1] = public.current_company_id()::text
  and (storage.foldername(name))[2] = auth.uid()::text
);
create policy company_documents_update on storage.objects for update using (
  bucket_id='company-documents' and (storage.foldername(name))[1] = public.current_company_id()::text
  and owner_id = auth.uid()::text
) with check ((storage.foldername(name))[1] = public.current_company_id()::text and owner_id = auth.uid()::text);
create policy company_documents_delete on storage.objects for delete using (
  bucket_id='company-documents' and (storage.foldername(name))[1] = public.current_company_id()::text
  and owner_id = auth.uid()::text
);
