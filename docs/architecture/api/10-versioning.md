# 10 — Versioning Strategy

**Status:** Target design

---

## URL version

Durable HTTP API lives under:

```text
/api/v1/...
```

| Rule | Detail |
|------|--------|
| Current | `v1` is the only published version |
| Additive | New fields, new optional query params, new endpoints — **no** bump |
| Breaking | Remove/rename fields, change meaning, stricter auth — **`/api/v2`** |
| Deprecation | Announce ≥ **6 months**; dual-run when feasible |
| Server Actions | **Not** a public versioned contract — may churn with UI |

---

## What counts as breaking

- Renaming JSON fields
- Changing error `code` semantics
- Changing default pagination behavior in a incompatible way
- Removing permissions that silently alter access (communicate; migrate clients)
- Changing money units without adapter period

---

## Headers (optional complement)

- `X-API-Version: 2026-07-19` date versions **may** be added later for public API fine-grained compat
- Until then, URL `/api/v1` is sufficient for private BFF

---

## Public developer API (future)

May:

- Share `/api/v1` with API-key auth, or
- Use `/api/public/v1` to isolate rate limits

Same Constitution gates; no AI approve shortcuts. OpenAPI published from `/platform/developers` when launched.

---

## Health & meta

| Path | Versioned? |
|------|------------|
| `/api/v1/health` | Yes (under v1) |
| Future `/api/health` | Optional unversioned liveness for probes only — no tenant data |

---

## Related

- Structure: [02-structure.md](./02-structure.md)
- Overview: [`../06-apis.md`](../06-apis.md)
