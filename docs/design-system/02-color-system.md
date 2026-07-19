# 02 — Color System

**Documentation only.** Extend tokens in `globals.css` / `TRANSPO_COLORS`; do not invent parallel palettes.

---

## Brand direction

**Sapphire + charcoal on cool canvas** — professional, calm, enterprise. Primary action and info share sapphire blue. Neutrals carry most of the UI; semantic colors are reserved for meaning.

Avoid: purple-indigo marketing gradients, warm cream/serif “AI default” looks, neon glows, rainbow status maps.

---

## Core palette (light — ops default)

| Role | Hex | CSS variable | Notes |
|------|-----|--------------|-------|
| Primary | `#2563EB` | `--primary` / `--color-info` | Sapphire; buttons, links, focus |
| Primary hover | `#1D4ED8` | `--primary-hover` | Interactive only |
| Primary soft | `#EFF6FF` | `--primary-soft` | Soft chips, selected rows |
| Secondary / muted text | `#6B7280` | `--muted` | Labels, descriptions |
| Accent | `#2563EB` | same as primary | No separate accent hue |
| Success | `#16A34A` | `--color-success` | Healthy, complete, paid |
| Warning | `#EA580C` | `--color-warning` | Expiring, attention |
| Danger / Critical | `#DC2626` | `--color-critical` | Blocking, overdue, failed |
| Info | `#2563EB` | `--color-info` | Informational (same as primary) |
| Disabled | `#94A3B8` | `--color-disabled` | Inactive / unavailable |
| Background (canvas) | `#F5F7FA` | `--canvas` | App chrome behind panels |
| Surface | `#FFFFFF` | `--surface` / `--background` | Cards, PageShell |
| Surface elevated | `#F8F9FB` | `--surface-elevated` | Nested panels, empty states |
| Card (same as surface) | `#FFFFFF` | `--surface` | Prefer inset border over drop shadow |
| Border | `#DDE2EA` | `--border` | Controls, secondary buttons |
| Border subtle | `#EAEAEA` | `--border-subtle` | Cards, panels (inset 1px) |
| Text | `#111827` | `--foreground` | Charcoal body / titles |
| Muted text | `#6B7280` | `--muted` | Meta, captions |
| Soft semantic BGs | see below | — | Match `TRANSPO_COLORS` |

### Soft semantic backgrounds / borders (from `TRANSPO_COLORS`)

| Tone | BG | Text | Border | Ring |
|------|----|------|--------|------|
| info | `#EFF6FF` | `#2563EB` | `#BFDBFE` | `#93C5FD` |
| success | `#ECFDF3` | `#16A34A` | `#BBF7D0` | `#86EFAC` |
| warning | `#FFF7ED` | `#EA580C` | `#FED7AA` | `#FDBA74` |
| critical | `#FEF2F2` | `#DC2626` | `#FECACA` | `#FCA5A5` |
| disabled | `#F8FAFC` | `#94A3B8` | `#E2E8F0` | `#CBD5E1` |

---

## Dark mode

**Today:** Dark tokens exist for **Driver App** (`.driver-mobile` / `.driver-mobile-dark`) in `globals.css`.

| Role | Light (driver) | Dark (driver) |
|------|----------------|---------------|
| Background | `#F5F7FA` (`--dm-bg`) | `#0B0F14` |
| Foreground | `#111827` | `#F3F4F6` |
| Surface | `#FFFFFF` | `#141A22` |
| Elevated | `#F1F4F8` | `#1C2430` |
| Border | `#DDE2EA` | `#243041` |
| Muted | `#6B7280` | `#94A3B8` |
| Sapphire | `#2563EB` | `#2563EB` (keep brand) |

**Target (ops app):** When ops dark mode ships, mirror the same charcoal surfaces — do not invent a purple dark theme. Prefer `data-theme` + CSS variables on `:root` extending the driver pattern. Semantic text colors must still meet WCAG AA on dark surfaces (may need slightly lighter success/warning/critical text variants — document when implemented; until then validate per component).

---

## Semantic usage table

| Meaning | Tone | Examples |
|---------|------|----------|
| Informational / in progress | info | Tracking active, AI suggestion (non-critical) |
| Healthy / complete | success | Compliant, paid, delivered |
| Needs attention soon | warning | Expiring docs, soft SLA risk |
| Blocking / failed | critical | Overdue, failed payment, safety hold |
| Inactive | disabled | Archived, unavailable control |

**Never** use color alone for status — pair with label or icon ([13-accessibility.md](./13-accessibility.md)).

---

## Accessibility (contrast)

Target **WCAG AA** minimum (AAA where practical for body text).

| Pairing | Approx contrast | Status |
|---------|-----------------|--------|
| `#111827` on `#FFFFFF` | ~16:1 | Pass AAA |
| `#111827` on `#F5F7FA` | ~15:1 | Pass AAA |
| `#6B7280` on `#FFFFFF` | ~4.6:1 | Pass AA for normal text |
| `#2563EB` on `#FFFFFF` | ~4.6:1 | Pass AA (links/buttons with weight help) |
| White on `#2563EB` | ~4.6:1 | Pass AA for UI text |
| `#16A34A` / `#EA580C` / `#DC2626` on white | ≥4.5:1 for text use | Use as text on soft BG or with bold ≥14px |

Focus ring: `--shadow-focus: 0 0 0 2px rgba(147, 197, 253, 0.8)` — visible on light surfaces.

Do not place muted gray (`#94A3B8`) as primary body copy on white for long reading.

---

## Mapping to code

| Concern | Source |
|---------|--------|
| CSS variables | `:root` in `app/globals.css` |
| Tailwind theme bridge | `@theme inline` in `globals.css` |
| Component class maps | `TRANSPO_COLORS` in `lib/design-system/colors.ts` |

Full matrix: [15-token-reference.md](./15-token-reference.md).
