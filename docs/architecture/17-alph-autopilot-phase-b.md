# 17 — Alph Autopilot Phase B (next sprint)

**Status:** Documented only — not implemented. Phase A foundation lives in `carrieros-app/lib/alph/` (autopilot, OCR interfaces, document inbox, command pipeline, payroll prep, composer).
**Governance:** Master Constitution v1.0 — Alph assists; humans decide. Never fake live AI results when providers are unset.
**Related:** [`16-alph-architecture.md`](./16-alph-architecture.md) · [`api/12-alph.md`](./api/12-alph.md) · [`security/07-alph-security.md`](./security/07-alph-security.md)

---

## What Phase A already delivered

| Capability | Location |
|------------|----------|
| Assist / Approve / Autopilot + approval rules | `lib/alph/autopilot/` · Settings → Alph Autopilot |
| Command pipeline understand → preview → approve → result | `lib/alph/command/` |
| Typed OCR + model provider interfaces (env-gated) | `lib/alph/ocr/` · `lib/alph/providers/{env,openai,anthropic}.ts` |
| AI Document Inbox + RC→load + POD→invoice | `lib/alph/document-inbox/` · `/documents/inbox` |
| Action / audit history | `/alph/history` · `lib/alph/audit/` |
| Payroll prep (reviewable, never auto-pay) | `lib/alph/payroll/` |
| Communication composer (clear not-sent) | `lib/alph/communications/` |
| Support recommendation shape | `lib/alph/support/recommendations.ts` |

Demo OCR is **explicitly labeled** (`isDemoExtraction: true`). Live vendors return `not_configured` or refuse rather than fabricate.

---

## Phase B backlog (honest stubs only until wired)

### 1. AI Dispatch
- Suggest driver/truck matches with confidence, ETA, HOS, and empty-mile impact
- High-impact reassignment always requires approval (already locked in Autopilot rules)
- Interfaces: extend Alph tools `suggest_dispatch` → preview → ACT approval → `assignDriver` / `assignTruck`

### 2. Broader document types
- BOL, lumper, fuel, scale, insurance, contracts beyond RC/POD happy paths
- Missing-page detection with multi-file merge
- Vendor OCR: complete Veryfi / Azure Form Recognizer adapters behind `AlphOcrProvider`

### 3. Invoicing follow-up
- Reminder drafts via composer (email/SMS) with provider gates
- Factoring packet prep; overdue aging recommendations
- Never auto-send without Approve/Autopilot eligibility + confirmation

### 4. Revenue analysis
- Lane / broker / truck profit narratives (ANALYZE mode)
- Citation of underlying finance-store records only

### 5. Payroll send path
- Phase A prepares statements + evidence flags
- Phase B: approval → export / ACH provider adapter (ADP/Gusto/etc.) — still never silent

### 6. IFTA + year-tax package
- Draft mileage summaries and filing packages
- `government_filing` always requires approval (locked rule)

### 7. Support / daily recommendations
- Persist recommendation cards on Support board
- Daily briefing job (cron) that writes Alph recommendations, not emails, unless composer provider configured

### 8. Marketing / email / SMS / voice / voicemail
- Complete Twilio Voice + SendGrid implementations (today: stubs return not configured)
- Marketing campaigns: always approval-gated (`contact_customer` locked)
- Voicemail transcription: new OCR/ASR provider interface; demo must stay labeled

### 9. Live model providers
- Implement streaming OpenAI / Anthropic / Azure OpenAI behind `AlphModelProvider`
- Tool-calling loop in orchestrator with validation before any write
- Env: `ALPH_PRIMARY_PROVIDER`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `AZURE_OPENAI_*`

---

## Provider env checklist (server-only)

```
ALPH_PRIMARY_PROVIDER=mock|openai|anthropic|azure_openai
ALPH_OCR_PROVIDER=demo|veryfi|azure_form_recognizer
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_ENDPOINT=
VERYFI_CLIENT_ID=
VERYFI_CLIENT_SECRET=
AZURE_FORM_RECOGNIZER_KEY=
AZURE_FORM_RECOGNIZER_ENDPOINT=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
SENDGRID_API_KEY=
```

If unset → clear setup state / labeled demo. **Never pretend live LLM or OCR.**

---

## Non-goals for Phase B

- Silent Autopilot for money, payroll, tax, deletes, legal, compliance, marketing
- Parallel assistant brands (one Alph only)
- Replacing domain services with LLM writes
