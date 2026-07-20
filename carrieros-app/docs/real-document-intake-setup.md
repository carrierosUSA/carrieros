# Real AI document intake setup

Status: application foundation implemented; migration generated but **not applied**.

## Prerequisites

1. Review `supabase/migrations/20260720090000_document_intake_foundation.sql` with database, IAM, and security owners.
2. Ensure authenticated Supabase JWTs contain the authorized `company_id` claim. The RLS policies do not trust a company supplied by the browser.
3. Apply the migration through the normal reviewed Supabase migration workflow. This creates a private `company-documents` bucket; never make it public.
4. Copy `.env.example` to a non-committed local environment file and replace placeholders. Keep service-role and OpenAI keys server-only.

## Storage path and isolation

Objects use `company_id/user_id/document_id/version-filename`. Bucket policies require the JWT company and user to match the first two path segments. Database rows are isolated by the JWT `company_id` claim.

## Extraction

Set `ALPH_OCR_PROVIDER=openai`. The adapter sends the actual PDF/image bytes to the OpenAI Responses API and requires strict structured output. Missing values must remain absent; low confidence stays in review. `mock` is content-driven and allowed only outside production for local tests.

## Approval boundary

Extraction persists proposed actions only. `document_proposed_actions.requires_approval` defaults to true. Approval records are explicit and audit history is append-oriented. Existing load/invoice execution continues through the Alph approval system; database triggers or background jobs must never execute proposed actions automatically.

## Required credentials

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `OPENAI_API_KEY` (server only)

No migration or production-data operation is performed by application build or tests.
