# 06 — Component Library

**Documentation only — specs for the permanent kit.** Map to existing code; build missing primitives in Phase 2 of the roadmap, not in this pack.

---

## Inventory (today)

| Component | Location | Status |
|-----------|----------|--------|
| PageShell | `components/ui/PageShell.tsx` | Exists |
| EmptyState | `components/ui/EmptyState.tsx` | Exists |
| FadeIn | `components/ui/FadeIn.tsx` | Exists |
| Skeleton | `components/ui/Skeleton.tsx` | Exists |
| SearchCombobox | `components/ui/SearchCombobox.tsx` | Exists |
| ActionTooltip | `components/ui/ActionTooltip.tsx` | Exists |
| Command palette | `components/command-palette/CommandPalette.tsx` | Exists |
| Side nav | `components/Sidebar.tsx` | Exists |
| Buttons (CSS) | `.transpo-btn-primary` / `.transpo-btn-secondary` | Exists (CSS) |
| Surfaces | `.transpo-card` / `.transpo-panel` | Exists (CSS) |
| Driver shell | `components/driver-mobile/*` | Exists |
| Button / Input / Dialog (shared React) | — | **Target** — consolidate from ad-hoc |

---

## Control heights

| Size | Height | Token |
|------|--------|-------|
| sm | 32px | `--control-height-sm` / `TRANSPO_CONTROL.sm` |
| md | 40px | `--control-height` / `md` |
| lg | 44px | `--control-height-lg` / `lg` (touch / driver) |

---

## Buttons

**Anatomy:** icon (optional) + label · height md · radius-md · 14px / 600

| Variant | Style | Use |
|---------|-------|-----|
| Primary | `.transpo-btn-primary` sapphire fill, white text | One primary action per region |
| Secondary | `.transpo-btn-secondary` surface + border | Cancel, alternate |
| Ghost | Text/muted, no fill | Tertiary inline |
| Destructive | Critical text or soft red BG | Delete / void — always confirm |
| Disabled | Reduced opacity + `ActionTooltip` reason | Never silent dead click |

**States:** default · hover · focus-visible (focus ring) · disabled · loading (spinner replaces icon, keep label width).

**Do:** one primary per card/header. **Don’t:** multiple equal-weight blue buttons.

---

## Inputs

**Anatomy:** label (13/500 muted) · control · helper/error

| State | Treatment |
|-------|-----------|
| Default | Border `--border`, radius-sm/md, height 40 |
| Focus | `--shadow-focus`, no harsh outline |
| Error | Critical border + text message below |
| Disabled | Disabled BG/text |
| Auto-filled | Subtle info tint (SearchCombobox `autoFilled`) |

Pair with [09-forms.md](./09-forms.md).

---

## Dropdowns / Select

- Same height as inputs; menu elevation `shadow-sm`/`md`.
- Keyboard: arrows, Enter, Escape.
- Prefer SearchCombobox when options are long or searchable.

---

## Search

- Global: Command Palette (⌘K / Ctrl+K).
- Local: input with search icon, clear button, 40px height.
- Debounce server search; show empty state, not blank panel.

---

## Filters

- Chip row or compact filter bar above lists/tables.
- Active filters as removable chips (info soft BG).
- “Clear all” when ≥2 active.
- Advanced filters in disclosure / drawer — not all visible by default.

---

## Cards

- `.transpo-card` or PageShell children.
- Title 15/600 · body 14 · optional footer actions.
- Equal heights in dashboard grids.
- **Do:** spacing hierarchy. **Don’t:** card-in-card borders.

---

## Tables

See [08-table-patterns.md](./08-table-patterns.md). Prefer scannable rows; avoid zebra stripes and heavy gridlines.

---

## Badges & status pills

| Tone | Classes | Example |
|------|---------|---------|
| info / success / warning / critical / disabled | `TRANSPO_COLORS.*` | Compliance, load status |

Pill: small padding (4–8), radius full or md, 12px medium text + optional icon. **Always include text label.**

---

## Alerts

Inline banner: soft semantic BG + border + icon + title + body + optional action.
Roles: `info` | `success` | `warning` | `critical`.
Dismissible only when not blocking compliance.

---

## Toasts

- Elevation md, radius-md, auto-dismiss ~4–6s (errors longer / sticky).
- One toast stack corner; don’t steal focus from confirmations.
- Critical confirmations use **dialogs**, not toasts.

---

## Dialogs / modals

- Centered, surface, shadow-md, radius-lg, max-width by purpose (sm confirm / md form).
- Title + short description + primary/secondary actions.
- Trap focus; Escape cancels non-destructive.
- Critical AI / money / compliance → constitution confirmation copy ([14-ai-surfaces.md](./14-ai-surfaces.md)).

---

## Drawers

- Right (ops detail) or bottom (mobile / driver).
- Same surface tokens; don’t nest drawers.
- Primary action sticky in footer on mobile.

---

## Tabs

- Text tabs with underline or soft selected pill — not heavy boxed tab strips.
- Selected: primary text + indicator.
- Keep ≤6 visible; overflow into “More”.

---

## Accordions

- For progressive disclosure of secondary detail only.
- Chevron + title; don’t hide primary status inside collapsed defaults.

---

## Side nav

- `Sidebar.tsx`: module-aware, permission-filtered.
- Active: soft primary BG or primary text — calm, not neon.
- Icons Lucide 16–20 + label; collapse to icons on laptop.

---

## Top nav

- Optional context bar: breadcrumbs, environment, user menu, command trigger, Alph entry.
- Keep height compact; no competing brand hero in ops app.

---

## Breadcrumbs

- 12–13px muted; current page foreground medium.
- Truncate middle on small widths.

---

## Pagination

- Prev/next + page size; show range (“1–25 of 200”).
- Prefer cursor/infinite only when latency demands — default numbered/simple for enterprise lists.

---

## Progress

- Linear for uploads/migrations; determinate when %.
- Circular sparingly for single KPI.
- Always pair with text status.

---

## Upload areas

- Dashed subtle border, elevated soft BG, icon + “Drop or browse”.
- Show file type/size limits in meta text.
- Error = critical alert, not toast-only.

---

## Empty states

- `EmptyState`: icon well · title · description · one CTA.
- Explain why empty and what to do next.

---

## Loading & skeletons

- `Skeleton` shimmer on canvas/surface tones — never blank white page.
- Match layout geometry (KPI blocks, rows).
- `loading.tsx` route segments preferred.

---

## Charts / graphs

- Semantic series colors from palette; muted axes/grid (`--border-subtle`).
- Tooltips: 12–13px, high contrast.
- Empty chart → EmptyState, not empty axes.
- Accessibility: summary text or data table alternative for critical metrics.

---

## Date pickers

- Consistent 40px trigger; calendar popover shadow-sm.
- Show timezone when ops-critical (dispatch appointments).
- Range clear and presets (“Today”, “This week”) when useful.

---

## Command palette

- `CommandPalette`: grouped results, category icons, keyboard-first.
- Raycast-like speed; recent + jump-to + actions.
- Respect permissions — never show unauthorized targets as runnable.

---

## Universal do / don’t

| Do | Don’t |
|----|--------|
| Reuse tokens and existing ui/* | One-off hex and shadow snowflakes |
| Disable + reason | Dead clicks |
| Plain labels | Icon-only critical actions without aria-label |
| One primary action | Competing CTAs |
