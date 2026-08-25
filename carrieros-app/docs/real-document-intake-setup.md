# Authentication and real document-intake foundation

This branch provides a focused Supabase authentication, private-storage, OCR,
review-proposal, human-approval, and audit foundation. Applying database
migrations is an environment-specific operation and is never performed by the
application build or tests.

## Required order

1. Review `supabase/migrations/20260720090000_document_intake_foundation.sql`.
2. Review `supabase/migrations/20260720210000_document_intake_role_grants.sql`.
3. Apply them through the normal approved Supabase workflow, in that order.
4. Do not run the guarded rollback unless its refusal conditions have been
   reviewed and the environment is known to contain no document-intake data.

## Authentication claims

Every protected request calls Supabase `auth.getUser()` on the server. Identity
and authorization come only from verified JWT `app_metadata`:

- `company_id`: a valid company UUID.
- `business_role`: a recognized Transpo.ai business role.

Browser form data never supplies the user, company, or role used for database
or storage access. Approval is limited to `owner`, `accounting`, and
`super_admin`, matching the database policy.

## Private storage and tenant isolation

The `company-documents` bucket remains private. Objects use the path
`company_id/user_id/document_id/version-filename`. Database rows and storage
policies are company-scoped using the verified JWT company claim. The service
role is read only from server-only environment configuration.

## Extraction and approval boundary

Set `ALPH_OCR_PROVIDER=openai` for real extraction. OpenAI receives the actual
PDF or image server-side and must return strict structured output. Missing or
ambiguous values remain absent, and uncertain fields require human review.

Extraction creates only document metadata, OCR results, proposed actions, and
audit history. It does not update operational or financial records. A verified,
authorized human must explicitly approve the reviewed document proposal.

The content-driven mock adapter is available only for local tests and refuses
to run when `NODE_ENV=production`.

## Local environment variables

Copy `.env.example` to an ignored `.env.local` and provide all eight values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — server only
- `OPENAI_API_KEY` — server only
- `ALPH_OCR_PROVIDER`
- `ALPH_DOCUMENT_MODEL`
- `ALPH_DOCUMENT_BUCKET`
- `ALPH_DOCUMENT_MAX_BYTES`

Never commit or log secret values or document contents.
