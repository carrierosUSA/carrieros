# 70 — Relationship & FK Validation Approach

**Status:** Process documentation — no live schema to validate yet.
**Goal:** When SQL is applied, prove relationships match the design pack without data loss.

---

## 1. Validation layers

| Layer | What it proves |
|-------|----------------|
| **Schema review** | Catalog FKs match ownership directions ([01-principles.md](../01-principles.md) §3) |
| **DDL constraints** | Postgres rejects orphan inserts |
| **RLS tests** | Tenant cannot see/write foreign company children |
| **App repository tests** | Soft-delete + unique partials behave |
| **Migration import checks** | Import order respects FK parents |

---

## 2. Ownership directions (must hold)

```text
companies
  └── almost all tenant tables (company_id)

loads
  ├── load_stops
  ├── dispatch_assignments
  └── load_status_history

drivers / trucks / trailers
  └── licenses, medical, fuel, maintenance, asset_assignments

documents
  ├── document_versions → document_ocr_*
  ├── document_tags
  └── document_links  (→ polymorphic entity; no reverse FK forest)

invoices
  ├── invoice_line_items
  └── ← payment_allocations ← payments

parties
  ├── party_contacts / party_locations
  └── ← loads customer/broker FKs
```

**Forbidden:** required bidirectional FKs (`loads.invoice_id` + `invoices.load_id` both NOT NULL). Prefer `invoices.load_id`; optional non-FK cache on load.

---

## 3. SQL integrity checks (run after apply / restore)

```sql
-- NOT APPLIED environment — run against staging after migrations

-- Orphan children examples (expect 0 rows)
SELECT s.id FROM load_stops s
LEFT JOIN loads l ON l.id = s.load_id
WHERE l.id IS NULL;

SELECT a.id FROM dispatch_assignments a
LEFT JOIN loads l ON l.id = a.load_id
WHERE l.id IS NULL;

SELECT v.id FROM document_versions v
LEFT JOIN documents d ON d.id = v.document_id
WHERE d.id IS NULL;

SELECT li.id FROM invoice_line_items li
LEFT JOIN invoices i ON i.id = li.invoice_id
WHERE i.id IS NULL;

-- Cross-tenant FK mismatch (child company_id ≠ parent)
SELECT s.id
FROM load_stops s
JOIN loads l ON l.id = s.load_id
WHERE s.company_id <> l.company_id;

SELECT v.id
FROM document_versions v
JOIN documents d ON d.id = v.document_id
WHERE v.company_id <> d.company_id;
```

Automate as a CI job against ephemeral DB once migrations exist.

---

## 4. Polymorphic references

`(entity_type, entity_id)` on activity, comments, attachments, document_links, AI:

| Phase | Integrity |
|-------|-----------|
| Phase B–C | Application validates existence within `company_id` |
| Later optional | Trigger or scheduled sweeper flags orphans — not required day one |

Do not explode into dozens of nullable FKs for every entity type.

---

## 5. Soft-delete cascade policy

- DB: **no** `ON DELETE CASCADE` for business soft-delete (preserves audit)
- App: orchestrate child soft-deletes when product requires
- Hard delete / GDPR: explicit workflow + `audit_logs`

Validate restores do not leave children with `deleted_at IS NULL` under deleted parents if product forbids it (domain test).

---

## 6. Import order (Migration Center)

1. `companies` → `users` → memberships / roles
2. `parties` (+ contacts/locations)
3. `drivers`, `trucks`, `trailers` → assignments
4. `loads` → `load_stops` → `dispatch_assignments`
5. `documents` → versions → links → OCR
6. Finance (invoices → lines → payments → allocations → settlements)
7. Activity / notifications / audit (or rebuild once)

Fail batch rows that violate FKs into `import_rows` remediation — never silent drop.

---

## 7. Acceptance criteria (no data loss)

- [ ] All catalog FKs created as additive constraints
- [ ] Orphan queries return 0 on staging seed
- [ ] Cross-tenant company_id mismatch queries return 0
- [ ] Partial unique indexes allow re-use of reference after soft delete
- [ ] Backup restore drill passes same checks ([60-backup-dr.md](./60-backup-dr.md))
- [ ] Frontend board DTOs still populate via repositories (compatibility)
