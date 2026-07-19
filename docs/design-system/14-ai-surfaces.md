# 14 — AI Surfaces (Alph)

**Documentation only.** UI must implement `/constitution` — AI assists; humans decide.

---

## Scope

Alph appears in: command center, copilots (`/alph/copilot/*`), floating entry, Driver assistant, executive summaries, recommendations on dashboards, OCR/document suggestions, Migration Center assists.

Runtime policy helpers: `lib/ai-safety/` (confirmations, automation levels). **Constitution folder wins on conflict.**

---

## Permanent UI rules

| Rule | UI requirement |
|------|----------------|
| Assist, don’t operate the business | Copy says “Suggested”, “Draft”, “Needs your confirmation” |
| Never hide uncertainty | Confidence badge + missing fields called out |
| No silent critical actions | Modal confirmation with summary of impact |
| Explainability | One-line why + source/context when available |
| Auditability | Visible that action was AI-assisted when logged in product UI |
| Reversible when possible | Undo / discard draft paths |

---

## Alph panel anatomy

1. **Header** — Alph + role context (dispatcher, safety, etc.)
2. **Context banner** — what data the suggestion uses (RoleContextBanner pattern)
3. **Suggestion cards** — title · body · confidence · actions
4. **Composer / command** — user intent; never auto-send critical tools
5. **Policy notice** — short link to AI policy / governance when relevant

Visual: calm surface, sapphire accents, `Sparkles` icon consistency — not sci-fi neon.

---

## Confidence badges

| Level | Treatment | Copy examples |
|-------|-----------|---------------|
| High | Success soft pill | High confidence |
| Medium | Warning soft pill | Review recommended |
| Low / unknown | Disabled or warning | Low confidence · Verify |
| Blocked | Critical | Insufficient data |

Never show a green “Approved” badge for AI output — approval is a **human** action.

---

## Confirmation modals

Required for critical tiers (payments, compliance attestations, bulk destructive, sending binding docs, automation that changes ops state):

- What Alph proposes (plain language)
- Impact / entities affected
- Uncertainty / assumptions
- **Confirm** (primary) / **Cancel** (secondary)
- Optional: edit before confirm

Do not use toasts for these confirmations.

---

## Policy notices

- Short, readable, non-modal when informational.
- Link to `/platform/ai-policy` or `/legal/ai-policy` as appropriate.
- Migration Center and OCR: state that extracted data needs human verification before trust.

---

## Recommendations on dashboards

- Separate section titled as Alph recommendations.
- Each item dismissible; confirming routes through the same approval rules.
- Empty state: “No suggestions right now” — not fake filler tips.

---

## Do / Don’t

| Do | Don’t |
|----|--------|
| Show confidence and next human step | Auto-execute critical paths for convenience |
| Use semantic warning when unsure | Fake 99% certainty |
| Keep Alph visually consistent | Purple glow “AI theme” fork |
| Reuse `lib/ai-safety` levels | Parallel approval UI that weakens constitution |
