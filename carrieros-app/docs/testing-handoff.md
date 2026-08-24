# Transpo.ai controlled testing handoff

This checklist prepares the current MVP for testing. It does not authorize a merge, deployment, production database change, invitation, real payment, dispatch, cargo decision, or equipment movement.

## 1. Verify the code without credentials

Use Node.js 22 (`nvm use`) and run:

```bash
npm ci
npm run verify:testing
```

The command checks the locked dependency install, reviewed migration/rollback set, automated security tests, TypeScript, ESLint, production build, and high-severity production dependency audit. It does not connect to Supabase or apply SQL.

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
2. Upload a sanitized rate confirmation; review extracted fields and explicitly approve corrections.
3. Create a pending load from the approved current document.
4. Link a verified broker and assign a verified current driver, truck and trailer.
5. Confirm dispatch release stays blocked until all human and safety gates are satisfied.
6. Record stop updates from the correct role; confirm other drivers cannot access the load.
7. Link current approved POD and invoice evidence before closure.
8. Record an invoice, partial payment and final payment; confirm overpayment and unauthorized roles are blocked.
9. Test fleet, driver compliance, maintenance, expenses, payroll, IFTA, claims, inventory, facilities and reefer evidence with sanitized facts.
10. Confirm Schedule, Alerts, Analytics, P&L, Lane Performance, Broker Performance and Year-End Records preserve missing data instead of inventing zero.
11. Confirm Nova is read-only and never performs a mutation, outreach, payment, dispatch, liability or safety decision.
12. Repeat essential views at phone, tablet and desktop widths.

## 5. Stop conditions

Stop testing and preserve evidence if company isolation fails, a driver sees another driver’s work, a financial role boundary fails, a mutation happens without explicit confirmation, a secret appears in browser/log output, a migration differs from the reviewed file, or any test/build/audit command fails.

Production remains blocked until controlled development testing is signed off and merge, migration and deployment are each separately approved.
