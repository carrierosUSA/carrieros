# 12 — Alph API Rules

**Status:** Target design + foundation in `lib/alph/` (orchestrator, tools, context, conversation, approval, audit)
**Governance:** Master Constitution — AI assists; humans decide
**Runtime:** `lib/ai-safety/`, `lib/alph/`
**Architecture:** [`../16-alph-architecture.md`](../16-alph-architecture.md)

---

## Core rules

1. **One Alph only** — workspace routes are context focuses, not separate assistants.
2. **Same permissions as the user** — Alph never elevates. If the user cannot `loads:assign`, Alph cannot assign.
3. **Assist-only for critical actions** — draft, suggest, preview, explain; **human approval** required to execute Constitution-critical side effects.
4. **Uncertainty → stop** — do not fabricate compliance, money, or safety facts.
5. **Auditable** — every suggested and executed action logs actor, permission, confirmation.
6. **No parallel gate** — reuse `lib/ai-safety` confirmation + automation levels; do not invent a second policy.

---

## API surface (target)

| Endpoint | Method | Purpose | Critical? |
|----------|--------|---------|-----------|
| `/api/v1/alph/session` | `GET` | Context summary | no |
| `/api/v1/alph/parse` | `POST` | Parse natural language → intent draft | no |
| `/api/v1/alph/suggest` | `POST` | Suggestions for a resource | no |
| `/api/v1/alph/turn` | `POST` | Orchestrated turn (modes + tools) | gated |
| `/api/v1/alph/actions` | `POST` | Propose action (returns confirmation payload) | gated |
| `/api/v1/alph/actions/:id/confirm` | `POST` | Human confirms proposed action | **human** |
| `/api/v1/alph/actions/:id/cancel` | `POST` | Dismiss proposal | no |
| `/api/v1/alph/history` | `GET` | Prior assists / audits (permissioned) | no |

**Today:** Server Actions in `app/actions/alph.ts` — `runAlphCommandAction`, `runAlphTurnAction`, approval + conversation helpers. HTTP routes land with the API pack.

Existing UI may keep `app/actions/alph.ts` — it must call the same executor + safety helpers as HTTP.

---

## Confirmation payload

```json
{
  "data": {
    "proposal_id": "ap_…",
    "action_kind": "loads.assign",
    "summary": "Assign Driver Jane to Load 1042",
    "requires_human_confirmation": true,
    "permission_required": "loads:assign",
    "confidence": "medium",
    "preview": { },
    "expires_at": "…"
  }
}
```

Confirm endpoint re-checks: session, membership, permission, proposal integrity, automation level.

---

## MUST NEVER (API)

- Auto-approve payroll, settlements, payments, migration commit, compliance certification
- Accept client flag `skip_confirmation=true` for critical kinds
- Run as service-role from the browser
- Bypass RLS / company isolation

---

## Automation levels

Company settings (`lib/ai-safety/settings`) may allow limited non-critical automation.
API must call `actionAllowedAtLevel` / `requiresHumanConfirmation` — never hardcode “Alph is admin”.

---

## Related

- Alph architecture: [`../16-alph-architecture.md`](../16-alph-architecture.md)
- AI/OCR architecture: [`../07-ai-ocr-documents.md`](../07-ai-ocr-documents.md)
- AuthZ: [05-authorization.md](./05-authorization.md)
- Module entry: [13-module-catalog.md](./13-module-catalog.md) (Alph)
- Constitution: [`../../../constitution/00-master-constitution.md`](../../../constitution/00-master-constitution.md)
