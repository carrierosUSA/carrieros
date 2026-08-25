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
npm run security:scan
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

Both testing and release checkpoints scan current Git-tracked text and every unique blob reachable in the checked-out branch history for high-risk private-key and provider-credential patterns. Findings fail closed with only the path and credential class printed; matched values are never emitted. Any real finding must be removed from history as appropriate and rotated before work continues.

Development acceptance signoff is accepted only for the exact currently checked-out full Git commit and a canonical UTC test timestamp no more than seven days old. A stale, future, malformed, or different-build record fails closed without printing the recorded commit, timestamp, or evidence values.

Acceptance evidence uses an exact allowlisted schema at the record and result-group levels. Unexpected root fields, roles, flows, viewports, or stop-condition keys fail closed instead of being silently retained.

`npm run provenance:create` produces an ignored, value-free release provenance record only from a clean tracked worktree. `npm run provenance:verify -- testing-records/release-provenance.json` binds the exact commit to the Node runtime, dependency lockfile, ordered migration set and pinned CI workflow; any mismatch fails closed. It does not merge, deploy, apply SQL or claim human acceptance.

GitHub pull requests to `main` and pushes to `codex/live-dispatch-data` run the same credential-free checkpoint automatically on the declared Node 22 runtime. CI has read-only repository permission, pins its third-party actions to reviewed immutable commit revisions, and performs no migration, deployment, merge, or production action.

After the complete checkpoint succeeds, CI creates and immediately verifies the same value-free provenance record against its clean checkout. The ignored evidence remains job-local and is not uploaded, published or treated as deployment approval.

Dependabot checks npm and GitHub Actions weekly. Updates are grouped with strict open-PR limits and still require the normal human review and verified checkpoint; no automatic merge or deployment is configured.

Every new pull request receives a controlled review checklist covering locked installation, the full verified checkpoint, regression evidence, data handling, company and role isolation, human authority, rollback, and separately approved database or production actions.

The development preflight requires an explicit `TRANSPO_ENVIRONMENT=development` marker and exact `TRANSPO_EXPECTED_SUPABASE_PROJECT_REF` match. Runtime readiness also rejects malformed project URLs, placeholders, unsafe bucket names, public secret aliases, and identical anonymous/service credentials. Validation never prints credentials or contacts the database.

After a separately approved deployment, infrastructure may probe `GET` or `HEAD /api/health` for process liveness and `/api/readiness` for value-free configuration readiness. Health always returns only `{ "status": "ok" }`; readiness returns `{ "status": "ready" }` with 200 or `{ "status": "not_ready" }` with 503. Both are non-cacheable and non-indexable, disclose no configuration details, and do not inspect users or database state.

Global response policy denies framing, embedded objects, external form targets and unsafe base URLs; it also disables DNS prefetch and isolates top-level browser windows without restricting the reviewed application resource pipeline.

Production responses require year-long HTTPS transport, same-origin resource use, and deny unused camera, microphone, geolocation, payment, USB, and serial browser capabilities. HSTS deliberately excludes unverified subdomain and preload claims.

The private operations workspace globally emits no-index/no-follow/no-archive/no-preview policy through both response headers and page metadata. Search engines must not index login, authenticated operations, health states, or application content.

Every matched application response and authentication redirect is private, no-store, immediately expired, and must revalidate. Versioned Next.js static assets remain outside that policy so secure browser caching does not degrade the application bundle.

Each application request receives a fresh server-generated UUID response identifier for privacy-safe incident correlation. Client-supplied request IDs are never trusted or reflected, no request values are logged, and static assets remain outside the identifier path.

The automated security inventory fails whenever a new page or API route is neither protected by the centralized application prefixes nor included in the exact minimal proxy-bypass list.

That command validates required configuration without printing credentials, rejects known public-secret aliases and non-production OCR, then runs the security suite, TypeScript, ESLint, the production build, and a production-dependency vulnerability audit.

## Database safety

SQL files under `supabase/migrations` are reviewed migration artifacts; adding them to git does not apply them. Corresponding guarded rollback files are under `supabase/rollback`. Applying a migration, merging a pull request, deploying, sending an invitation, or changing a real user role remains a separate human-approved operation.

The team access queue prepares auditable seven-day invitation or role-change requests only. It never sends email, creates accounts, or changes permissions.

## Operational boundary

Transpo.ai never fabricates equipment, location, driver-hours, authority, insurance, cargo, document, tracking, tax, or payment facts. Nova is read-only. Drivers and carriers retain safety, movement, equipment, dispatch-release, and financial approval authority.
