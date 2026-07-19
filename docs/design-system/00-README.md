# Transpo.ai Enterprise Design System

**Status:** Documentation only — pages and components are **not** rebuilt in this pack
**Audience:** Engineers, designers, product, AI agents
**Canonical path:** `/docs/design-system/`
**Code tokens today:** `carrieros-app/app/globals.css`, `carrieros-app/lib/design-system/`

---

## Purpose

This folder is the **permanent design language** for every Transpo.ai screen, component, and future feature. It is the single source of truth for visual and interaction standards — calm, premium, enterprise SaaS — in the spirit of Apple, Linear, Stripe, Notion, Vercel, GitHub, and Raycast.

**Documentation before implementation.** Prefer extending existing CSS variables and `lib/design-system/*` over inventing a parallel system.

---

## Non-goals

- Redesigning or rebuilding application pages in this task
- Parallel token systems that diverge from `globals.css`
- Flashy UI, cluttered TMS layouts, or decorative complexity
- Weakening `/constitution` for visual novelty

---

## Principles (summary)

| Principle | Meaning |
|-----------|---------|
| Calm & premium | Soft surfaces, minimal chrome, clear hierarchy |
| Two-second comprehension | User knows what happened, what needs attention, what next |
| Progressive disclosure | Hide secondary detail until needed |
| Semantic color only | Info / success / warning / critical / disabled — no random hues |
| Low click | Primary tasks finish in one modal or preview when possible |
| Trust-safe AI UI | Alph assists; humans decide; never hide uncertainty |
| Extend, don’t fork | Reuse tokens in `globals.css` and `lib/design-system/` |

Full detail: [01-principles.md](./01-principles.md).

---

## Relation to `/constitution`

| Layer | Role |
|-------|------|
| Master Constitution v1.0 | Highest authority |
| Trust & Safety Charter | AI assists; humans decide |
| Foundation | Safer → trustworthy → simpler → maintainable |
| Engineering Constitution | Explainability, approvals, audit |
| AI Safety & Legal Policy | Confirmation + automation levels |
| **This folder** | Permanent UI language implementing the above |
| `.cursor/rules/transpo-product-design.mdc` | Short UI summary; **this folder wins on design detail** |

Conflict: stop, explain, redesign. Constitution always overrides feature and visual requests.

Product hubs: `/platform/governance`, `/platform/foundation`.
Architecture (technical): [`docs/architecture/00-README.md`](../architecture/00-README.md).

---

## Relation to existing code

| Source | Contents |
|--------|----------|
| `carrieros-app/app/globals.css` | CSS variables, surface primitives, button classes, Driver App dark tokens, motion keyframes |
| `lib/design-system/tokens.ts` | Spacing, radius, control heights, shadows, brand |
| `lib/design-system/colors.ts` | `TRANSPO_COLORS` semantic Tailwind class maps |
| `components/ui/*` | PageShell, EmptyState, FadeIn, Skeleton, SearchCombobox, ActionTooltip |
| `components/command-palette/*` | Command palette |
| `components/Sidebar.tsx` | Ops side nav |

Machine-readable map: [15-token-reference.md](./15-token-reference.md).
Adoption phases (no code in this pack): [16-implementation-roadmap.md](./16-implementation-roadmap.md).

---

## How to use

1. **New screen** — Read [01-principles.md](./01-principles.md), then [07-dashboard-patterns.md](./07-dashboard-patterns.md) or [09-forms.md](./09-forms.md) as relevant. Use `PageShell` + tokens.
2. **New component** — Spec against [06-component-library.md](./06-component-library.md); reuse `components/ui/*` before adding primitives.
3. **Color / type / space** — Never invent hex values; use [02](./02-color-system.md)–[05](./05-elevation-borders-radius.md) and [15](./15-token-reference.md).
4. **AI UI** — Follow [14-ai-surfaces.md](./14-ai-surfaces.md) + `/constitution`.
5. **Agents** — Treat this folder as canonical design source; product-design rule is a summary only.

---

## Document index

| Doc | Contents |
|-----|----------|
| [00-README.md](./00-README.md) | This index |
| [01-principles.md](./01-principles.md) | Goals, screen test, cognitive load, trust UI |
| [02-color-system.md](./02-color-system.md) | Palette, light/dark, a11y, semantic usage |
| [03-typography.md](./03-typography.md) | Geist stack, roles, scale |
| [04-spacing-system.md](./04-spacing-system.md) | 4/8/12/16/24/32 scale, layout |
| [05-elevation-borders-radius.md](./05-elevation-borders-radius.md) | Shadows, borders, radii |
| [06-component-library.md](./06-component-library.md) | Reusable component specs + code map |
| [07-dashboard-patterns.md](./07-dashboard-patterns.md) | KPI / health / activity layouts |
| [08-table-patterns.md](./08-table-patterns.md) | Enterprise tables without TMS clutter |
| [09-forms.md](./09-forms.md) | Fast, validated forms |
| [10-responsive.md](./10-responsive.md) | Breakpoints, Driver App |
| [11-motion.md](./11-motion.md) | FadeIn, shimmer, reduced-motion |
| [12-icons.md](./12-icons.md) | Lucide standards |
| [13-accessibility.md](./13-accessibility.md) | Keyboard, SR, contrast |
| [14-ai-surfaces.md](./14-ai-surfaces.md) | Alph, confidence, confirmations |
| [15-token-reference.md](./15-token-reference.md) | CSS ↔ Tailwind ↔ TS |
| [16-implementation-roadmap.md](./16-implementation-roadmap.md) | Phased adoption (docs only) |

---

## Brand

| Token | Value |
|-------|-------|
| Product | Transpo.ai |
| Tagline | One Platform. Every Trucking Operation. |
| Assistant | Alph |

Source: `TRANSPO_BRAND` in `lib/design-system/tokens.ts`.
