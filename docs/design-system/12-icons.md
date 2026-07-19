# 12 — Icons

**Documentation only.**

---

## Library

**Lucide React** (`lucide-react`) — already used across ops, Alph, Driver, Exchange, Sidebar.

Do not introduce a second icon set (Heroicons, Font Awesome, etc.) without an explicit migration. Custom brand marks only for Transpo/Alph logos.

---

## Sizes

| Token | px | CSS | Use |
|-------|-----|-----|-----|
| sm | 14 | `--icon-sm` | Inline with meta, dense chips |
| md | 16 | `--icon-md` | Default nav, buttons, table |
| lg | 20 | `--icon-lg` | Empty states, emphasis |
| xl | 24–28 | — | Driver primary actions sparingly |

EmptyState icon well uses **20px** icon in 40×40 well (radius-md).

---

## Stroke

- Default stroke **~1.75–2** (EmptyState uses `1.9`).
- Keep stroke consistent within a view — don’t mix bold filled and hairline randomly.
- Prefer outline Lucide icons; filled only for selected nav or critical alerts if needed for recognition.

---

## Color

| Context | Color |
|---------|-------|
| Default | `--muted` or `--foreground` |
| Interactive / active | `--primary` / `--color-info` |
| Success / warning / critical | Matching semantic token |
| On primary button | White |

---

## Pairing with labels

- **Nav, buttons, filters:** icon + text label.
- **Icon-only:** requires `aria-label` (and usually tooltip).
- **Status:** icon + text pill — never icon color alone.
- Alph: `Sparkles` is established — keep consistent.

---

## Do / Don’t

| Do | Don’t |
|----|--------|
| One metaphor per action | Duplicate icons with different meanings |
| Align to text cap height | Oversized icons crushing 14px labels |
| Reuse Sidebar metaphors | Novel icons per feature for the same concept |
