# 09 — Forms

**Documentation only.** Forms should feel fast, calm, and low-click.

---

## Goals

- Minimal fields on first step; progressive disclosure for advanced.
- Inline validation; clear errors next to fields.
- Autosave drafts where interruption is common (long load entry, migrations) — with visible “Saved” / “Saving” meta.
- Never submit critical AI-driven mutations without confirmation ([14-ai-surfaces.md](./14-ai-surfaces.md)).

---

## Structure

1. **Title + one-line purpose** (PageShell or dialog header)
2. **Grouped sections** (15px section titles)
3. **Fields** — label above control (13/500 muted)
4. **Primary actions** — sticky footer in dialogs/drawers

Prefer single column for cognitive ease; two columns only for related short fields (city / state).

---

## Validation

| Timing | Rule |
|--------|------|
| Blur | Validate completed fields |
| Submit | Validate all; focus first error |
| Async | Show pending on unique checks (DOT, email) |

Error text: 12–13px critical, below control.
Success checkmarks only when helpful (verification flows).

---

## Autosave

| Appropriate | Not appropriate |
|-------------|-----------------|
| Long multi-section drafts | Payments, compliance certifications |
| Settings preferences | Irreversible deletes |
| Migration mapping drafts | Anything requiring explicit approval tier |

Show last saved time in meta. Conflict → explain and ask human.

---

## Controls

- Heights: 40px default; 44px touch (Driver).
- SearchCombobox for searchable selects.
- Date/time with timezone when dispatch-critical.
- Upload: dedicated drop zone ([06-component-library.md](./06-component-library.md)).
- Disabled + `ActionTooltip` reason when prerequisites missing.

---

## Clicks & wizards

- Prefer one screen + disclosure over multi-step wizards.
- Wizard only for legally required sequences or Migration Center flows — progress indicator required.
- Primary label = verb (“Create load”, “Send invoice”).

---

## Do / Don’t

| Do | Don’t |
|----|--------|
| Smart defaults | Empty required fields that could be inferred with review |
| Plain helper text | Placeholder-as-label only |
| Confirm destructive | Instant delete |
| Keyboard tab order logical | Trap focus incorrectly in dialogs |
