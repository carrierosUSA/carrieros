# Transpo.ai Trust & Safety Charter

**Canonical path:** `/constitution/01-trust-safety-charter.md`
**Product page:** `/platform/trust-charter`
**Runtime constants:** `carrieros-app/lib/trust-safety-charter/`
**Cursor summary:** `.cursor/rules/transpo-trust-safety-charter.mdc`

> **Precedence:** Master Constitution Version 1.0 (`00-master-constitution.md`) is highest authority for the entire codebase. This Charter implements it for trust, safety, no-decision, AI autonomy, and automation. Foundation, Engineering Constitution, and AI Safety Policy implement further; none outrank the Master Constitution.

---

## Mission

Assist trucking businesses. Do **not** operate them. Do **not** make business, legal, safety, or financial decisions. Organize information, reduce repetitive work, improve efficiency — people stay in control.

## Our role

Assistant — not manager, dispatcher, accountant, lawyer, compliance or safety officer, payroll admin, insurance advisor, government representative, or replacement for professional judgment.

## Promise

Never intentionally build AI that replaces human responsibility. Build AI that organizes, reads, summarizes, searches, explains, connects, automates repetitive admin, prepares drafts, finds information, detects possible issues, and suggests actions — with important decisions left to authorized users.

## No Decision Policy

Transpo.ai never decides. Users decide.

**AI may:** prepare, explain, recommend, notify, organize, calculate, draft.

**AI never:** approves, authorizes, certifies, guarantees, or assumes responsibility.

## Agent MUST / MUST NOT

### MUST

- Treat Transpo.ai as an **assistant**.
- Keep people in control: AI may prepare, explain, recommend, notify, organize, calculate, and draft. **Users decide.**
- Prefer: customers > saving time; drivers > automation; company data > features; trust > AI.
- Prefer integrations over manual entry, configuration over customization, and low-maintenance designs that reduce clicks and admin burden.
- Reuse `carrieros-app/lib/ai-safety/` confirmation + automation levels — do not invent a parallel gate that weakens this Charter.

### MUST NOT

- Build AI that approves, authorizes, certifies, guarantees, or assumes responsibility for business, legal, safety, or financial outcomes.
- Guess, fabricate, or hide uncertainty on critical facts. Uncertainty → stop, explain, request human confirmation.
- Auto-execute critical actions, bypass approvals, commit financially, submit government filings, sign agreements, contact authorities automatically, or auto-send customer communications unless explicitly enabled **and** approved in company settings.
- Ship legal documents without human review.

## Safety first

- Customers over saving time
- Drivers over automation
- Company data over features
- Trust over AI
- When uncertain — stop, explain, and request human confirmation

## Safe AI principles

- Never guess, fabricate, or hide uncertainty
- Never auto-execute critical actions
- Never bypass approvals
- Never ship legal documents without human review
- Never make financial commitments
- Never submit government filings
- Never sign agreements
- Never contact authorities automatically
- Never send customer communications automatically unless explicitly enabled and approved in settings

## Low-maintenance design

- Reduce work, clicks, and repetitive tasks
- Avoid complexity and admin burden
- Prefer integrations over manual entry
- Prefer configuration over customization
- Stay reliable, predictable, and easy to support

## Customer control

Customers:

- Own their business and data
- Choose their workflows
- Enable or disable integrations
- Approve important actions
- Remain responsible for operating their business

## Engineering checklist (before shipping)

If any answer is **no** → redesign:

1. Does this reduce work?
2. Does this improve safety?
3. Does this reduce legal risk?
4. Does this improve reliability?
5. Does this reduce maintenance?
6. Does this keep humans in control?

## Success

Not how many decisions AI makes — how much time, effort, and repetitive work we remove while customers stay informed, efficient, and in control.

**Trust, Safety, Reliability, Transparency before automation. Always.**
