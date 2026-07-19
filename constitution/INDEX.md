# Constitution — reading order

## Precedence (highest → lowest)

1. **[`00-master-constitution.md`](./00-master-constitution.md)** — **Master Constitution Version 1.0.** Highest authority for the entire codebase. Conflict protocol. Mission, priorities, AI MAY / MUST NEVER, engineering standard, Migration Center product requirements, final rule.
2. **[`01-trust-safety-charter.md`](./01-trust-safety-charter.md)** — Trust, safety, no-decision, AI autonomy (implements Master Constitution).
3. **[`02-foundation.md`](./02-foundation.md)** — How agents operate; architecture; tradeoffs; long-term quality.
4. **[`03-engineering-constitution.md`](./03-engineering-constitution.md)** — Twelve engineering principles.
5. **[`04-ai-safety-legal-policy.md`](./04-ai-safety-legal-policy.md)** — Product AI controls, confirmations, automation levels.

**Historical appendix (not in precedence chain):** [`00a-permanent-constitution.md`](./00a-permanent-constitution.md) — prior Permanent Constitution; **superseded by Master Constitution v1.0**.

Product Design (`.cursor/rules/transpo-product-design.mdc`) is UI polish only — never at the expense of 1–5.

**Enterprise Design System (UI language):** [`docs/design-system/00-README.md`](../docs/design-system/00-README.md) — permanent design documentation (tokens, components, patterns). Subordinate to this Constitution; canonical over the product-design Cursor rule for design detail.

## When conflict: stop and redesign

If any proposed feature, schema, API, automation, or UI conflicts with a document above:

1. **DO NOT implement** the conflicting path.
2. **Explain** the risk and which constitution file/principle conflicts.
3. **Recommend** safer, simpler, more maintainable, more secure alternatives.
4. **Ask** when uncertain.

**The Constitution always overrides feature requests.**

## Product

- `/platform/governance` — Master Constitution v1.0 first, then links to all docs
- `/platform/migration` — AI Migration Center (product requirement in Master Constitution; built separately)
- `/platform/trust-charter` · `/platform/foundation` · `/platform/constitution` · `/platform/ai-policy`

## Enterprise architecture (technical design)

Target scalable architecture for `carrieros-app` (documentation only; does not outrank this Constitution):

- **[`docs/architecture/00-README.md`](../docs/architecture/00-README.md)** — index (system, frontend/backend, APIs, AI/OCR, modules, scale, security)
- [`docs/architecture/database/README.md`](../docs/architecture/database/README.md) — Enterprise Database design (**SQL not yet generated** — design approval first)
- [`docs/architecture/iam/00-README.md`](../docs/architecture/iam/00-README.md) — Enterprise IAM design (documentation only)
- [`docs/architecture/api/00-README.md`](../docs/architecture/api/00-README.md) — Enterprise API architecture (`/api/v1`, contracts, AuthZ, migration; foundation in `carrieros-app/lib/api/`)
- [`docs/architecture/security/00-README.md`](../docs/architecture/security/00-README.md) — Enterprise Security Architecture (assessment, headers/secrets hygiene, Alph AuthZ, remediation roadmap)
