# Transpo.ai CarrierOS

Authenticated carrier operations workspace built with Next.js 16 and Supabase. The current verified modules cover command center, dispatch, schedule, mobile Driver Portal, documents/OCR review, brokers and broker performance, facilities, service providers, fleet, drivers, maintenance, compliance, incidents, reefer evidence, inventory, finance and printable invoices, expenses, payroll, Fuel & IFTA, truck P&L, lane performance, year-end records, analytics, alerts, company settings, owner-controlled team access, and Nova read-only guidance.

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
npm run smoke:unauthenticated
```

Before a release, load the intended deployment environment and run:

```bash
npm run verify:release
```

For a credential-free testing checkpoint, run `npm run verify:testing`. Before any separately approved development-database action, run `npm run preflight:development` and `npm run migration:manifest`; `npm run verify:development-target` combines those guards with the full testing checkpoint. Follow [docs/testing-handoff.md](docs/testing-handoff.md) for the controlled activation sequence.

GitHub pull requests to `main` and pushes to `codex/live-dispatch-data` run the same credential-free checkpoint automatically on the declared Node 22 runtime. CI has read-only repository permission and performs no migration, deployment, merge, or production action.

The development preflight requires an explicit `TRANSPO_ENVIRONMENT=development` marker and exact `TRANSPO_EXPECTED_SUPABASE_PROJECT_REF` match. Runtime readiness also rejects malformed project URLs, placeholders, unsafe bucket names, public secret aliases, and identical anonymous/service credentials. Validation never prints credentials or contacts the database.

After a separately approved deployment, infrastructure may probe `GET` or `HEAD /api/health` for process liveness and `/api/readiness` for value-free configuration readiness. Health always returns only `{ "status": "ok" }`; readiness returns `{ "status": "ready" }` with 200 or `{ "status": "not_ready" }` with 503. Both are non-cacheable and non-indexable, disclose no configuration details, and do not inspect users or database state.

Global response policy denies framing, embedded objects, external form targets and unsafe base URLs; it also disables DNS prefetch and isolates top-level browser windows without restricting the reviewed application resource pipeline.

The automated security inventory fails whenever a new page or API route is neither protected by the centralized application prefixes nor included in the exact minimal proxy-bypass list.

That command validates required configuration without printing credentials, rejects known public-secret aliases and non-production OCR, then runs the security suite, TypeScript, ESLint, the production build, and a production-dependency vulnerability audit.

## Database safety

SQL files under `supabase/migrations` are reviewed migration artifacts; adding them to git does not apply them. Corresponding guarded rollback files are under `supabase/rollback`. Applying a migration, merging a pull request, deploying, sending an invitation, or changing a real user role remains a separate human-approved operation.

The team access queue prepares auditable seven-day invitation or role-change requests only. It never sends email, creates accounts, or changes permissions.

## Operational boundary

Transpo.ai never fabricates equipment, location, driver-hours, authority, insurance, cargo, document, tracking, tax, or payment facts. Nova is read-only. Drivers and carriers retain safety, movement, equipment, dispatch-release, and financial approval authority.
