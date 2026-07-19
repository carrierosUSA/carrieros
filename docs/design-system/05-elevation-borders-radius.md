# 05 — Elevation, Borders & Radius

**Documentation only.** Shadows stay minimal; structure comes from surfaces and spacing.

---

## Philosophy

- Prefer **background shifts** (`--canvas` → `--surface` → `--surface-elevated`) over stacked drop shadows.
- Borders are **soft neutrals**, used sparingly.
- Cards often use **inset 1px** (`box-shadow: inset 0 0 0 1px var(--border-subtle)`) instead of heavy outlines — see `.transpo-card` / `.transpo-panel`.

---

## Radius

| Token | px | CSS | TS | Use |
|-------|-----|-----|-----|-----|
| sm | 8 | `--radius-sm` | `TRANSPO_RADIUS.sm` | Inputs, small chips, tooltips |
| md | 12 | `--radius-md` | `md` | Buttons, panels, icon wells |
| lg | 16 | `--radius-lg` | `lg` | Cards, PageShell, empty states |
| xl | 20 | `--radius-xl` | `xl` | Large hero panels, driver sheets |

Avoid `rounded-full` for large containers. Pills OK for status badges only when height is small.

---

## Borders

| Token | Hex | CSS | Use |
|-------|-----|-----|-----|
| Default | `#DDE2EA` | `--border` | Inputs, secondary buttons, dividers |
| Subtle | `#EAEAEA` | `--border-subtle` | Card/panel inset rings |
| Focus / soft blue | `#BFDBFE` | via `TRANSPO_COLORS.info.border` | Hover accent on secondary controls |

**Do:** one subtle separator.
**Don’t:** nested bordered boxes, zebra grid lines, thick 2px chrome everywhere.

---

## Shadows (minimal)

| Token | Value | CSS / TS |
|-------|-------|----------|
| sm | `0 4px 16px rgba(15, 23, 42, 0.04)` | `--shadow-sm` / `TRANSPO_SHADOW.sm` |
| md | `0 8px 24px rgba(15, 23, 42, 0.06)` | `--shadow-md` / `TRANSPO_SHADOW.md` |
| focus | `0 0 0 2px rgba(147, 197, 253, 0.8)` | `--shadow-focus` |

| Elevation | When |
|-----------|------|
| 0 (flat / inset border) | Default cards, tables, forms |
| sm | Floating menus, dropdowns |
| md | Modals, command palette, toasts |
| focus | Keyboard focus only |

**Don’t:** multi-layer neon glows, large colored shadows on primary UI (Driver Alph FAB is a rare intentional exception — keep isolated).

---

## Surface primitives (existing)

| Class | Behavior |
|-------|----------|
| `.transpo-surface` | White, radius-lg |
| `.transpo-panel` | Elevated fill + subtle inset |
| `.transpo-card` | Surface + subtle inset |

Use these before inventing new card wrappers.
