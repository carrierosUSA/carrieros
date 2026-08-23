# Transpo.ai CarrierOS

Authenticated carrier operations workspace built with Next.js 16 and Supabase. The current verified modules cover dispatch, documents, fleet, drivers, maintenance, finance, payroll, analytics, an in-app Alert Center, Fuel & IFTA evidence, company settings, Nova read-only guidance, and an owner-controlled team access queue.

## Local development

1. Copy `.env.example` to `.env.local` and replace every placeholder.
2. Install the locked dependencies with `npm ci`.
3. Run `npm run dev` and open `http://localhost:3000`.

The app fails closed when Supabase coordinates or authenticated `company_id` / `business_role` app metadata are missing.

## Validation

Run individual checks during development:

```bash
npm run test:document-intake
npm run typecheck
npm run lint
npm run build
```

Before a release, load the intended deployment environment and run:

```bash
npm run verify:release
```

That command validates required configuration without printing credentials, rejects known public-secret aliases and non-production OCR, then runs the security suite, TypeScript, ESLint, the production build, and a production-dependency vulnerability audit.

## Database safety

SQL files under `supabase/migrations` are reviewed migration artifacts; adding them to git does not apply them. Corresponding guarded rollback files are under `supabase/rollback`. Applying a migration, merging a pull request, deploying, sending an invitation, or changing a real user role remains a separate human-approved operation.

The team access queue prepares auditable seven-day invitation or role-change requests only. It never sends email, creates accounts, or changes permissions.

## Operational boundary

Transpo.ai never fabricates equipment, location, driver-hours, authority, insurance, cargo, document, tracking, tax, or payment facts. Nova is read-only. Drivers and carriers retain safety, movement, equipment, dispatch-release, and financial approval authority.
