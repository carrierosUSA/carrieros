# Transpo.ai Constitution

**Canonical source of truth** for every line of code, design decision, schema, API, AI workflow, automation, integration, UI, security, and future feature.

This folder **overrides** feature requests, Cursor rule summaries, and product-page copy when they conflict.

## Precedence (highest → lowest)

| Rank | Document | Path |
|------|----------|------|
| 1 | **Master Constitution Version 1.0** | [`00-master-constitution.md`](./00-master-constitution.md) |
| 2 | Trust & Safety Charter | [`01-trust-safety-charter.md`](./01-trust-safety-charter.md) |
| 3 | Transpo.ai Foundation | [`02-foundation.md`](./02-foundation.md) |
| 4 | Engineering Constitution | [`03-engineering-constitution.md`](./03-engineering-constitution.md) |
| 5 | AI Safety & Legal Policy | [`04-ai-safety-legal-policy.md`](./04-ai-safety-legal-policy.md) |
| — | Product Design (UI only) | `.cursor/rules/transpo-product-design.mdc` |
| appendix | Permanent Constitution (superseded) | [`00a-permanent-constitution.md`](./00a-permanent-constitution.md) |

Start with [`INDEX.md`](./INDEX.md). Read the **Master Constitution Version 1.0** first — it is the highest authority.

## Conflict protocol

```
Feature request conflicts with /constitution?
  → DO NOT implement
  → Explain the risk and why it conflicts
  → Recommend safer / simpler / more maintainable / more secure alternatives
  → Constitution always overrides feature requests
```

## How agents use this

1. **MUST** read and follow `/constitution` before implementing features.
2. Master Constitution v1.0 is **#1**. Other docs implement and refine; they do not outrank it.
3. Cursor rules and `carrieros-app/lib/*` are summaries/runtime helpers — **folder wins on conflict**.
4. Product hub: `/platform/governance`.
5. Migration Center requirements live in Master Constitution; product surface: `/platform/migration`.

## Related (non-canonical)

| Surface | Role |
|---------|------|
| `.cursor/rules/*.mdc` | Always-apply summaries pointing here |
| `carrieros-app/lib/constitution/` | Product UI constants (version `1.0`) |
| `/platform/governance` | In-app Master Constitution v1.0 + index |
| `/platform/migration` | AI Migration Center (implements constitutional product requirements) |
| `/platform/trust-charter`, `/foundation`, `/constitution`, `/ai-policy` | Customer-facing pages |
| [`docs/architecture/`](../docs/architecture/00-README.md) | Enterprise technical architecture (evolves `carrieros-app`; Constitution still wins on conflict) |
| [`docs/architecture/database/`](../docs/architecture/database/README.md) | Database schema design (docs only; SQL not yet generated) |
| [`docs/architecture/iam/`](../docs/architecture/iam/00-README.md) | IAM design pack (docs only) |
