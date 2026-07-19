# 08 — Table Patterns

**Documentation only.** Enterprise data density without TMS zebra clutter.

---

## Philosophy

- Prefer **scannable rows** and progressive columns over spreadsheet chrome.
- Sticky header, clear sort, filters as chips — not a wall of controls.
- Primary entity name is always the strongest text in the row.
- No zebra striping by default; use hover wash (`--primary-soft` or elevated) and spacing.

---

## Anatomy

```
[ Search ] [ Filters ▾ ] [ Saved views ▾ ]     [ Columns ] [ Export ]
────────────────────────────────────────────────────────────────────
│ ☑ │ Primary · meta     │ Status │ Owner │ Updated │ ⋯ │
────────────────────────────────────────────────────────────────────
[ Bulk bar when selected ]                    [ Pagination ]
```

---

## Capabilities (target enterprise)

| Feature | Behavior |
|---------|----------|
| Sort | Click header; aria-sort; one primary sort visible |
| Filter | Chip bar + optional drawer for advanced |
| Search | Debounced; searches visible entity fields |
| Column chooser | Show/hide; persist per user/view |
| Resizable columns | Drag edge; min widths; persist |
| Group | Optional group-by (status, dispatcher); collapsed groups OK |
| Bulk actions | Appear in sticky bar when ≥1 selected; confirm destructive |
| Saved views | Named filter+column+sort presets |
| Export / import | Export current view; import via Migration/docs flows with validation |
| Pagination | Page size + range; sticky footer optional |
| Sticky headers | Stay visible on vertical scroll |

---

## Progressive disclosure

**Default columns:** identity, status, one key metric, owner/assignee, updated.
**More:** column chooser or row expand / drawer detail — not 20 columns on first paint.

---

## Row patterns

| Element | Style |
|---------|-------|
| Primary | 14px regular/semibold foreground |
| Secondary meta | 12px muted under or beside |
| Status | Pill + label |
| Actions | Overflow ⋯ for secondary; one inline action max |
| Hover | Subtle elevated or primary-soft |
| Selected | Soft primary BG |

---

## Empty & loading

- Loading: skeleton rows matching column layout.
- Empty: `EmptyState` with reason + CTA (not empty `<table>`).
- No results for filters: “No matches” + Clear filters.

---

## Do / Don’t

| Do | Don’t |
|----|--------|
| Soft header BG (`--surface-elevated`) | Heavy grid, gray zebra |
| Truncate + tooltip | Wrap 5-line cells |
| Sticky first column if horizontal scroll | Horizontal scroll by default on desktop |
| Confirm bulk delete/void | Silent bulk mutations |
| Permission-gate actions | Show forbidden actions as dead clicks |
