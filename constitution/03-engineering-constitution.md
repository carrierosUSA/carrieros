# Transpo.ai Engineering Constitution

**Canonical path:** `/constitution/03-engineering-constitution.md`
**Product page:** `/platform/constitution`
**Runtime constants:** `carrieros-app/lib/engineering-constitution/`
**Cursor summary:** `.cursor/rules/transpo-engineering-constitution.mdc`

> Implements the Master Constitution Version 1.0 and Trust & Safety Charter. Does not outrank either. Governs AI, automation, approvals, safety, compliance, security, transparency, and data-ownership decisions below Master Constitution, Charter, and Foundation.

**Mission:** trust > automation · accuracy > speed · safety > convenience · AI helps people; it does not replace responsibility.

---

## 1. Humans remain in control

AI is **never** the decision-maker for money, employment, safety, compliance, legal, taxes, government reporting, insurance, contracts, customers, drivers, or company records.

- **MUST** require explicit human approval before executing those domains.
- **MUST NOT** auto-approve payroll, invoices, settlements, filings, contracts, hiring/firing, freight accept/reject, or critical record changes.

## 2. Safety before automation

When features conflict, **choose the safest option**.

- **MUST** prefer ask / block / escalate over silent automation when risk is unclear.
- **MUST NOT** ship “convenient” automations that increase driving, labor, financial, or compliance risk.

## 3. Compliance by design

- **MUST NOT** build features that encourage unsafe driving, violate labor/privacy/financial/trucking/employment laws, bypass approvals, or produce misleading records.
- **MUST** design flows that preserve audit trails and lawful approvals.

## 4. AI must be honest

- **MUST NOT** fabricate or guess critical information (money, HOS, compliance status, legal facts, identity, government data).
- **MUST** show uncertainty and ask for clarification when data is incomplete or conflicting.

## 5. Explainability

Every meaningful AI suggestion or action **MUST** surface: why, data used, confidence, and whether approval is required.

## 6. Approval system

- **Low-risk** admin: automatable only when the company explicitly enables it.
- **Medium-risk**: requires human approval before execution.
- **High-risk** (money, employment, safety, compliance, legal, taxes, filings, insurance, contracts, customers, drivers, company records): **never** auto-execute.
- Reuse `lib/ai-safety/` confirmation + automation levels — do not invent a parallel gate.

## 7. Auditability

Important AI and automation actions **MUST** record who, what, when, before/after, approval, and reason (`lib/ai-safety/audit`).

## 8. Security first

- **MUST** apply least privilege, encrypt sensitive data in transit/at rest where the product handles it, and protect PII/credentials.
- **MUST NOT** log secrets, widen scopes “for convenience,” or expose tenant data across boundaries.

## 9. Transparency

Users **MUST** know what AI changed, suggested, needs approval, or is pending. Nothing silent for important actions.

## 10. Professional responsibility

- **MUST** make clear: not legal or tax advice; does not replace accountants, attorneys, safety, or compliance professionals.
- UI copy and Alph responses should stay assistive, not authoritative counsel.

## 11. Connected ecosystem

Prefer verified provider sync (ELD, accounting, fuel, etc.) over manual entry when a trusted integration exists. Do not fake live provider data.

## 12. User ownership

Customers own and control their data, integrations, and automations. **MUST** support export and the ability to disable AI/automation. **MUST NOT** lock customers out of their own records.

---

## Agent checklist (before shipping AI/automation)

1. Who decides — human or AI? If AI decides in a forbidden domain → redesign.
2. What happens on conflict or low confidence? Safest path + visible uncertainty.
3. Is approval tier correct (low / medium / high)?
4. Is the action explainable and audited?
5. Can the user see, export, or turn it off?

Product surfaces should link Charter → Foundation → Engineering Constitution ↔ AI Safety Policy; do not duplicate conflicting policy systems. Canonical text lives in `/constitution`.
