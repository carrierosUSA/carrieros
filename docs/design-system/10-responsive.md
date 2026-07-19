# 10 — Responsive & Surfaces

**Documentation only.**

---

## Breakpoints (target)

| Name | Width | Shell |
|------|-------|-------|
| Mobile | &lt;768px | Single column; Driver bottom nav |
| Tablet | 768–1023px | Collapsed side nav / drawer |
| Laptop | 1024–1279px | Side nav + content |
| Desktop | ≥1280px | Full ops chrome; wide tables |
| Wide | ≥1560px | PageShell max content width |

Align Tailwind `sm` / `md` / `lg` usage to these intents; don’t invent one-off breakpoints per page.

---

## Ops web (desktop → mobile browser)

| Concern | Desktop | Tablet | Mobile browser |
|---------|---------|--------|----------------|
| Nav | Sidebar | Collapsible / drawer | Drawer or top menu |
| KPIs | 4-up | 2-up | 1-up |
| Tables | Full + sticky header | Horizontal scroll key cols / card list alternative | Card list preferred |
| PageShell padding | 24 | 16–20 | 16 |
| Dialogs | Center modal | Center / full | Full-screen sheet |

Touch targets ≥44px on coarse pointers.

---

## Driver App (current + future)

Existing: `/driver/*`, `components/driver-mobile/*`, light/dark tokens (`.driver-mobile`).

| Pattern | Spec |
|---------|------|
| Bottom nav | 4–5 primary destinations; active = sapphire; badge for counts |
| Safe areas | `env(safe-area-inset-*)` |
| Trip-first | Current load/trip dominates home |
| Thumb zone | Primary CTAs lower half |
| Offline | Visible indicator; queue with human-visible sync state |
| Alph | Assistive entry; confirm critical ([14-ai-surfaces.md](./14-ai-surfaces.md)) |
| Spacing | `--dm-space-*` same 4–32 scale |
| Type | Same Geist; slightly larger body (15–16) for road glance |

**Do:** large tap targets, plain status. **Don’t:** dense multi-column tables in the cab.

---

## Future native Driver App

Reuse this token language (sapphire-charcoal, spacing, semantics). Navigation may map bottom tabs 1:1 with web Driver shell for mental model continuity.

---

## Content reflow rules

1. Stack before squeeze.
2. Hide secondary columns before shrinking type below 12px.
3. Keep primary CTA visible without horizontal scroll.
4. Never rely on hover-only actions on touch.
