# 07 — Alph / AI Security

**Parent:** [00-README.md](./00-README.md)
**Governance:** [`/constitution/00-master-constitution.md`](../../../constitution/00-master-constitution.md) · [`/constitution/04-ai-safety-legal-policy.md`](../../../constitution/04-ai-safety-legal-policy.md)
**API design:** [`../api/12-alph.md`](../api/12-alph.md)
**Architecture:** [`../16-alph-architecture.md`](../16-alph-architecture.md)
**Runtime:** `lib/ai-safety/` · `lib/alph/` (orchestrator, tools, context, approval, audit)

---

## Hard rules

1. **One Alph only** — no parallel assistant products.
2. **Same permissions as the acting user** — Alph never elevates.
3. **Critical actions require human confirmation** — no silent money/payroll/safety/legal/employment execution.
4. **Uncertainty → stop** — do not fabricate compliance or money facts.
5. **No parallel policy** — reuse `lib/ai-safety` taxonomy; do not invent a second gate.
6. **No service-role from the browser** — Alph Server Actions run as the user.
7. **Company isolation** — tools and conversations filter by tenant/company server-side.

---

## Implementation (this pass)

| Control | Location |
|---------|----------|
| One Alph identity | `lib/alph/identity.ts` |
| Context builder | `lib/alph/context/` |
| Tool registry + gateway | `lib/alph/tools/` |
| Conversation store | `lib/alph/conversation/` |
| Approval engine | `lib/alph/approval/` |
| Alph audit | `lib/alph/audit/` |
| Orchestrator + streaming | `lib/alph/orchestrator.ts`, `lib/alph/streaming/` |
| Provider abstraction | `lib/alph/providers/` |
| Intent → permission map | `lib/alph/security.ts` → `gateAlphIntent` |
| Deny path + audit | `alphPermissionDeniedResult` + `logSecurityEvent` |
| Critical assist annotation | `annotateAlphCriticalAssist` on results |
| Wired into executor | `runAlphCommand` in `lib/alph/executor.ts` |
| Rate limit | `app/actions/alph.ts` — per user |
| Side-effect gate | `runAiSuggestedAction` + approval engine |
| Automation levels | `lib/ai-safety/automation-levels.ts` — critical never fully auto |
| Self-check | `lib/alph/selfcheck.ts` / `runAlphSelfCheckAction` |

### Behavior notes

- Most Alph “mutations” today are **navigate / answer** (assist-only) or **approval requests** — they do not write settlements silently.
- High-risk write tools are **not registered** until approval confirm + verified execution path is complete.
- Annotation appends clear copy that Alph will not execute without confirmation for critical/confirmation-gated intents.
- When session role is Owner (stub), permission checks pass — ready for real roles without UX redesign.

---

## Remaining gaps

| Gap | Remediation |
|-----|-------------|
| Durable Postgres conversation/audit | Wire when IAM/DB land |
| Not every Alph answer path filters fields by document ACL | Apply document permissions on sensitive answers |
| No `/api/v1/alph/actions/:id/confirm` HTTP yet | Follow API pack; Server Actions exist |
| Production LLM providers | Register via `lib/alph/providers` |
| Automation Center must keep calling `runAiSuggestedAction` | Code review checklist |
| Voice path must use same Server Action | Already via `runAlphCommandAction` when wired |

---

## Compatibility

- No Alph intents removed.
- No UI redesign.
- Copilot role routes remain as **workspace focuses** of one Alph.
- Deny responses use existing `clarify` result type + links to Permissions / AI Safety Policy.
