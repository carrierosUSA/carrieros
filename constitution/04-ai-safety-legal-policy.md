# Transpo.ai AI Safety & Legal Policy

**Canonical path:** `/constitution/04-ai-safety-legal-policy.md`
**Product page:** `/platform/ai-policy`
**Settings:** `/settings/ai-policy`
**Runtime implementation:** `carrieros-app/lib/ai-safety/`
**Cursor:** summarized via constitution folder rule + engineering/charter rules

> Governed by the Master Constitution Version 1.0 (highest authority), then Trust & Safety Charter. Engineering Constitution implements day-to-day principles. This document defines product AI controls. **Alph assists. You decide.**

---

## Philosophy

- Empower professionals — not replace them.
- AI assists. Humans decide.
- Safety, compliance, and trust come before automation.

## What AI may do

- Read, extract, summarize, and organize documents
- Suggest payroll, invoices, detention, maintenance, dispatch, fuel, and routes
- Detect unusual activity and missing documents
- Explain data and generate reports
- Translate and answer questions
- Prepare drafts and recommend actions

## What AI must never do on its own

- Make legal decisions
- Make employment decisions without human approval
- Approve or deny payroll
- Approve invoices, settlements, maintenance, or safety violations automatically
- Fire or discipline anyone
- Accept or reject freight
- Sign contracts
- Submit government filings, taxes, or compliance reports automatically
- Make financial decisions without confirmation
- Contact customers or government automatically unless authorized
- Change critical business records without approval

## Confirmation categories

Domains that always require human confirmation before execution:

| Category | Label |
|----------|-------|
| `money` | Money |
| `payroll` | Payroll |
| `safety` | Safety |
| `compliance` | Compliance |
| `legal` | Legal |
| `customer_relationships` | Customer relationships |
| `government_reporting` | Government reporting |
| `employment` | Employment |
| `contracts` | Contracts |
| `business_records` | Business records |

Implementation: `lib/ai-safety/confirmation.ts`, `lib/ai-safety/policy.ts`.

## Automation levels

Reuse `lib/ai-safety/automation-levels.ts`. Do not invent a parallel gate that weakens the Charter.

- Low-risk admin: automatable only when the company explicitly enables it.
- Medium-risk: human approval before execution.
- High-risk domains: never auto-execute.

## Safety first

If data is uncertain, conflicting, or insufficient — Alph asks for clarification. It does not guess.

## Confidence

Align with `lib/ai-safety/confidence`:

- High
- Review recommended
- Needs human verification

Low confidence → do not auto-act; ask.

## Transparency

Users must know:

- What AI did
- What it suggested
- Why it suggested it
- What data it used
- Whether approval is still required

## Auditability

Important AI and automation actions record:

- user
- AI action
- suggestion
- approval
- time
- reason
- previous value
- new value

Implementation: `lib/ai-safety/audit.ts`. Suggested-action runner: `lib/ai-safety/run-suggested-action.ts`.

## Professional responsibility

Not legal or tax advice. Does not replace accountants, attorneys, safety, or compliance professionals. UI copy and Alph responses stay assistive, not authoritative counsel.

## Customer control

Customers can configure AI policy in settings, approve important actions, export data, and disable AI/automation. See `lib/ai-safety/settings.ts`.

## Cross-links

| Document | Canonical | Product |
|----------|-----------|---------|
| Master Constitution v1.0 | `/constitution/00-master-constitution.md` | `/platform/governance` |
| Trust & Safety Charter | `/constitution/01-trust-safety-charter.md` | `/platform/trust-charter` |
| Foundation | `/constitution/02-foundation.md` | `/platform/foundation` |
| Engineering Constitution | `/constitution/03-engineering-constitution.md` | `/platform/constitution` |
| This policy | `/constitution/04-ai-safety-legal-policy.md` | `/platform/ai-policy` |
