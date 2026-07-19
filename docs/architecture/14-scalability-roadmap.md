# 14 — Scalability Roadmap

## Purpose

How the architecture holds from 1 truck to 100,000+ without major redesign — and **when not to add complexity**.

---

## Scale tiers

### T0 — 1–10 trucks (Phase 1)

| Capability | Choice |
|------------|--------|
| Deploy | Single Next.js app |
| DB | One Postgres |
| Files | One private bucket |
| Jobs | In-process or lightweight managed queue |
| Search | SQL |
| Cache | Optional HTTP cache only |

**Do not overengineer:** no replicas, no Kubernetes, no microservice split, no search cluster.

---

### T1 — 10–100 trucks

| Add | Why |
|-----|-----|
| Background workers (shared repo) | OCR + imports must not block requests |
| CDN for static assets | Global UX |
| Better indexes + dashboard cache TTL | Board snappiness |
| Basic rate limits | Abuse protection |

**Do not overengineer:** still one primary DB; still modular monolith.

---

### T2 — 100–1,000 trucks

| Add | Why |
|-----|-----|
| Read replica (optional) | Heavy reports/analytics |
| Redis (or equiv.) | Sessions, rate limits, short dashboard cache |
| Fair queues per tenant | Noisy neighbor control |
| Observability baselines | Latency, error, queue depth SLOs |

**Do not overengineer:** no sharding; no multi-region active-active.

---

### T3 — 1,000–10,000 trucks

| Add | Why |
|-----|-----|
| Dedicated worker fleets | OCR, migration, notifications, ELD ingest |
| Search index if SQL FTS strained | Directory / Exchange |
| Tracking archival / partitions | Hot vs cold time-series |
| Stronger connection pooling | PgBouncer |
| Outbox publisher at scale | Reliable integrations |

**Do not overengineer:** extract services only for **measured** hotspots (tracking ingest, OCR), not for every domain.

---

### T4 — 10,000–100,000+ trucks

| Add | Why |
|-----|-----|
| Service extraction | Driver BFF, tracking ingest, search, public API gateway |
| Partitioning / tenant placement | Only if a tenant or table proves too large |
| Multi-AZ + DR runbooks | Enterprise contracts |
| Optional regional read | Latency-sensitive geographies |

**Do not overengineer:** avoid premature shard keys; prefer partition by time for tracking and by tenant only with evidence. No rewrite of domain model — keep contracts from Phase 1.

---

## Cross-cutting techniques

| Technique | When |
|-----------|------|
| **Caching** | Dashboard summaries, company settings, public Exchange pages |
| **Queues** | OCR, email, migration, webhooks processing |
| **Read replicas** | Analytics/reporting load |
| **CDN** | Static + public catalog media |
| **Background jobs** | Anything > few hundred ms or bursty |
| **Sharding** | Last resort after partitions + archival + extract |

---

## Capacity signals (act on metrics)

- p95 API latency rising with DB CPU
- Queue lag growing faster than workers can drain
- Table size / bloat on `tracking_points` or `audit_events`
- Connection saturation
- Single-tenant dominating shared workers

Automate alerts before architectural leaps.

---

## Compatibility promise

APIs, tenant column, permission strings, and AI confirmation taxonomy remain stable across tiers so growth is **ops and infra**, not product redesign.
