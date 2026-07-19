# 16 — Implementation Roadmap

**Documentation only — no code in this pack.**
Pages were **not** built or redesigned as part of creating these docs.

---

## Principle

Extend existing tokens and primitives. Do not invent a parallel design system package, CSS framework, or visual language.

---

## Phase 1 — Adopt tokens everywhere

| Work | Outcome |
|------|---------|
| Replace hardcoded hex with CSS vars / `TRANSPO_COLORS` | Consistent sapphire-charcoal UI |
| Prefer `.transpo-*` type and surface classes | Shared hierarchy |
| Route `loading.tsx` + `Skeleton` + `FadeIn` | No blank white pages |
| PageShell on list/detail pages | Consistent headers |
| Lint/review habit: no new random colors | Token discipline |

**Exit criteria:** New screens use tokens by default; obvious hex snowflakes in high-traffic shells reduced.

---

## Phase 2 — Shared component kit

| Work | Outcome |
|------|---------|
| React primitives: Button, Input, Select, Badge, Alert, Dialog, Tabs | Thin wrappers over tokens |
| Table kit implementing [08-table-patterns.md](./08-table-patterns.md) | Enterprise lists without TMS clutter |
| Form primitives + validation patterns | [09-forms.md](./09-forms.md) |
| Consolidate ad-hoc buttons into primary/secondary | Less CSS drift |
| Ops dark mode (optional) extending driver tokens | Single dark language |

**Exit criteria:** Domain components import from `components/ui/*`; no domain-specific Button forks.

---

## Phase 3 — Harden & measure (later)

- Contrast audits on dark + light
- Reduced-motion coverage
- Storybook or internal gallery **only if** it reduces drift (don’t overengineer)
- Driver App visual parity checklist against this folder

---

## Explicit non-goals of this documentation pack

- No application page rebuilds
- No git commit required by this pack
- No new feature work justified solely by “make it prettier”
- No parallel token file outside `globals.css` + `lib/design-system/`

---

## Governance

| Question | Answer |
|----------|--------|
| Canonical design docs | `/docs/design-system/` |
| Canonical policy | `/constitution` |
| UI summary for agents | `.cursor/rules/transpo-product-design.mdc` (points here) |
| Conflict | Constitution → then this design system → then local one-offs |
