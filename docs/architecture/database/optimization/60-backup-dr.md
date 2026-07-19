# 60 — Backup & Disaster Recovery Strategy

**Status:** Strategy documentation — no production DB yet.
**Target platform:** PostgreSQL on Supabase (assumed); adjust vendor knobs without changing principles.

---

## 1. Objectives (when DB goes live)

| Objective | Initial target (T0–T2) | Enterprise (T3+) |
|-----------|------------------------|------------------|
| **RPO** | ≤ 24h (prefer PITR continuous) | ≤ 1h (PITR) |
| **RTO** | ≤ 8h | ≤ 1–2h with runbook |
| **Integrity** | No silent cross-tenant restore mixups | Verified tenant restore drills |

Tune with customer contracts; never promise zero RPO without streaming HA.

---

## 2. Backup layers

| Layer | What | Frequency |
|-------|------|-----------|
| **Managed automated backups** | Supabase/Postgres daily + WAL/PITR | Platform default; enable PITR in prod |
| **Logical dumps (optional)** | `pg_dump` schema+data for critical tenants / staging refresh | Weekly or on-demand |
| **Object storage** | Document bytes / exports | Versioning + cross-region optional |
| **Config as code** | Migrations, RLS, seed catalogs in git | Every release |
| **Audit / migration history** | `audit_logs`, `migration_jobs` | Included in DB backups |

Application secrets stay in vault — not in DB dumps shared widely.

---

## 3. What to back up vs regenerate

| Must restore | Rebuildable |
|--------------|-------------|
| Tenant business rows | Materialized board caches |
| Documents metadata + storage keys | `search_vector` (re-index) |
| Versions / OCR structured fields | Embedding tables (re-job) |
| Finance, settlements, memberships | Insight snapshots |
| Audit logs (retention policy) | Outbox published rows (after retention) |

---

## 4. Retention (starting policy — legal may override)

| Data class | Hot DB | Backup retention |
|------------|--------|------------------|
| Active ops (loads, fleet, finance) | Online | DB backups ≥ 30 days PITR window as purchased |
| Audit logs | Online 12–24 months then archive | Align with compliance |
| GPS raw points | 30–90 days then aggregate | Short |
| Soft-deleted rows | Retain until hard-erase workflow | Included |
| Object storage | Lifecycle rules per bucket | ≥ DB backup window |

---

## 5. Disaster scenarios & response

| Scenario | Response |
|----------|----------|
| Accidental DELETE / bad migration | PITR to timestamp before event; prefer forward-fix if small |
| Region outage | Fail over per Supabase/HA plan; document DNS/app env cutover |
| Ransomware / credential theft | Rotate keys; restore from immutable backup; audit access |
| Single-tenant corruption | Logical restore to isolated DB → selective copy with `company_id` filter |
| Storage object loss | Restore bucket version; DB keys remain valid |

**Never** restore prod backup over prod without a written window and checksum validation.

---

## 6. Restore drill (required before calling DR “done”)

Quarterly (or first production month):

1. Restore latest backup to **isolated** project
2. Run FK / RLS smoke tests ([70-fk-validation.md](./70-fk-validation.md))
3. Log in as two demo tenants — confirm isolation
4. Spot-check load → stops → invoice → document link
5. Record RTO achieved; fix runbook gaps

---

## 7. Migration Center interaction

Imports/exports are customer data movements — each job recorded in `migration_jobs` / `import_batches`. DR restores must not auto-replay half-applied migration jobs; operators re-run with explicit approval (Constitution: humans decide).

---

## 8. Pre-production checklist

- [ ] PITR enabled on production project
- [ ] Backup retention purchased/configured
- [ ] Object storage versioning on document buckets
- [ ] Runbook in ops wiki + `/platform` governance pointer
- [ ] First restore drill completed
- [ ] Service role keys rotated runbook exists
