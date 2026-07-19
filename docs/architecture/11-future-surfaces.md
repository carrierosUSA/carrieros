# 11 — Future Surfaces (Independent Modules)

## Purpose

Surfaces that must remain **independently evolvable** so the ops monolith can scale without locking Marketplace, Driver App, or Public APIs into a single release train forever.

They exist in the repo today as modules/routes; this doc defines their target independence.

---

## Driver App

| Item | Detail |
|------|--------|
| Routes | `app/driver/*` |
| Libs | `lib/driver-app`, `lib/driver-mobile` |
| Clients | Mobile web first; native wrappers optional later |
| Offline | Queue mutations; sync with conflict visibility |
| Scope | Assigned trips, documents/OCR upload, DVIR, expenses, messages, wallet view, Alph (gated) |

**Independence rules:**

- Consumes private API / BFF contracts — not ops RSC internals
- Own shell, performance budget, offline semantics
- AuthZ: driver self + assignments only
- Extractable as separate deployable in Phase 2 if release cadence diverges

**Do not overengineer:** one codebase (Next) until native store requirements force a split.

---

## Marketplace / Exchange

| Item | Detail |
|------|--------|
| Routes | `app/exchange/*`, `app/marketplace` |
| Libs | `lib/exchange` |
| Scope | Listings, orders, auctions, sellers, insights, enterprise boards |

**Independence rules:**

- Separate bounded context and tables (`exchange_*`)
- May use Network/Wallet for trust signals via published APIs — not direct table joins from UI
- Higher cache/CDN suitability for public catalog pages
- Moderation, fraud, and payout concerns isolated from dispatch OLTP

Phase 2: extract read-heavy catalog + search; keep order writes strongly consistent.

---

## Public APIs & Developer Platform

| Item | Detail |
|------|--------|
| Product | `/platform/developers`, apps/partners under `app/platform/*` |
| Libs | `lib/platform` |
| Scope | OAuth apps, webhooks, OpenAPI, partner directory |

**Independence rules:**

- Versioned HTTP API ([06](./06-apis.md))
- Scopes ⊂ permission catalog
- Same AI/approval gates as first-party UI
- Rate limits and abuse monitoring dedicated

---

## Wallet / Trust / Network

Already modular (`lib/wallet`, `lib/network`). Treat as **identity & reputation platform** shared by ops, Driver App, and Exchange:

- Explicit share grants
- Portable professional identity (`/network/p/[transpoId]`)
- Never silently expose carrier PII to the public graph

Can deploy with core early; extract when social graph traffic dominates.

---

## Platform / App Store

`lib/platform` + `/platform/apps`, ecosystem, automation, translation.

- Third-party apps call Public API
- Installation grants least-privilege scopes
- Constitution & trust charter pages remain first-party governance, not app plugins

---

## Extraction checklist (any surface)

Before splitting a deployable:

1. Stable API contract + versioning
2. Separate data ownership (or clear ACL views)
3. Independent observability and rate limits
4. No import of ops-only UI packages
5. AuthN story for that surface documented

Until then: **modular monolith folders are enough**.
