# 15 — Token Reference

**Documentation only.** Machine-oriented map: CSS variables ↔ Tailwind / `@theme` ↔ TypeScript.

Sources of truth in code:

- `carrieros-app/app/globals.css`
- `carrieros-app/lib/design-system/tokens.ts`
- `carrieros-app/lib/design-system/colors.ts`

---

## Surfaces & neutrals

| Role | Hex | CSS `:root` | `@theme inline` | TS |
|------|-----|-------------|-----------------|-----|
| Canvas | `#F5F7FA` | `--canvas` | `--color-canvas` | — |
| Background / white | `#FFFFFF` | `--background` | `--color-background` | — |
| Foreground | `#111827` | `--foreground` | `--color-foreground` | — |
| Surface | `#FFFFFF` | `--surface` | `--color-surface` | — |
| Surface elevated | `#F8F9FB` | `--surface-elevated` | `--color-surface-elevated` | — |
| Border | `#DDE2EA` | `--border` | `--color-border` | — |
| Border subtle | `#EAEAEA` | `--border-subtle` | `--color-border-subtle` | — |
| Muted text | `#6B7280` | `--muted` | `--color-muted` | — |

Tailwind usage examples: `bg-canvas`, `text-foreground`, `border-border` (via theme), or `bg-[var(--canvas)]`.

---

## Brand & semantic

| Role | Hex | CSS | `@theme` | `TRANSPO_COLORS` key |
|------|-----|-----|----------|----------------------|
| Primary | `#2563EB` | `--primary` | `--color-primary` | — (use CSS) |
| Primary hover | `#1D4ED8` | `--primary-hover` | `--color-primary-hover` | — |
| Primary soft | `#EFF6FF` | `--primary-soft` | — | `info.bg` |
| Info | `#2563EB` | `--color-info` | `--color-info` | `info` |
| Success | `#16A34A` | `--color-success` | `--color-success` | `success` |
| Warning | `#EA580C` | `--color-warning` | `--color-warning` | `warning` |
| Critical | `#DC2626` | `--color-critical` | `--color-critical` | `critical` |
| Disabled | `#94A3B8` | `--color-disabled` | `--color-disabled` | `disabled` |

`TRANSPO_COLORS` exposes Tailwind class strings for soft BG/text/border/ring per tone.

Deprecated alias: `CARRIEROS_COLORS` → same object.

---

## Typography

| Role | CSS var | Class | Notes |
|------|---------|-------|-------|
| Page title | `--text-page-title` (22px) | `.transpo-page-title` | PageShell may bump to 24px |
| Section | `--text-section-title` (15px) | `.transpo-section-title` | |
| Card title | `--text-card-title` (15px) | `.transpo-card-title` | |
| Label | `--text-label` (13px) | `.transpo-label` | |
| Value | `--text-value` (14px) | `.transpo-value` | |
| Meta | `--text-meta` (12px) | `.transpo-meta` | |
| Number emphasis | — | `.transpo-number` | tabular + bold |
| Font sans | `--font-geist-sans` | `@theme --font-sans` | Geist |
| Font mono | `--font-geist-mono` | `@theme --font-mono` | Geist Mono |

---

## Spacing

| Step | px | CSS | `TRANSPO_SPACING` |
|------|-----|-----|-------------------|
| 1 | 4 | `--space-1` | `1` |
| 2 | 8 | `--space-2` | `2` |
| 3 | 12 | `--space-3` | `3` |
| 4 | 16 | `--space-4` | `4` |
| 5 | 24 | `--space-5` | `5` |
| 6 | 32 | `--space-6` | `6` |

---

## Radius

| Name | px | CSS | `TRANSPO_RADIUS` |
|------|-----|-----|------------------|
| sm | 8 | `--radius-sm` | `sm` |
| md | 12 | `--radius-md` | `md` |
| lg | 16 | `--radius-lg` | `lg` |
| xl | 20 | `--radius-xl` | `xl` |

---

## Controls & icons

| Name | Value | CSS | TS |
|------|-------|-----|-----|
| Control sm | 32px | `--control-height-sm` | `TRANSPO_CONTROL.sm` |
| Control md | 40px | `--control-height` | `md` |
| Control lg | 44px | `--control-height-lg` | `lg` |
| Icon sm | 14px | `--icon-sm` | — |
| Icon md | 16px | `--icon-md` | — |
| Icon lg | 20px | `--icon-lg` | — |

---

## Shadows

| Name | Value | CSS | `TRANSPO_SHADOW` |
|------|-------|-----|-------------------|
| sm | `0 4px 16px rgba(15,23,42,0.04)` | `--shadow-sm` | `sm` (Tailwind arbitrary class) |
| md | `0 8px 24px rgba(15,23,42,0.06)` | `--shadow-md` | `md` |
| focus | `0 0 0 2px rgba(147,197,253,0.8)` | `--shadow-focus` | — |

---

## Brand constants (`TRANSPO_BRAND`)

| Key | Value |
|-----|-------|
| `name` | Transpo.ai |
| `tagline` | One Platform. Every Trucking Operation. |
| `assistant` | Alph |

---

## Driver mobile dark (scoped)

Under `.driver-mobile` / `.driver-mobile-dark`:

| Role | Light | Dark |
|------|-------|------|
| `--dm-bg` | `#F5F7FA` | `#0B0F14` |
| `--dm-fg` | `#111827` | `#F3F4F6` |
| `--dm-surface` | `#FFFFFF` | `#141A22` |
| `--dm-elevated` | `#F1F4F8` | `#1C2430` |
| `--dm-border` | `#DDE2EA` | `#243041` |
| `--dm-muted` | `#6B7280` | `#94A3B8` |
| `--dm-sapphire` | `#2563EB` | `#2563EB` |
| `--dm-space-1`…`6` | 4…32px | same |

---

## CSS utility classes (globals)

| Class | Purpose |
|-------|---------|
| `.transpo-btn-primary` / `.transpo-btn-secondary` | Buttons |
| `.transpo-surface` / `.transpo-panel` / `.transpo-card` | Surfaces |
| `.transpo-page-title` … `.transpo-meta` | Type roles |
| `.carrieros-*` | Legacy aliases |

---

## Adoption rule

When JS needs a raw number → `tokens.ts`.
When styling in CSS/Tailwind → CSS variables.
When semantic soft chips → `TRANSPO_COLORS`.
**Do not** hardcode hex in new components unless adding a documented token first.
