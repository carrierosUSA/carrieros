# 11 — Motion

**Documentation only.** Motion is subtle, fast, and professional — presence without noise.

---

## Principles

- Duration short: **150–350ms** for UI; avoid multi-second decorative motion.
- Ease: `ease` / `ease-out` — no bouncey spring on enterprise chrome.
- Purpose: hierarchy, enter/exit, feedback — not ornament.
- **Never leave content stuck at opacity 0.**

---

## Existing keyframes (`globals.css`)

| Name | Use |
|------|-----|
| `carrieros-fade-in` | Soft enter: opacity 0→1 + 6px rise |
| `carrieros-shimmer` | Skeleton loading |
| `carrieros-draw-line` | Occasional path draw (maps/charts) |
| `transpo-pulse-soft` | Gentle attention (use sparingly) |

---

## FadeIn rules

Component: `components/ui/FadeIn.tsx`.

| Rule | Why |
|------|-----|
| Start with `opacity-100` in class list | Avoid blank white if animation interrupted |
| Use `forwards` carefully — **do not** use fill-mode `both` with initial opacity 0 | Interrupted animation can leave invisible content |
| Prefer ~0.35s ease-out | Matches current implementation |
| Skip animation when `prefers-reduced-motion: reduce` | A11y |

Target CSS addition (when implementing — not in this pack):

```css
@media (prefers-reduced-motion: reduce) {
  .animate-\[carrieros-fade-in_*\],
  .carrieros-reduce-motion {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
```

---

## Allowed motion

| Pattern | Spec |
|---------|------|
| Page / section enter | FadeIn once |
| Hover | Color/border 150ms |
| Modal / palette | Fade + slight scale or rise, 200–250ms |
| Toast | Slide/fade in-out |
| Skeleton | Shimmer continuous until data |
| Button loading | Spinner replace icon |

---

## Disallowed

- Parallax hero noise in ops app
- Infinite attention pulses on critical alerts (use static critical styling)
- Staggered 20-item cascades that delay comprehension
- Opacity-only mounts without fallback visible state

---

## Reduced motion

Honor `prefers-reduced-motion: reduce`: instant state changes, no decorative transform, skeletons may use static elevated block instead of shimmer.
