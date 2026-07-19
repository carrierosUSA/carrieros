# 16 — Alph AI Architecture

**Status:** Foundation implemented in `carrieros-app/lib/alph/` (orchestration, tools, context, conversation, approval, audit). Model providers remain abstracted; production LLM wiring is optional.
**Governance:** Master Constitution v1.0 — Alph assists; humans decide.
**Related:** [`api/12-alph.md`](./api/12-alph.md) · [`security/07-alph-security.md`](./security/07-alph-security.md) · [`../design-system/14-ai-surfaces.md`](../design-system/14-ai-surfaces.md)

---

## One Alph only

There is **one** assistant: **Alph**.

Workspace routes such as `/alph/copilot/dispatcher` are **context focuses** of the same Alph — not separate AIs (no “Dispatcher Alph” brain, no “Accounting Alph” brain). Alph changes what it retrieves and recommends based on:

- Current workspace (Dispatch, Drivers, Fleet, Finance, Documents, …)
- Current page / record identifiers
- Authenticated user role
- Company permissions (same RBAC as the user)
- Recent activity and conversation summary

Alph never elevates permissions and never replaces human responsibility.

---

## Layers

```
┌─────────────────────────────────────────────────────────┐
│ UI (Alph workspace, side panel, Ask Alph, record menus) │
└────────────────────────────┬────────────────────────────┘
                             │ Server Actions /api/v1/alph/*
┌────────────────────────────▼────────────────────────────┐
│ Orchestrator (modes: ASK · SEARCH · DRAFT · ANALYZE ·   │
│ RECOMMEND · ACT)                                        │
├──────────────┬─────────────┬──────────────┬─────────────┤
│ Context      │ Tool        │ Permission   │ Approval    │
│ builder      │ registry    │ gateway      │ engine      │
├──────────────┴─────────────┴──────────────┴─────────────┤
│ Retrieval (min data) · Conversation store · Audit log   │
├─────────────────────────────────────────────────────────┤
│ Model provider abstraction (mock → OpenAI/Anthropic/…)  │
└─────────────────────────────────────────────────────────┘
```

Business logic stays in domain services (`lib/services/*`). Providers only draft language; tools and approval execute (or refuse) side effects.

---

## Modes (one assistant)

| Mode | Purpose | Side effects |
|------|---------|--------------|
| **ASK** | Answer / explain | None |
| **SEARCH** | Find authorized records | Read tools only |
| **DRAFT** | Prepare messages, invoices, reports | Draft only; no send |
| **ANALYZE** | Compare costs, trends | Read tools only |
| **RECOMMEND** | Suggest next steps (labeled as recommendations) | None until ACT |
| **ACT** | Prepare an approval request | **Never silent** — human must confirm |

---

## Tools

Each tool has typed input/output, permission check, company isolation, validation, audit, errors, and rate limits where appropriate.

**Safe (read-only) — implemented:** search/read loads, drivers, trucks, trailers, customers, documents (metadata), invoices, expenses, maintenance, fuel.

**Draft helpers — prepare only:** report / message / invoice / payroll drafts (no finalize).

**ACT:** `create_approval_request` only. High-risk writes (dispatch, pay, delete, …) stay blocked until a human confirms via the approval engine + `lib/ai-safety`.

---

## Conversation

- Company-isolated + user-scoped threads
- Titles, archive, retention controls, searchable metadata
- Summaries + selective retrieval — **do not** load unlimited history into every request

Storage today: process-memory foundation (swap to Postgres without changing the API).

---

## Approval preview (required for critical ACT)

Show before any critical execution:

- Proposed action · Records affected · Financial impact · Operational impact
- Permission required · Confirm · Cancel

Reuse `lib/ai-safety` taxonomy — **no parallel policy**.

---

## Audit

Log: prompt, workspace, tools requested/executed, records accessed, drafts, recommendations, approval requests, approve/reject, execution result, model, timestamp, request ID. Mask secrets and unauthorized fields.

---

## Trust & safety

- Separate facts from recommendations
- Show uncertainty; never invent records
- Never claim success unless verified
- Cite company records used
- Warn when data may be outdated
- No legal / tax / medical / compliance certainty

---

## Runtime map

| Concern | Path |
|---------|------|
| Identity (one Alph) | `lib/alph/identity.ts` |
| Modes | `lib/alph/modes.ts` |
| Context builder | `lib/alph/context/` |
| Tool registry + gateway | `lib/alph/tools/` |
| Conversation | `lib/alph/conversation/` |
| Approval | `lib/alph/approval/` |
| Audit | `lib/alph/audit/` |
| Providers | `lib/alph/providers/` |
| Streaming | `lib/alph/streaming/` |
| Orchestrator | `lib/alph/orchestrator.ts` |
| Legacy intent executor | `lib/alph/executor.ts` (kept; gated) |
| UI confirmation | `lib/ai-safety/` + `AiSafetyProvider` |

---

## Phased roadmap

1. ✅ Architecture + context + tools (read) + conversation + audit + approval model + streaming foundation
2. Wire durable Postgres conversation/audit when IAM/DB land
3. Provider adapters + streaming HTTP
4. High-risk write tools **only after** approval confirm API is complete
5. Background analysis + safe caching + usage metering dashboards

---

## Non-goals

- Multiple named AI products
- Alph bypassing RBAC
- Silent critical execution
- Sending entire company databases to a model
- Locking to one model vendor
