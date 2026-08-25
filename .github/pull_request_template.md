## Change summary

Describe the user-visible or operational change and why it is needed.

## Scope

- Routes/modules changed:
- Database artifacts changed:
- Security or role boundaries changed:

## Verified checkpoint

- [ ] `npm ci` completed from the committed lockfile.
- [ ] `npm run verify:testing` passed.
- [ ] New or changed behavior has regression coverage.
- [ ] No credentials, customer data, driver data, documents, or operational values were committed or logged.

## Human-control review

- [ ] The change does not invent freight, equipment, location, safety, compliance, financial, tax, insurance, or document facts.
- [ ] Nova remains assistive and read-only.
- [ ] Dispatch release, money movement, user access, and production actions remain human authorized.
- [ ] Company isolation and role boundaries were reviewed for every affected read and write.

## Separately approved actions

Check every statement that is true for this pull request:

- [ ] No database migration was applied.
- [ ] No deployment or production configuration was changed.
- [ ] No pull request was merged and no real user or role was changed.
- [ ] If any statement above is false, the exact action and separate human approval are documented below.

Approval reference or `Not required`:

## Rollback and evidence

- Rollback or disable path:
- Sanitized validation evidence:
- Known limitations or follow-up work:
