# Transpo.ai controlled testing handoff

This checklist prepares the current MVP for testing. It does not authorize a merge, deployment, production database change, invitation, real payment, dispatch, cargo decision, or equipment movement.

## 1. Verify the code without credentials

Use Node.js 22 (`nvm use`) and run:

```bash
npm ci
npm run verify:testing
```

The command checks the locked dependency install, reviewed migration/rollback set, current Git-tracked source and reachable branch history for high-risk credential patterns, automated security tests, TypeScript, ESLint, production build, unauthenticated fail-closed route and security-header smoke checks, and high-severity production dependency audit. The source scan never prints matched values. The smoke server binds only to `127.0.0.1` and removes external credentials. It does not connect to Supabase or apply SQL.

## 2. Prepare a development-only environment

1. Use the **Transpo.ai Development** Supabase project—not production.
2. Back up the development database and confirm its project reference before any SQL review.
3. Copy `.env.example` to `.env.local`; enter development values locally. Never paste credentials into chat, Git, screenshots, tickets, or test notes.
4. Set `TRANSPO_ENVIRONMENT=development` and `TRANSPO_EXPECTED_SUPABASE_PROJECT_REF` to the exact development project reference, then run `npm run preflight:development`.
5. Run `npm run migration:manifest` and retain the reviewed filename/checksum output with the test record.
6. Review migrations in timestamp order. Applying any migration remains a separate human-approved database action.
7. Stop if target preflight fails, a migration fails, the project identity is uncertain, or existing development data conflicts. Do not skip ahead or apply rollback SQL automatically.

## 3. Create isolated test identities

Each test user needs verified `app_metadata.company_id` and one `business_role`. Use a test company only.

| Role | Expected access |
| --- | --- |
| `owner` / `super_admin` | Full approved company workflows |
| `dispatcher` | Dispatch, schedule, brokers, facilities and assigned operational records; no owner-only team control |
| `accounting` | Finance, invoices, payments, expenses, payroll, IFTA and reports; no dispatch release |
| `safety` | Drivers, fleet safety, maintenance, compliance, incidents and reefer evidence |
| `maintenance` | Fleet maintenance and inventory within its guarded scope |
| `driver` | Only the driver portal, own active assignments and own reefer evidence |
| `read_only` | Permitted factual views with no mutations |

Confirm that missing company metadata, unknown roles and cross-company records fail closed.

## 4. Critical acceptance flow

Record the tester, role, timestamp and result for every step.

1. Sign in and confirm company/role isolation.
2. Confirm `GET` and `HEAD /api/health` return 200, while `/api/readiness` returns 200 only when the value-free configuration gate is satisfied. Neither endpoint may expose configuration or dependency details.
3. Upload a sanitized rate confirmation; review extracted fields and explicitly approve corrections.
4. Create a pending load from the approved current document.
5. Link a verified broker and assign a verified current driver, truck and trailer.
6. Confirm dispatch release stays blocked until all human and safety gates are satisfied.
7. Record stop updates from the correct role; confirm other drivers cannot access the load.
8. Link current approved POD and invoice evidence before closure.
9. Record an invoice, partial payment and final payment; confirm overpayment and unauthorized roles are blocked.
10. Test fleet, driver compliance, maintenance, expenses, payroll, IFTA, claims, inventory, facilities and reefer evidence with sanitized facts.
11. Confirm Schedule, Alerts, Analytics, P&L, Lane Performance, Broker Performance and Year-End Records preserve missing data instead of inventing zero.
12. Confirm Nova is read-only and never performs a mutation, outreach, payment, dispatch, liability or safety decision.
13. Repeat essential views at phone, tablet and desktop widths.

## 5. Stop conditions

Stop testing and preserve evidence if company isolation fails, a driver sees another driver’s work, a financial role boundary fails, a mutation happens without explicit confirmation, a secret appears in browser/log output, a migration differs from the reviewed file, or any test/build/audit command fails.

Production remains blocked until controlled development testing is signed off and merge, migration and deployment are each separately approved.

## 6. Verify the local acceptance record

Copy `docs/development-acceptance-record.example.json` into the ignored `testing-records/` directory, fill it with sanitized results only, and run:

```bash
npm run acceptance:verify -- testing-records/development-acceptance.json
```

The verifier requires every role, critical flow, viewport and stop-condition boundary to pass. It binds the record to the exact currently checked-out 40-character Git commit and requires a canonical UTC timestamp no more than seven days old, so stale, future, or different-build signoff fails closed. The record and every result group use an exact allowlisted schema; unexpected fields, production records, incomplete checkpoints and sensitive field names are rejected. It prints counts only. Keep the record local unless a separately approved secure evidence location is provided.

## 7. Bind the reviewed release inputs

After the reviewed commit is checked out with a clean tracked worktree, create and immediately verify a local provenance record:

```bash
npm run provenance:create
npm run provenance:verify -- testing-records/release-provenance.json
```

The ignored record binds the exact commit to the Node runtime, lockfile, ordered migration set and pinned CI workflow using SHA-256. Creation fails if tracked files are dirty, refuses to overwrite an existing record and cannot write outside `testing-records/`. Verification fails if any bound input changes. The record contains hashes and value-free metadata only; it does not claim that human acceptance, deployment or database work occurred.

The read-only GitHub checkpoint performs this create-and-verify pair only after all credential-free checks pass. Its ignored record is ephemeral job evidence: no artifact upload, publication, deployment or production approval is implied.
