# 13 — Accessibility

**Documentation only.** Target WCAG **AA** as floor; AAA for long-form text where practical.

---

## Keyboard

- All interactive controls focusable in logical order.
- Visible focus: `--shadow-focus` (never `outline: none` without replacement).
- Dialogs/command palette: focus trap + Escape to close.
- Tables: sort headers activatable by keyboard; row actions reachable.
- Skip link to main content recommended for ops shell.

---

## Screen readers

- Meaningful `aria-label` on icon-only controls.
- Live regions for toasts and async status (`role="status"` on EmptyState already).
- Dialogs: `role="dialog"` + labelled by title.
- Don’t rely on visual position alone (“click the blue button on the right”).

---

## Contrast

See [02-color-system.md](./02-color-system.md).

- Body/text on canvas/surface must meet AA.
- Muted text OK for meta; not for primary instructions.
- Placeholder text is not a label substitute.

---

## Status not color-only

Every status uses **text and/or icon + color**.
Charts: pattern or label in addition to hue when conveying meaning.

---

## Forms

- Labels associated with inputs (`htmlFor` / `aria-labelledby`).
- Errors linked via `aria-describedby` / `aria-invalid`.
- Required fields announced; don’t use color-only asterisks without text.
- Disabled controls explain why (`ActionTooltip` / `aria-describedby`).

---

## Motion

Honor `prefers-reduced-motion` ([11-motion.md](./11-motion.md)).
Never leave content invisible after a failed animation.

---

## Touch & hit targets

- Minimum ~40px ops; **44px** Driver / touch.
- Adequate spacing between destructive and primary actions.

---

## Testing checklist (lightweight)

- [ ] Keyboard-only path for primary task
- [ ] Focus visible on all controls
- [ ] Status readable in grayscale
- [ ] Form errors announced
- [ ] Reduced motion doesn’t blank the page
