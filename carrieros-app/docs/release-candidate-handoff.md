# Transpo.ai release-candidate handoff

This handoff keeps code recovery, development testing, and production release as separate controlled decisions. It does not authorize a merge, database migration, deployment, user invitation, payment, dispatch, message, or production-data change.

## 1. Recover and verify the source

Import the supplied Git bundle into a dedicated local branch, then confirm the bundle and working tree before pushing it to the existing draft pull request branch.

```bash
git bundle verify /path/to/transpo-ai-release-candidate.bundle
git fetch /path/to/transpo-ai-release-candidate.bundle \
  refs/heads/codex/live-dispatch-data:refs/heads/codex/release-candidate
git switch codex/release-candidate
git status --short --branch
```

Do not merge the pull request until the hosted verification checkpoint and controlled development acceptance both pass.

## 2. Reproduce the credential-free checkpoint

From `carrieros-app`, use the declared Node runtime and locked dependencies:

```bash
nvm use
npm ci
npm run verify:testing
```

This command performs structural security tests, TypeScript, ESLint, a production build, unauthenticated fail-closed smoke checks, tracked and reachable-history credential scanning, and a high-severity production dependency audit. It does not connect to Supabase or apply SQL.

## 3. Prepare development only

1. Use the isolated **Transpo.ai Development** Supabase project, never production.
2. Back up development data and independently confirm the project reference.
3. Copy `.env.example` to ignored `.env.local` and enter development credentials locally.
4. Never place credentials in Git, chat, screenshots, tickets, evidence records, or this package.
5. Run `npm run verify:development-target` and stop if any target, configuration, checksum, test, build, smoke, or audit check fails.
6. Review the packaged migration manifest and every migration/rollback file in order.

Applying SQL remains a separate human-approved database action. Never apply production migrations as part of source recovery.

## 4. Complete controlled development acceptance

Create isolated test-company identities for owner, dispatcher, accounting, safety, maintenance, driver, and read-only roles. Follow `docs/testing-handoff.md` across phone, tablet, and desktop widths. Confirm company isolation, driver assignment isolation, financial role boundaries, document approval, dispatch gates, load closure, and read-only Nova behavior.

Copy the sanitized acceptance example into ignored `testing-records/`, complete it with real human results, and verify it against the exact checked-out commit:

```bash
npm run acceptance:verify -- testing-records/development-acceptance.json
npm run provenance:create -- testing-records/release-provenance.json
npm run provenance:verify -- testing-records/release-provenance.json
npm run signoff:verify -- \
  testing-records/development-acceptance.json \
  testing-records/release-provenance.json
```

Do not fabricate acceptance evidence. A passing signoff proves only that fresh development evidence matches the reviewed commit.

## 5. Remaining release decisions

After development acceptance, separately approve and record each of these decisions:

1. Pull-request review and merge.
2. Production project identity and backup confirmation.
3. Production environment and secret configuration.
4. Production migration review and application.
5. Deployment and readiness verification.
6. Limited pilot-user activation and monitored rollback window.

Stop immediately if any company boundary, credential, role, migration, deployment, payment, dispatch, safety, or data-integrity check fails.
